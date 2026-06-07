# Publishing `@ai3stack/prompts-mcp`

Concrete checklist for shipping a release to npm and listing the server in the major
MCP registries. Steps marked **[HUMAN]** require a maintainer with the relevant
account / credentials and cannot be automated by CI or an agent.

---

## 0. Pre-flight (every release)

- [ ] Working tree clean, on the release branch.
- [ ] `npm run sync-data` — refresh bundled English prompts from upstream.
- [ ] `npm run build` — `tsc` must exit 0.
- [ ] `npm test` — full Vitest suite green.
- [ ] `npm run lint` — eslint clean.
- [ ] `npm audit` — expect 0 vulnerabilities (security baseline).
- [ ] Confirm `version` in `package.json` is bumped (semver) and matches `src/version.ts`.
- [ ] Confirm `files` ships only what's needed: `dist`, `data`, `README.md`, `LICENSE`.
- [ ] Sanity-check the package contents **without publishing**:

  ```bash
  npm pack --dry-run
  ```

  Verify the tarball contains `dist/`, `data/prompts-en-US.json`,
  `data/categories-en-US.json`, `README.md`, `LICENSE` — and **no** `zh-CN`
  files, no `src/`, no `scripts/`, no test files.

---

## 1. Publish to npm

The package is scoped (`@ai3stack/...`) and public; `publishConfig.access` is already set
to `public` so the scope won't default to private.

- [ ] **[HUMAN]** Authenticate as the npm account that owns the `@ai3stack` scope.
      The `@ai3stack` scope belongs to the `ai3stack` user automatically — it is a
      username scope, so no npm organization is required.
- [ ] **[HUMAN]** **2FA + non-interactive publish.** The account has 2FA enabled, so a
      plain `npm login` prompts for an OTP and even a regular *Publish* token is rejected
      with `EOTP`. To publish from a server / CI, generate an **Automation** token
      (npmjs.com → Access Tokens → Generate New Token → Classic → **Automation**), write
      it to a repo-external `~/.npmrc`
      (`//registry.npmjs.org/:_authToken=...`, `chmod 600`), publish, then delete it.
      Automation tokens bypass the 2FA OTP. (At an interactive terminal,
      `npm publish --otp=<code>` with a fresh authenticator code also works.)
- [ ] Dry run first:

  ```bash
  npm publish --dry-run --access public
  ```

- [ ] Publish for real:

  ```bash
  npm publish --access public
  ```

  > `prepublishOnly` runs `npm run sync-data && npm run build` automatically before
  > the upload, so the tarball always contains freshly built `dist/` and synced data.

- [ ] Verify: `npm view @ai3stack/prompts-mcp version` returns the new version, and
      `npx -y @ai3stack/prompts-mcp` cold-starts cleanly.

  > **First publish of a brand-new scope:** `npm view` / the npm web page may keep
  > returning 404 for several minutes after a successful publish — that is read-replica
  > propagation lag, not a failed upload. The definitive proof the upload succeeded is
  > that re-running `npm publish` fails with
  > `403 cannot publish over the previously published versions: <version>`.
- [ ] Tag the release in the project's version control.

**Do not run `npm publish` as part of automated/agent work — it is a [HUMAN] gate.**

---

## 2. Submit to MCP registries & directories

All of these are one-time-per-listing submissions (then updated on major releases).
Each requires an account on the target platform — **[HUMAN]** for first-time signup
and for anything behind a review queue.

### Official MCP Registry (`registry.modelcontextprotocol.io`)
- [ ] **[HUMAN]** Authenticate with the registry publisher tooling (the official MCP
      `mcp-publisher` CLI / GitHub-based auth).
- [ ] Provide a `server.json` describing the server (name `io.ai3stack/prompts-mcp` style
      namespace, the `npx -y @ai3stack/prompts-mcp` stdio runtime, description, homepage
      `https://ai3stack.com`).
- [ ] Publish; confirm the entry resolves in the registry.

### Smithery (`smithery.ai`)
- [ ] **[HUMAN]** Create / sign in to a Smithery account.
- [ ] Add the server (point at the published npm package). Provide the stdio command
      and a short description. Smithery can run a connection/scan check.
- [ ] Confirm the listing renders the 11 tools.

### Glama (`glama.ai/mcp/servers`)
- [ ] **[HUMAN]** Sign in to Glama.
- [ ] Submit the server (npm package + homepage). Glama auto-indexes many servers;
      claim/submit to ensure metadata is correct.

### mcp.so
- [ ] **[HUMAN]** Submit the server to the mcp.so directory (npm package + description
      + homepage).

### awesome-mcp lists (e.g. `awesome-mcp-servers`)
- [ ] **[HUMAN]** Open a pull request adding `@ai3stack/prompts-mcp` to the relevant
      category, with a one-line description and the install snippet. Subject to the
      list maintainer's review.

### OpenAI ChatGPT App Directory (remote MCP)
- [ ] **[HUMAN]** Requires a publicly reachable, authenticated SSE deployment
      (`MCP_TRANSPORT=sse` + `MCP_AUTH_TOKEN`, behind HTTPS).
- [ ] **[HUMAN]** Submit the connector through OpenAI's developer / App Directory
      submission flow. This goes through OpenAI review and is gated on their
      acceptance — not self-serve.

---

## 3. Post-publish

- [ ] Update README badges if the published version changed.
- [ ] Announce in the relevant channels.
- [ ] Watch the npm package page and `npx` cold-start for the first few hours.

---

## Quick reference: what needs a human

| Step | Needs human? | Why |
|---|---|---|
| build / test / lint / audit / `npm pack --dry-run` | No | Fully automatable |
| npm auth (Automation token) | **Yes** | Credentials for the `@ai3stack` scope |
| 2FA on publish | **Yes** | Automation token bypasses OTP; interactive needs authenticator code |
| `npm publish --access public` | **Yes** | Irreversible release; must be deliberate |
| Official MCP registry auth + publish | **Yes** | Account / publisher auth |
| Smithery / Glama / mcp.so listings | **Yes** | Platform accounts |
| awesome-mcp PR | **Yes** | External maintainer review |
| ChatGPT App Directory | **Yes** | Hosted deployment + OpenAI review |
