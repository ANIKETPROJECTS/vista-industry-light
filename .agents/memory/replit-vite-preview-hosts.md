---
name: Replit Vite preview hosts
description: Host allowlisting needed for Vite apps served through Replit's proxied preview.
---

Vite apps running behind Replit's preview proxy need to allow the generated `*.replit.dev` hostname.

**Why:** Vite otherwise rejects the proxied request with “This host is not allowed,” even when the local server is healthy.

**How to apply:** Prefer a scoped Vite `server.allowedHosts` entry for `.replit.dev` rather than disabling host checks globally.