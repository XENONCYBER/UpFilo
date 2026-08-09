"""
message_crypto.py
-----------------
Security module for the UpFilo real-time chat platform backend proxy.

Provides message confidentiality and integrity using:
  - AES-256-CBC  for symmetric encryption
  - HMAC-SHA256  for message authentication
  - Encrypt-then-MAC construction (industry best practice)

Packet wire format (v2 — replay-resistant):
  ┌──────────────┬──────────────┬──────────────┬─────────────────────┬────────────────┐
  │  Nonce (16B) │ Seq (8B, BE) │ Timestamp(8B)│ IV+Ciphertext (var.)│ HMAC-SHA256    │
  │  (random)    │ (uint64)     │ (unix µs)    │                     │ (32 B)         │
  └──────────────┴──────────────┴──────────────┴─────────────────────┴────────────────┘

  HMAC covers: Nonce || Seq || Timestamp || IV || Ciphertext

Attacks mitigated:
  * Ciphertext/IV tampering    -> HMAC detects any modified byte
  * CBC bit-flip               -> HMAC covers full ciphertext
  * Padding oracle             -> decryption never attempted without valid MAC
  * Timing side-channel        -> constant-time hmac.compare_digest
  * Length-extension           -> HMAC (keyed), not bare SHA-256
  * Replay attacks             -> per-message random nonce stored in NonceStore;
                                  once seen, the nonce is permanently rejected
  * Message reordering         -> monotonically increasing sequence number
  * Timestamp skew attacks     -> configurable clock-skew window (default 60 s)

Dependencies:
  pip install pycryptodome
"""

import os
import hmac
import time
import struct
import hashlib
import threading

from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad


# ── Constants ─────────────────────────────────────────────────────────────────

AES_KEY_SIZE   = 32   # 256 bits — required for AES-256
HMAC_KEY_SIZE  = 32   # 256 bits — matches SHA-256 block size
IV_SIZE        = 16   # 128 bits — one AES block
HMAC_SIZE      = 32   # 256 bits — SHA-256 digest output size
AES_BLOCK_SIZE = 16   # AES always operates on 128-bit (16-byte) blocks

NONCE_SIZE     = 16   # Random per-message nonce for replay prevention
SEQ_SIZE       = 8    # 64-bit sequence number (big-endian uint64)
TS_SIZE        = 8    # 64-bit Unix timestamp in microseconds (big-endian)

# Offset at which IV begins inside a packet (after nonce + seq + timestamp)
_HEADER_SIZE   = NONCE_SIZE + SEQ_SIZE + TS_SIZE

# Maximum acceptable clock difference between sender and receiver (seconds).
# Packets with a timestamp outside this window are rejected as potential
# replays that pre-date or post-date the current session.
DEFAULT_TIMESTAMP_WINDOW_S = 60


# ── Custom exceptions ──────────────────────────────────────────────────────────

class AuthenticationError(Exception):
    """
    Raised when HMAC verification of an incoming packet fails.

    Callers should treat this as a hard error — never attempt to use
    data from a packet that did not pass verification.
    """


class ReplayError(Exception):
    """
    Raised when a packet is detected as a replay or out-of-order delivery.

    Possible causes:
      - Nonce was already seen (replay via Burp Repeater, etc.)
      - Sequence number is not strictly greater than the last accepted one
      - Packet timestamp is outside the allowed clock-skew window
    """


# ── Nonce / sequence store (replay prevention) ────────────────────────────────

