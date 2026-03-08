# Security Module — `message_crypto.py`

Security documentation for the UpFilo real-time chat platform backend proxy.

---

## Overview

`message_crypto.py` provides **message confidentiality and integrity** for all packets transmitted through the UpFilo proxy layer. It uses a classic **Encrypt-then-MAC** construction — the industry-standard approach that guarantees both secrecy and authenticity, and is immune to padding-oracle attacks because decryption is never attempted on unauthenticated data.

---

## Cryptographic Primitives

| Primitive              | Algorithm             | Key size | Purpose                  |
| ---------------------- | --------------------- | -------- | ------------------------ |
| Symmetric encryption   | AES-256-CBC           | 256-bit  | Confidentiality          |
| Message authentication | HMAC-SHA256           | 256-bit  | Integrity + authenticity |
| Nonce generation       | `os.urandom` (CSPRNG) | 128-bit  | Replay prevention        |
| IV generation          | `os.urandom` (CSPRNG) | 128-bit  | IND-CPA security         |
| Padding                | PKCS7                 | —        | AES block alignment      |
| MAC comparison         | `hmac.compare_digest` | —        | Constant-time equality   |

> **Key separation**: AES and HMAC keys are always independent. Reusing a single key for both operations would collapse the security boundary between confidentiality and authentication.

---

## Packet Wire Format

Every packet produced by `encrypt_and_sign()` has the following flat binary layout:

```
┌──────────────┬──────────────┬──────────────┬──────────┬─────────────────────┬────────────────┐
│  Nonce       │  Seq         │  Timestamp   │  IV      │  Ciphertext         │  HMAC-SHA256   │
│  16 bytes    │  8 bytes     │  8 bytes     │  16 bytes│  variable           │  32 bytes      │
│  (random)    │  (uint64 BE) │  (µs, BE)    │  (random)│  (AES-256-CBC)      │                │
└──────────────┴──────────────┴──────────────┴──────────┴─────────────────────┴────────────────┘
 ────────────────────────────────── HMAC covers all of the above ───────────────────────────────
```

| Field           | Size     | Description                                                                       |
| --------------- | -------- | --------------------------------------------------------------------------------- |
| **Nonce**       | 16 B     | Cryptographically random, unique per message. Used to detect replays.             |
| **Seq**         | 8 B      | Monotonically increasing 64-bit sequence number (big-endian). Detects reordering. |
| **Timestamp**   | 8 B      | Sender Unix timestamp in microseconds (big-endian). Rejects stale packets.        |
| **IV**          | 16 B     | Fresh random AES initialisation vector. Ensures IND-CPA security.                 |
| **Ciphertext**  | variable | AES-256-CBC encrypted plaintext with PKCS7 padding. Always a multiple of 16 B.    |
| **HMAC-SHA256** | 32 B     | MAC over all preceding fields. Detects any modification anywhere in the packet.   |

**Minimum packet size**: `16 + 8 + 8 + 16 + 16 + 32 = 96 bytes` (for a 1–16 byte message).

---

## API Reference

### `generate_keys() → (aes_key, hmac_key)`

Generates two independent 32-byte keys from the OS CSPRNG.

```python
aes_key, hmac_key = generate_keys()
```

---

### `encrypt_and_sign(message, aes_key, hmac_key, seq=0) → bytes`

Encrypts and authenticates a message. Returns a ready-to-transmit packet.

```python
packet = encrypt_and_sign(b"hello", aes_key, hmac_key, seq=1)
```

| Parameter  | Type    | Description                                                                  |
| ---------- | ------- | ---------------------------------------------------------------------------- |
| `message`  | `bytes` | Plaintext to encrypt. Any length ≥ 0.                                        |
| `aes_key`  | `bytes` | 32-byte AES-256 encryption key.                                              |
| `hmac_key` | `bytes` | 32-byte HMAC key. Must differ from `aes_key`.                                |
| `seq`      | `int`   | Monotonically increasing sequence number. Caller must increment per message. |

