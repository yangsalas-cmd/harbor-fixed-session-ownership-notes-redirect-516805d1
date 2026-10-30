# Seeded vulnerability inventory — not scanner results

These are exercise design ratings, not CVSS scores or Codex Security findings.
Five issues span four severity bands; the two High issues have different impacts.
Informational exposure is not presented as a fifth severity band merely to make
five labels. Findings and ranks must be reassessed using the actual threat model.

| Priority | Provisional risk | Seed | Impact | Proposed fix |
| --- | --- | --- | --- | --- |
| 1 | Critical | Client-controlled, unsigned session claims | A visitor can change role and identity in the cookie, impersonate customers, and reach the admin account listing. | Replace client-controlled claims with cryptographically random opaque session IDs and a server-side session store. Keep roles server-side; expire sessions. Verify a forged cookie yields 401/403. |
| 2 | High | Missing ownership checks for account reads and transfers | An authenticated customer can view another customer's synthetic account and debit it through the from parameter. | Derive source accounts from the authenticated identity and enforce ownership for every account read and debit, returning 403 otherwise. Retest both read and transfer paths. |
| 3 | High | Stored HTML in account notes is rendered using innerHTML | Saved notes execute script in the banking origin when displayed. With session tampering this can also reach another user's notes. | Build note nodes using createElement and textContent. If rich text is needed, use a maintained allowlist sanitizer. Add a strict CSP as defence in depth. Verify a stored HTML payload appears as text and does not execute in a real browser. |
| 4 | Medium | Unvalidated redirect target in /continue | A crafted bank-origin link can redirect a visitor to an attacker-selected external page, supporting phishing. | Parse the target against the application origin, reject cross-origin URLs and non-HTTP schemes, and redirect only to an allowlisted local route. Test external and protocol-relative URLs. |
| 5 | Low | Unauthenticated verbose diagnostics | The diagnostics endpoint discloses session format, admin route names, source path and implementation version, reducing attacker discovery effort. | Remove public internal diagnostics; expose only a minimal health response and send detailed diagnostics to access-controlled logs. Verify internal fields are absent to anonymous callers. |

## Threat model

The attacker is an anonymous visitor or a customer of this fictional app. The
application boundary is the Worker fetch handler. The session cookie, JSON bodies,
URL paths and query strings are attacker controlled. Asset owners are separate
customers; knowing an account ID confers no access. Admin listing is privileged.

All balances and names are synthetic. No external transfers, email, real bank
connections, filesystem access, shell execution or private contact data exist.
No real credentials or secrets are embedded. In-memory state is demo storage,
not a production durability design. Private Sites access is an outer demo access
gate; it does not make application-level authorisation bugs disappear.

## Evidence and regression checks

Run npm test. The baseline suite verifies ordinary page and payment flows,
rejects negative transfers and anonymous account access, and reproduces each
seeded weakness. Existing weakness assertions must be converted to secure
expectations as each real fix is reviewed. A green baseline test suite confirms
that the exercise is reproducible, not that the code is secure.

The five intended seeds do not guarantee exactly five scanner results. For
example, the scanner may identify additional hardening concerns or combine
related paths. Keep scanner output separate from this authored inventory.
