**Project Working Notes**

This document summarizes how to work with this repository: a high-level architecture overview, key folders and files, and important code snippets to get you started quickly.

**Overview**

- **Stack**: Next.js (App Router, `src/app`), React components in `src/components`, Convex backend in `convex/`, utility libraries under `src/lib`.
- **Purpose**: Real-time/chat-first workspace app with media upload, channels, messages, and workspace management.

**Architecture**

- **`src/app`**: The Next.js App Router. Contains global layout, workspace routes, and API route handlers under `src/app/api`.
- **`src/components`**: UI components used across the app (chat UI, sidebar, media viewer, upload UI, providers for session/theme/state).
- **`convex/`**: Convex server code for data model, queries, and mutation functions. Generated client code is in `convex/_generated/`.
- **`public/`**: Static assets.
- **`src/lib`**: Helpers and integrations like `backblaze.ts`, `upload.ts`, and `mention-module.ts`.
- **`src/hooks`**: Small hooks to access workspace or channel IDs and other contextual helpers.

**Key Files / Routes**

- `src/app/layout.tsx` - Root layout and global CSS import.
- `src/app/(main)/page.tsx` - Main entry page for authenticated experience.
- `src/app/[workspaceId]/page.tsx` - Workspace page that mounts chat/sidebars.
- `src/app/api/uploadFile/route.ts` - API route that receives file uploads (used by the `FileUpload` component and `src/lib/upload.ts`).
- `src/app/api/download/[filename]/route.ts` and `src/app/api/stream/[filename]/route.ts` - Download/stream endpoints for files.
- `convex/schema.ts` and `convex/*.ts` - Convex data model and server functions.

**How to run (typical)**

- Install: `npm install`
- Start dev: `npm run dev`
- Build: `npm run build`
- Start production preview: `npm run start`

Note: This repo uses Next.js App Router conventions and server-side/edge route handlers under `src/app/api`.

**Important Components & Providers**

- `convex-client-provider.tsx`: Wrap the app with Convex client to use Convex queries and mutations from React components.
- `jotai-provider.tsx`: Provides Jotai state management for local UI state.
- `user-session-provider.tsx`: Manages auth/session state.
- `FileUpload.tsx`: Reusable file upload UI used in chat input and media widgets.
- `PDFViewer.tsx`, `ModernMediaGallery.tsx`: Media display components.

**Common Usage Snippets**

1. Using the Convex client provider (example)

```tsx
// src/app/layout.tsx (root)
import ConvexClientProvider from "../components/convex-client-provider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
```

2. Uploading a file to the `uploadFile` API route (frontend snippet)

```ts
// Example helper to upload a File object
async function uploadFile(file: File) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/uploadFile", {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}
```

3. Using the `FileUpload` component in a chat input (JSX)

```tsx
import FileUpload from "@/components/FileUpload";

export default function ChatInput() {
  return (
    <div className="chat-input">
      <FileUpload
        onComplete={(fileMeta) => console.log("uploaded", fileMeta)}
      />
    </div>
  );
}
```

4. Calling a Convex mutation from a component

```ts
import { useMutation } from "convex/react";

function CreateMessageButton() {
  const createMessage = useMutation("messages:create");
  return <button onClick={() => createMessage({ text: "hello" })}>Send</button>;
}
```

5. Simplified file stream/download (server -> client)

```ts
// Fetch a file via the download route
const url = `/api/download/${encodeURIComponent(filename)}`;
const res = await fetch(url);
// For streaming, use res.body as needed
```

**Developer Notes & Conventions**

- UI uses tailwind styling: config in `tailwind.config.ts` and global CSS in `src/app/globals.css`.
- Component folder `src/components/ui` contains atomic UI primitives (buttons, inputs, dialogs).
- Workspace-level components live in `src/components/workspace` (channel list, active users, chat bubbles).
- `src/lib/upload.ts` and `src/lib/backblaze.ts` contain helpers for storing files and interacting with Backblaze or similar.
- `convex/_generated/` is auto-generated — don't edit directly.

**Where to start when contributing**

- Run the app locally and open `http://localhost:3000` (default Next dev port).
- Explore `src/app/[workspaceId]/page.tsx` to see how workspace and chat are mounted.
- For data model changes, update `convex/schema.ts` and follow Convex migration steps used by the project.

**Quick Troubleshooting**

- If uploads fail, check `src/app/api/uploadFile/route.ts` and the `FileUpload` component; ensure env vars for storage backends are set.
- For realtime issues, validate Convex server functions in `convex/` and ensure the generated client in `convex/_generated/` is up-to-date.

**Appendix: Relevant Paths**

- `src/app` — Next App Router code and API routes
- `src/components` — UI components
- `src/components/ui` — atomic UI primitives
- `src/components/workspace` — chat and workspace-specific components
- `src/lib` — utilities and integrations
- `convex` — Convex data and server functions

---

If you'd like, I can:

- run the dev server to confirm scripts, or
- generate a smaller CONTRIBUTING.md or a quick start script.

Replace or extend this file as you see fit.

**Other Notable Features**

- Mentions and notifications (user mention detection, mention-notifications UI)
- Reactions to messages and inline replies / threads
- Rich-text editing in messages (Quill-based editor in `quill-chat-input.tsx`)
- Presence and active users list (`active-users.tsx`), with ephemeral presence signals
- Search across channels and messages (search modal and server-side search helpers)
- Media uploads, streaming, preview and a dedicated media gallery (`ModernMediaGallery.tsx`, `PDFViewer.tsx`)
- Workspace-level roles/permissions and channel groups (`channelGroups.ts`, `workspaces.ts` in `convex/`)
- Offline / optimistic UI and reconnection handling via Convex client and local Jotai state

**Architecture Diagram (Mermaid)**

```mermaid
flowchart TD
  subgraph Client
    A[Browser / Next.js Client] -->|React + SWR/Convex| B[UI Components]
    B --> C[Providers\n(convex-client, jotai, session, theme)]
    B --> D[Chat Input / FileUpload]
  end

  subgraph Server
    E[Next.js App Router]
    E --> F[API Routes\n(uploadFile, download, stream)]
    E --> G[Server Components / SSR pages]
  end

  subgraph Convex
    H[Convex Server] --> I[Convex Functions & DataModel]
  end

  subgraph Storage
    J[Backblaze / Object Storage]
  end

  A -->|HTTP / WebSocket| E
  E -->|Invokes| I
  D -->|POST multipart| F
  F -->|store| J
  I -->|reads/writes| J
  I -->|events| A
```

**ASCII Flow (quick)**

User -> Browser (Next.js client) -> UI components -> Convex client (real-time)
-> API upload route (for files) -> Backblaze storage
Convex server functions handle data model changes and broadcast realtime updates to clients.

**Flow Explanation**

- Client: React UI in `src/app` uses providers to wire Convex + Jotai state into components.
- API routes: `src/app/api/*` handle file upload/download and act as the bridge to object storage or streaming.
- Convex: stores canonical state (workspaces, channels, messages, metadata). Server functions validate and mutate data.
- Storage: Large binary objects (media/PDFs) are saved to object storage (Backblaze or S3-like). The DB keeps references/metadata.
- Real-time: Convex pushes updates to subscribed clients; the client uses those updates to render messages, presence, and reactions.

**Recommended Next Tasks**

- Add a CONTRIBUTING.md with local dev steps and Convex migration steps.
- Add a short diagram image to `public/` and reference it from `WORKING.md` for non-mermaid viewers.
- Add a troubleshooting checklist for Convex auth, upload credentials, and environment variables.