**Raises**: `ValueError` if a key is not exactly 32 bytes, or `seq` is negative.

---

### `verify_and_decrypt(packet, aes_key, hmac_key, nonce_store=None) → bytes`

Verifies the MAC, checks replay/freshness, then decrypts. Returns the original plaintext.

```python
store = NonceStore()
plaintext = verify_and_decrypt(packet, aes_key, hmac_key, nonce_store=store)
```

| Parameter     | Type                 | Description                                                      |
| ------------- | -------------------- | ---------------------------------------------------------------- |
| `packet`      | `bytes`              | Bytes produced by `encrypt_and_sign()`.                          |
| `aes_key`     | `bytes`              | 32-byte AES-256 decryption key.                                  |
| `hmac_key`    | `bytes`              | 32-byte HMAC key. Same as used during encryption.                |
| `nonce_store` | `NonceStore \| None` | Shared store for the session. **Always pass one in production.** |

**Raises**:

- `AuthenticationError` — HMAC mismatch (tampering or corruption).
- `ReplayError` — duplicate nonce, out-of-order sequence, or stale timestamp.
- `ValueError` — structurally invalid packet.

> **Important**: Never attempt to recover from `AuthenticationError` or `ReplayError` by retrying with the same packet. Discard and log.

---

### `NonceStore(timestamp_window_s=60, enforce_sequence=True)`

Thread-safe store that prevents replay and reorder attacks. One instance per session.

```python
store = NonceStore(timestamp_window_s=60, enforce_sequence=True)
```

| Parameter            | Type    | Default | Description                                                                                     |
| -------------------- | ------- | ------- | ----------------------------------------------------------------------------------------------- |
| `timestamp_window_s` | `float` | `60`    | Max acceptable clock skew in seconds. Packets outside this window are rejected.                 |
| `enforce_sequence`   | `bool`  | `True`  | When `True`, seq must be strictly increasing. Set `False` only for unordered delivery channels. |

---

## Threat Model

### Attacks Mitigated

| Attack vector                       | Burp Suite feature         | Mitigation                                                                              | Demo check   |
| ----------------------------------- | -------------------------- | --------------------------------------------------------------------------------------- | ------------ |
| **Ciphertext tampering**            | Intruder / manual edit     | HMAC-SHA256 covers full ciphertext — any bit flip fails verification                    | ✓ Check 4    |
| **IV swapping**                     | Intruder                   | IV is inside HMAC scope — replacement invalidates the MAC                               | ✓ Check 5    |
| **CBC bit-flip attack**             | Intruder                   | Encrypt-then-MAC: HMAC verified before decryption; flip is caught first                 | ✓ Check 4    |
| **Padding oracle attack**           | Intruder (automated)       | Decryption is never attempted on a packet with an invalid MAC                           | ✓ Check 4    |
| **Timing side-channel on MAC**      | Timing analysis            | `hmac.compare_digest` performs constant-time comparison                                 | —            |
| **Length extension attack**         | Crafted payloads           | HMAC (keyed) is used, not bare SHA-256; immune to extension                             | —            |
| **Header field stripping**          | Intruder                   | Nonce, Seq, and Timestamp are all inside the HMAC scope                                 | ✓ Checks 7–9 |
| **Replay attack**                   | **Repeater**               | Per-message random 128-bit nonce stored in `NonceStore`; duplicate raises `ReplayError` | ✓ Check 7    |
| **Delayed replay**                  | **Repeater** (hours later) | Timestamp window (default 60 s) — expired packets rejected regardless of valid MAC      | ✓ Check 9    |
| **Message reordering**              | **Proxy intercept**        | Monotonically increasing sequence numbers enforced by `NonceStore`                      | ✓ Check 8    |
| **Wrong key usage**                 | Key confusion              | MAC computed with separate HMAC key; wrong key produces different digest                | ✓ Check 6    |
| **Identical plaintext recognition** | Traffic analysis           | Fresh random IV per message; identical plaintexts produce different ciphertexts         | —            |