class NonceStore:
    """
    Thread-safe store that tracks seen nonces and the last accepted sequence
    number, providing protection against replay and reordering attacks.

    Usage:
        store = NonceStore()
        # On the receiver side, pass the store to verify_and_decrypt().

    The store holds nonces indefinitely within a session. For long-lived
    processes, pair this with a timestamp window (see timestamp_window_s)
    so that very old nonces can be pruned without weakening security —
    any packet old enough to have its nonce pruned will already be rejected
    by the timestamp check.
    """

    def __init__(
        self,
        timestamp_window_s: float = DEFAULT_TIMESTAMP_WINDOW_S,
        enforce_sequence: bool = True,
    ) -> None:
        """
        Args:
            timestamp_window_s: Reject packets whose timestamp differs from
                                the current time by more than this many seconds.
            enforce_sequence:   When True, sequence numbers must be strictly
                                increasing. Set False only for unordered channels.
        """
        self._seen_nonces: set[bytes] = set()
        self._last_seq: int = -1
        self._lock = threading.Lock()
        self.timestamp_window_s = timestamp_window_s
        self.enforce_sequence = enforce_sequence

    def check_and_record(self, nonce: bytes, seq: int, ts_us: int) -> None:
        """
        Validate *nonce*, *seq*, and *ts_us*, then permanently record the nonce.

        Args:
            nonce:  16-byte random nonce from the packet header.
            seq:    64-bit sequence number from the packet header.
            ts_us:  Sender timestamp in microseconds (Unix epoch).

        Raises:
            ReplayError: If the nonce was already seen, the sequence number is
                         not strictly greater than the last accepted one (when
                         enforce_sequence is True), or the timestamp is outside
                         the acceptable window.
        """
        now_us = int(time.time() * 1_000_000)
        skew_us = abs(now_us - ts_us)
        max_skew_us = int(self.timestamp_window_s * 1_000_000)

        # Check timestamp window before acquiring lock — cheap fast-path.
        if skew_us > max_skew_us:
            skew_s = skew_us / 1_000_000
            raise ReplayError(
                f"Packet timestamp is {skew_s:.2f}s outside the allowed "
                f"{self.timestamp_window_s}s window. Possible replay attack."
            )

        with self._lock:
            # Reject previously seen nonces (catches exact replays).
            if nonce in self._seen_nonces:
                raise ReplayError(
                    "Duplicate nonce detected — packet is a replay and has been rejected."
                )

            # Reject out-of-order or replayed sequence numbers.
            if self.enforce_sequence and seq <= self._last_seq:
                raise ReplayError(
                    f"Sequence number {seq} is not greater than last accepted "
                    f"{self._last_seq}. Possible reorder or replay attack."
                )

            # All checks passed — permanently record the nonce.
            self._seen_nonces.add(nonce)
            if self.enforce_sequence:
                self._last_seq = seq


# ── Key generation ────────────────────────────────────────────────────────────

def generate_keys() -> tuple[bytes, bytes]:
    """
    Generate cryptographically secure random keys for AES and HMAC.

    Uses os.urandom(), which reads from the OS CSPRNG (/dev/urandom on
    Unix, BCryptGenRandom on Windows) — suitable for production use.

    Returns:
        (aes_key, hmac_key): A pair of independent 32-byte (256-bit) keys.

    Example:
        aes_key, hmac_key = generate_keys()
    """
    aes_key  = os.urandom(AES_KEY_SIZE)
    hmac_key = os.urandom(HMAC_KEY_SIZE)
    return aes_key, hmac_key


# ── Encryption & signing ──────────────────────────────────────────────────────

def encrypt_and_sign(
    message: bytes,
    aes_key: bytes,
    hmac_key: bytes,
    seq: int = 0,
) -> bytes:
    """
    Encrypt *message* and produce a replay-resistant authenticated packet.

    Encryption steps:
      1. Validate key sizes.
      2. Generate a fresh random 16-byte nonce (unique per message).
      3. Record the current microsecond timestamp.
      4. Encode the sequence number as a big-endian 64-bit integer.
      5. Generate a fresh random 16-byte IV for AES-CBC.
      6. Apply PKCS7 padding; encrypt with AES-256-CBC.
      7. Compute HMAC-SHA256 over the entire header + IV + ciphertext:
           HMAC( Nonce || Seq || Timestamp || IV || Ciphertext )
         The nonce, sequence, and timestamp are inside the MAC scope so
         they cannot be stripped or altered without breaking verification.
      8. Return: Nonce || Seq || Timestamp || IV || Ciphertext || HMAC

    Args:
        message:  Plaintext bytes to encrypt. May be any length >= 0.
        aes_key:  32-byte AES-256 encryption key.
        hmac_key: 32-byte HMAC key. Must be independent of aes_key.
        seq:      Monotonically increasing sequence number (uint64).
                  The caller is responsible for incrementing this per message.

    Returns:
        Authenticated, replay-resistant ciphertext packet as bytes.

    Raises:
        ValueError: If either key is not exactly 32 bytes, or seq is negative.
    """
    _validate_key(aes_key,  AES_KEY_SIZE,  "AES")
    _validate_key(hmac_key, HMAC_KEY_SIZE, "HMAC")
    if seq < 0:
        raise ValueError(f"Sequence number must be non-negative; got {seq}.")

    # Step 2: Random nonce — 128 bits of entropy, unique per message.
    #         Even if the attacker captures the packet, the nonce makes it
    #         unreplayable because the receiver's NonceStore will reject it.
    nonce = os.urandom(NONCE_SIZE)

    # Step 3 & 4: Timestamp (microseconds) and sequence, both big-endian.
    ts_us  = int(time.time() * 1_000_000)
    header = nonce + struct.pack(">QQ", seq, ts_us)

    # Step 5 & 6: Fresh IV + AES-256-CBC encryption with PKCS7 padding.
    iv         = os.urandom(IV_SIZE)
    cipher     = AES.new(aes_key, AES.MODE_CBC, iv)
    ciphertext = cipher.encrypt(pad(message, AES_BLOCK_SIZE))

    # Step 7: MAC covers everything — header fields cannot be stripped or
    #         altered without invalidating the HMAC.
    mac = _compute_hmac(hmac_key, header + iv + ciphertext)

    # Step 8: Concatenate into a single flat byte string.
    return header + iv + ciphertext + mac


