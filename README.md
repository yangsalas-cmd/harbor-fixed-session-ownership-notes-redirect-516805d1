# Harbor banking security lab

Fictional banking application with synthetic money, deliberately vulnerable code,
and a fast presenter workflow based on a completed Codex Security scan.
Keep this training runtime local/private; never use it for real accounts.

## Start the demo

Requires Node.js 22+, Git, and no npm packages:

```sh
node scripts/dev.mjs
```

Open http://127.0.0.1:4173. The same process also serves the isolated local
Security review at http://127.0.0.1:4180. Keep the terminal open.
If `node` is not on your Mac's PATH, use Codex's bundled executable:

```sh
~/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/dev.mjs
```

1. Click **Test £1,000 attack**. Observe the unauthorized synthetic transfer.
2. Click **View security findings**. Review the four actual saved scan findings,
   evidence and proposed fixes. No fresh scan or native workbench is simulated.
3. Choose **Fix → create comparison repo**, or fix all four.
4. Open the comparison, test output, and isolated fixed banking preview.
5. In the ownership-fixed preview, repeat **Test £1,000 attack**: expect HTTP 403.

The original banking handler remains vulnerable for repeat presentations. The
ownership fix includes the session-integrity prerequisite so forged identities
cannot bypass it. Other individual fixes intentionally leave unselected findings.
The baseline suite asserts vulnerable behavior; generated copies replace relevant
expectations with regression checks and retain legitimate payment/notes controls.
The note rendering regression also needs browser inspection; automated browser
QA was unavailable in this environment, so no browser execution proof is claimed.

## GitHub publication

The Fix action creates a separate local Git repository with two commits, runs its
tests/build validation, and publishes a new **public** GitHub repository when
GitHub CLI is signed in. It never changes the original public repository's main.
Each selected fix set reuses its existing copy on retry; different sets get separate
repositories. Source comparisons and previews bind to the recorded checked commit.
Copies with subsequent local edits must be restored before reuse/publication.

GitHub CLI must be installed. Set `HARBOR_GH_PATH` to its absolute path, or use the
verified official copy at `../harbor-demo-tools/gh` in this workspace. Sign in once:

```sh
../harbor-demo-tools/gh auth login --hostname github.com --git-protocol https --web
```

If not signed in, local comparisons still work and display a **Publish this copy
to GitHub** button. Reload the review page after sign-in. GitHub credentials stay
in the CLI/OS credential store, never in website JavaScript or generated source.

Generated repositories and manifests live in ignored `.demo-workspace/`. Do not
publish that folder or the parent workspace. The privileged controller binds to
loopback on a separate origin, rejects foreign-origin writes, and requires an
unpredictable request token. Vulnerable bank pages do not get GitHub credentials.

## Provenance and checks

Saved scan: e8e7ae05-928e-44a0-a33d-0695453e5dc6. Scanned source revision:
9e93dc6069ec4578cf3c0caba738c5fa9f4cf96e. Public baseline with matching contents:
5781c40bcc07cc6412368a98850d9a67f2473837. This update adds presenter UI and tools;
the original security handlers stay unchanged. No new scan covers the controller.
The scan found 3 Medium and 1 Low findings; diagnostics were informational.
Prepared patches are a shortcut using those results, not live AI patch generation.

```sh
node --test tests/*.test.mjs
bash scripts/build.sh
node scripts/validate-artifact.mjs
```

The hosted Worker is a separate banking preview. Local repository creation,
GitHub publishing and fixed previews require the Node presenter server; they are
not deployed as privileged endpoints in the hosted Worker.