### Known Limitations (Out of Scope for This Module)

| Limitation                     | Notes                                                                                                                                                                |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **No forward secrecy**         | Keys are static. If leaked, all past session traffic is compromised. Mitigate at the transport layer with ephemeral key exchange (e.g. ECDH).                        |
| **Traffic / length analysis**  | PKCS7 pads only to the next 16-byte boundary. Approximate plaintext length is visible from packet size. Mitigate with fixed-length padding or padding-to-power-of-2. |
| **Key distribution**           | This module does not handle how AES/HMAC keys are exchanged or rotated. Key management must be handled by the surrounding infrastructure.                            |
| **No per-user authentication** | The module authenticates packets, not identities. Combine with a higher-level identity layer if per-user accountability is required.                                 |

---

## Encryption Flow

```
Plaintext
    │
    ▼
[PKCS7 pad to 16-byte boundary]
    │
    ▼
[AES-256-CBC encrypt with fresh random IV]
    │
    ├── Ciphertext
    │
    ▼
[Build header: Nonce(16) || Seq(8) || Timestamp(8)]
    │
    ▼
[HMAC-SHA256 over: Header || IV || Ciphertext]
    │
    ▼
Packet = Header || IV || Ciphertext || HMAC
```

## Decryption Flow

```
Packet
    │
    ▼
[Parse: Header(32) | IV(16) | Ciphertext(var) | HMAC(32)]
    │
    ▼
[Recompute HMAC over Header || IV || Ciphertext]
    │
    ▼
[hmac.compare_digest — constant-time]
    │
    ├── FAIL → raise AuthenticationError (stop; no decryption)
    │
    ▼
[NonceStore.check_and_record(nonce, seq, ts)]
    │
    ├── Duplicate nonce  → raise ReplayError
    ├── seq ≤ last_seq   → raise ReplayError
    ├── |now - ts| > window → raise ReplayError
    │
    ▼
[AES-256-CBC decrypt + PKCS7 unpad]
    │
    ▼
Plaintext
```

---

## Setup

```bash
# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\Activate.ps1       # Windows
source .venv/bin/activate         # macOS / Linux

# Install dependency
pip install pycryptodome

# Run the demo (9 security checks)
python security/message_crypto.py
```

---

## Demo Output

Running `message_crypto.py` exercises all 9 security checks:

| #   | Scenario                   | Expected outcome                                              |
| --- | -------------------------- | ------------------------------------------------------------- |
| 1   | Key generation             | Two independent 256-bit keys printed                          |
| 2   | Encrypt a message          | Full packet breakdown printed                                 |
| 3   | Decrypt & verify           | Recovered plaintext matches original                          |
| 4   | Corrupt ciphertext byte    | `AuthenticationError`                                         |
| 5   | Corrupt IV byte            | `AuthenticationError`                                         |
| 6   | Wrong HMAC key             | `AuthenticationError`                                         |
| 7   | Replay (Burp Repeater)     | `ReplayError: Duplicate nonce`                                |
| 8   | Reorder (seq=3 then seq=2) | `ReplayError: Sequence number not greater than last accepted` |
| 9   | Stale timestamp (2 h old)  | `ReplayError: Packet timestamp outside allowed window`        |

---

## Integration Notes

When integrating this module into the proxy:

1. **One `NonceStore` per session** — create it when the session is established, discard when the session ends.
2. **Increment `seq` on the sender side** — maintain a per-session counter; never reuse a sequence number.
3. **Synchronise clocks** — both proxy and backend should use NTP-synchronised time to stay within the 60-second timestamp window.
4. **Treat all three exceptions as fatal** — log the event, close the connection, and do not attempt to recover or retry with the same packet.
5. **Rotate keys per session** — generate fresh `aes_key` / `hmac_key` for each new session; do not reuse keys across sessions.