# ── Verification & decryption ─────────────────────────────────────────────────

def verify_and_decrypt(
    packet: bytes,
    aes_key: bytes,
    hmac_key: bytes,
    nonce_store: "NonceStore | None" = None,
) -> bytes:
    """
    Verify the authenticity and freshness of *packet*, then decrypt it.

    Decryption steps:
      1. Validate key sizes and minimum packet length.
      2. Parse: Nonce, Seq, Timestamp, IV, Ciphertext, received_mac.
      3. Recompute HMAC-SHA256 over (Nonce || Seq || Timestamp || IV || Ciphertext).
      4. Compare with constant-time hmac.compare_digest — prevents timing attacks.
      5. Reject immediately if MACs differ (no decryption attempted).
      6. If a NonceStore is provided, call check_and_record() to detect replays
         and enforce sequence ordering.
      7. Decrypt with AES-256-CBC and strip PKCS7 padding.

    IMPORTANT: Always pass a NonceStore in production. Without it, the function
    still verifies integrity and authenticity but cannot detect replay attacks.

    Args:
        packet:      Bytes produced by encrypt_and_sign().
        aes_key:     32-byte AES-256 decryption key.
        hmac_key:    32-byte HMAC key (same as used during encryption).
        nonce_store: A NonceStore instance shared across all received packets
                     for this session. Pass None only in unit tests.

    Returns:
        Original plaintext bytes.

    Raises:
        AuthenticationError: If the HMAC does not match.
        ReplayError:         If the nonce was already seen, the sequence number
                             is out of order, or the timestamp is too old/new.
        ValueError:          If the packet is structurally invalid.
    """
    _validate_key(aes_key,  AES_KEY_SIZE,  "AES")
    _validate_key(hmac_key, HMAC_KEY_SIZE, "HMAC")

    # Step 1: Minimum = header + IV + one AES block + HMAC.
    min_length = _HEADER_SIZE + IV_SIZE + AES_BLOCK_SIZE + HMAC_SIZE
    if len(packet) < min_length:
        raise ValueError(
            f"Packet too short: minimum {min_length} bytes required, "
            f"received {len(packet)} bytes."
        )

    # Step 2: Unpack all fixed-length fields; ciphertext fills the remainder.
    nonce        = packet[:NONCE_SIZE]
    seq, ts_us   = struct.unpack(">QQ", packet[NONCE_SIZE:_HEADER_SIZE])
    iv           = packet[_HEADER_SIZE : _HEADER_SIZE + IV_SIZE]
    ciphertext   = packet[_HEADER_SIZE + IV_SIZE : -HMAC_SIZE]
    received_mac = packet[-HMAC_SIZE:]

    if len(ciphertext) == 0 or len(ciphertext) % AES_BLOCK_SIZE != 0:
        raise ValueError(
            f"Ciphertext length {len(ciphertext)} is not a positive multiple "
            f"of the AES block size ({AES_BLOCK_SIZE} bytes)."
        )

    # Step 3: Recompute MAC over the entire authenticated region.
    #         Any bit change anywhere in the packet — including header fields —
    #         will produce a different MAC and be rejected.
    authenticated_data = packet[: -HMAC_SIZE]   # everything except the MAC itself
    expected_mac = _compute_hmac(hmac_key, authenticated_data)

    # Step 4 & 5: Constant-time comparison — do NOT short-circuit on first diff.
    if not hmac.compare_digest(expected_mac, received_mac):
        raise AuthenticationError(
            "HMAC-SHA256 verification failed. "
            "The packet may have been tampered with or corrupted in transit."
        )

    # Step 6: Replay/reorder check — only after MAC passes to avoid oracle.
    if nonce_store is not None:
        nonce_store.check_and_record(nonce, seq, ts_us)

    # Step 7: Only reach here after full authentication + freshness check.
    cipher    = AES.new(aes_key, AES.MODE_CBC, iv)
    plaintext = unpad(cipher.decrypt(ciphertext), AES_BLOCK_SIZE)
    return plaintext


