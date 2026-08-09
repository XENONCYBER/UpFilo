# UpFilo

Real-time workspace chat with channel-based collaboration and Backblaze B2 file sharing.

## Overview

UpFilo is a Next.js application for creating lightweight collaboration workspaces. It combines real-time workspace data from Convex with a chat interface, grouped channels, presence tracking, message search, media browsing, and file uploads backed by Backblaze B2.

The project is intended for teams or developers who need a self-hostable, Slack-like workspace prototype focused on fast messaging and file sharing.

## Features

- Workspace creation, listing, joining by custom workspace ID, and deletion
- Channel groups and channels for workspace organization
- Real-time messages powered by Convex queries and mutations
- Rich-text chat input using Quill
- Message replies, editing, and deletion
- User mention parsing and mention rendering
- Session-based display names stored in browser `sessionStorage`
- Presence tracking with online, away, and offline states
- Workspace-wide search for messages and attached files
- Backblaze B2 file upload, streaming, download, and bulk cleanup API routes
- Media gallery with image, video, audio, document, grid, list, and filter views
- Light/dark theme support through `next-themes`
- Standalone Python security demo for AES-256-CBC + HMAC-SHA256 message packets

## Requirements

- Node.js and npm
- A Convex project for workspace, channel, message, and presence data
- A Backblaze B2 bucket for file upload and streaming features
- Python 3 with `pycryptodome` only if you want to run `security/message_crypto.py`

No Node.js engine version is declared in `package.json`.

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/XENONCYBER/UpFilo.git
cd UpFilo
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Then fill in the required Convex and Backblaze B2 values in `.env.local`.

## Quick Start

Run the Next.js app and Convex development server together:

```bash
npm run dev:full
```

Open the app at:

```text
http://localhost:3000
```

You can also run each process separately:

```bash
npm run dev
npm run convex:dev
```

## Usage

From the home page, create a workspace or join an existing workspace by entering its workspace ID or name. Workspace URLs use the custom workspace ID:

```text
http://localhost:3000/{workspaceId}
```

Inside a workspace:

- Enter a display name when prompted.
- Select or create channels from the sidebar.
- Send rich-text messages, attach files, and reply to existing messages.
- Use search from the header or `Ctrl+K` / `Cmd+K` to search messages and files.
- Open the media gallery to browse shared attachments by type.

Uploaded files are posted to:

```text
POST /api/uploadFile
```

Stored files are served through:

```text
GET /api/stream/{filename}
GET /api/download/{filename}
```

Bulk cleanup of uploaded files is handled through:

```text
POST /api/deleteFiles
```

## Configuration

The repository includes `.env.example` with the required environment variables.

| Variable | Required | Description | Default |
| -------- | -------- | ----------- | ------- |
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Public Convex deployment URL used by the React Convex provider. | None |
| `CONVEX_DEPLOYMENT` | Yes for Convex workflows | Convex deployment identifier used by the Convex CLI. | None |
| `CONVEX_DEPLOY_KEY` | Yes for deployment workflows | Convex deployment key. Keep this secret. | None |
| `B2_APPLICATION_KEY_ID` | Yes for file storage | Backblaze B2 application key ID. | None |
| `B2_APPLICATION_KEY` | Yes for file storage | Backblaze B2 application key. Keep this secret. | None |
| `B2_BUCKET_NAME` | Yes for file serving | Backblaze B2 bucket name used for downloads and streams. | None |
| `B2_BUCKET_ID` | Yes for file upload/delete | Backblaze B2 bucket ID used for upload URLs and file deletion. | None |

Do not commit `.env.local` or real credentials.

## Project Structure

```text
.
|-- convex/
|   |-- schema.ts              # Convex database schema
|   |-- workspaces.ts          # Workspace mutations, queries, and presence
|   |-- channels.ts            # Channel queries, mutations, deletion, ordering
|   |-- channelGroups.ts       # Channel group queries, mutations, passwords
|   `-- messages.ts            # Message, search, and media queries/mutations
|-- public/                    # Favicons, manifest, and static assets
|-- security/
|   |-- SECURITY.md            # Security module documentation
|   `-- message_crypto.py      # Standalone encryption/signing demo module
|-- src/
|   |-- app/                   # Next.js App Router pages, layouts, API routes
|   |-- components/            # Workspace, chat, media, provider, and UI components
|   |-- config/                # Site metadata
|   |-- features/              # Convex-backed feature hooks
|   |-- hooks/                 # Route/workspace/channel helper hooks
|   `-- lib/                   # Utilities, uploads, Backblaze B2 integration
|-- components.json            # shadcn/ui-style component configuration
|-- next.config.mjs            # Next.js configuration
|-- tailwind.config.ts         # Tailwind CSS configuration
`-- package.json               # npm scripts and dependencies
```

## Architecture

UpFilo uses the Next.js App Router for the web application and API routes. Client components are wrapped with providers for Convex, Jotai state, theming, user sessions, and toast notifications.

Convex stores the canonical application data:

- `workspaces`
- `channelGroups`
- `channels`
- `messages`
- `users`
- `userPresence`

The chat UI reads and writes through feature hooks under `src/features/**/api`, which call Convex functions in `convex/`. File binaries are not stored in Convex. The upload API route sends files to Backblaze B2 and message `richContent` stores attachment metadata and internal stream URLs.

The `security/` directory is separate from the web app. It contains a Python module demonstrating an encrypt-then-MAC packet format using AES-256-CBC and HMAC-SHA256, with replay and reorder checks via `NonceStore`.

## Development

Available npm scripts:

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start the Next.js development server. |
| `npm run convex:dev` | Start the Convex development server with `npx convex dev`. |
| `npm run dev:full` | Run Next.js and Convex development servers together using `concurrently`. |
| `npm run build` | Build the Next.js application. |
| `npm run start` | Start the production Next.js server after a build. |
| `npm run lint` | Run Next.js linting. |

For day-to-day development:

```bash
npm install
npm run dev:full
```

Generated Convex files live in `convex/_generated/` and should be updated by the Convex tooling rather than edited manually.

## Testing

No automated test script is defined in `package.json`.

The repository does provide linting and production build commands:

```bash
npm run lint
npm run build
```

To run the standalone Python security demo:

```bash
python -m venv .venv
pip install pycryptodome
python security/message_crypto.py
```

On Windows PowerShell, activate the virtual environment first if desired:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install pycryptodome
python security/message_crypto.py
```

## Security

Security documentation for the standalone packet encryption module is available in [`security/SECURITY.md`](security/SECURITY.md).

The main web application relies on environment variables for Convex and Backblaze B2 credentials. Keep all deployment keys, B2 application keys, and bucket credentials out of source control.

## Contributing


1. Create a branch for your change.
2. Install dependencies with `npm install`.
3. Configure `.env.local` from `.env.example`.
4. Run the app with `npm run dev:full`.
5. Run `npm run lint` and `npm run build` before opening a pull request.

When changing Convex data models or server functions, review `convex/schema.ts` and the related functions in `convex/` together.