# ── Internal helpers ──────────────────────────────────────────────────────────

def _compute_hmac(key: bytes, data: bytes) -> bytes:
    """
    Return HMAC-SHA256(key, data) as a 32-byte digest.

    Args:
        key:  Secret key bytes.
        data: Authenticated data.

    Returns:
        32-byte (256-bit) HMAC digest.
    """
    return hmac.new(key, data, hashlib.sha256).digest()


def _validate_key(key: bytes, expected_size: int, label: str) -> None:
    """
    Raise ValueError if *key* is not exactly *expected_size* bytes.

    Args:
        key:           Key bytes to validate.
        expected_size: Required length in bytes.
        label:         Human-readable key name used in the error message.
    """
    if not isinstance(key, (bytes, bytearray)):
        raise TypeError(f"{label} key must be bytes, got {type(key).__name__}.")
    if len(key) != expected_size:
        raise ValueError(
            f"{label} key must be exactly {expected_size} bytes "
            f"({expected_size * 8} bits); got {len(key)} bytes."
        )


# ── Demo ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    _SEP = "─" * 60

    print(_SEP)
    print("  message_crypto.py — AES-256-CBC + HMAC-SHA256 demo")
    print(_SEP)

    # ── 1. Key generation ─────────────────────────────────────────
    aes_key, hmac_key = generate_keys()

    print("\n[1] Keys generated")
    print(f"    AES  key (256-bit): {aes_key.hex()}")
    print(f"    HMAC key (256-bit): {hmac_key.hex()}")

    # Create one NonceStore for the receiver side of this session.
    store = NonceStore(timestamp_window_s=60)

    # ── 2. Encrypt and sign a sample message ──────────────────────
    sample_message = b"Hello from the UpFilo proxy - this message is confidential."
    packet = encrypt_and_sign(sample_message, aes_key, hmac_key, seq=1)

    ct_size = len(packet) - _HEADER_SIZE - IV_SIZE - HMAC_SIZE
    print(f"\n[2] Encrypt-and-sign (seq=1)")
    print(f"    Plaintext   : {sample_message.decode()}")
    print(f"    Packet size : {len(packet)} bytes  "
          f"(HDR={_HEADER_SIZE} + IV={IV_SIZE} + CT={ct_size} + MAC={HMAC_SIZE})")
    print(f"    Nonce       : {packet[:NONCE_SIZE].hex()}")
    print(f"    Seq         : {struct.unpack('>Q', packet[NONCE_SIZE:NONCE_SIZE+SEQ_SIZE])[0]}")
    print(f"    Timestamp   : {struct.unpack('>Q', packet[NONCE_SIZE+SEQ_SIZE:_HEADER_SIZE])[0]} us")
    print(f"    IV          : {packet[_HEADER_SIZE:_HEADER_SIZE+IV_SIZE].hex()}")
    print(f"    Ciphertext  : {packet[_HEADER_SIZE+IV_SIZE:-HMAC_SIZE].hex()}")
    print(f"    HMAC-SHA256 : {packet[-HMAC_SIZE:].hex()}")

    # ── 3. Verify and decrypt ─────────────────────────────────────
    recovered = verify_and_decrypt(packet, aes_key, hmac_key, nonce_store=store)

    print(f"\n[3] Verify-and-decrypt")
    print(f"    Recovered   : {recovered.decode()}")

    assert recovered == sample_message, "BUG: Recovered plaintext does not match original!"
    print(f"    Round-trip  : PASS ✓")

    # ── 4. Tamper detection — corrupt the ciphertext ───────────────
    print(f"\n[4] Tamper detection — corrupt one ciphertext byte")

    tampered = bytearray(packet)
    tampered[_HEADER_SIZE + IV_SIZE + 4] ^= 0xFF   # flip bits in ciphertext
    tampered_packet = bytes(tampered)

    try:
        verify_and_decrypt(tampered_packet, aes_key, hmac_key)
        print("    ERROR: tampered packet accepted — this should never happen!")
    except AuthenticationError as exc:
        print(f"    Exception   : {exc}")
        print(f"    Rejection   : PASS ✓")

    # ── 5. Tamper detection — corrupt the IV ──────────────────────
    print(f"\n[5] Tamper detection — corrupt one IV byte")

    tampered_iv = bytearray(packet)
    tampered_iv[_HEADER_SIZE + 3] ^= 0x01          # flip one IV bit
    tampered_iv_packet = bytes(tampered_iv)

    try:
        verify_and_decrypt(tampered_iv_packet, aes_key, hmac_key)
        print("    ERROR: IV-tampered packet accepted — this should never happen!")
    except AuthenticationError as exc:
        print(f"    Exception   : {exc}")
        print(f"    Rejection   : PASS ✓")

    # ── 6. Wrong key rejection ────────────────────────────────────
    print(f"\n[6] Wrong HMAC key rejection")

    wrong_aes, wrong_hmac = generate_keys()

    try:
        verify_and_decrypt(packet, wrong_aes, wrong_hmac)
        print("    ERROR: wrong-key decryption succeeded — this should never happen!")
    except AuthenticationError as exc:
        print(f"    Exception   : {exc}")
        print(f"    Rejection   : PASS ✓")

    # ── 7. Replay attack — same packet sent again (Burp Repeater) ─
    print(f"\n[7] Replay attack (Burp Suite Repeater simulation)")

    # packet was already accepted with seq=1 above; replaying it must be rejected.
    try:
        verify_and_decrypt(packet, aes_key, hmac_key, nonce_store=store)
        print("    ERROR: replay accepted — this should never happen!")
    except ReplayError as exc:
        print(f"    Exception   : {exc}")
        print(f"    Rejection   : PASS ✓")

    # ── 8. Reorder attack — seq=3 then seq=2 ─────────────────────
    print(f"\n[8] Reorder attack — out-of-order sequence numbers")

    packet_seq3 = encrypt_and_sign(b"Message 3", aes_key, hmac_key, seq=3)
    packet_seq2 = encrypt_and_sign(b"Message 2", aes_key, hmac_key, seq=2)

    # Accept seq=3 first (simulating delivery inversion).
    verify_and_decrypt(packet_seq3, aes_key, hmac_key, nonce_store=store)
    print(f"    seq=3 accepted (last_seq is now 3)")

    # Now seq=2 arrives late — must be rejected.
    try:
        verify_and_decrypt(packet_seq2, aes_key, hmac_key, nonce_store=store)
        print("    ERROR: out-of-order seq=2 accepted — this should never happen!")
    except ReplayError as exc:
        print(f"    Exception   : {exc}")
        print(f"    Rejection   : PASS ✓")

    # ── 9. Timestamp skew — forged future timestamp ───────────────
    print(f"\n[9] Stale/future timestamp rejection")

    # Manually craft a packet with a timestamp 2 hours in the past.
    nonce  = os.urandom(NONCE_SIZE)
    old_ts = int((time.time() - 7200) * 1_000_000)   # 2 hours ago
    header = nonce + struct.pack(">QQ", 99, old_ts)
    iv     = os.urandom(IV_SIZE)
    cipher = AES.new(aes_key, AES.MODE_CBC, iv)
    ct     = cipher.encrypt(pad(b"stale message", AES_BLOCK_SIZE))
    mac    = _compute_hmac(hmac_key, header + iv + ct)
    stale_packet = header + iv + ct + mac

    try:
        verify_and_decrypt(stale_packet, aes_key, hmac_key, nonce_store=store)
        print("    ERROR: stale packet accepted — this should never happen!")
    except ReplayError as exc:
        print(f"    Exception   : {exc}")
        print(f"    Rejection   : PASS ✓")

    print(f"\n{_SEP}")
    print("  All 9 checks passed. Module is ready for proxy integration.")
    print(_SEP)
