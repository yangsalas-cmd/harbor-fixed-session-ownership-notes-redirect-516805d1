# Harbor prepared-fix comparison

Selected fixes: session, ownership, notes, redirect.

This is a fictional banking training application with synthetic accounts. Only the listed fixes are included; unselected seeded vulnerabilities remain. Do not use for real accounts or production. No fresh scan runs when this copy is created.

Requires Node.js 22+. Run node scripts/dev.mjs, then open http://127.0.0.1:4173. Run node --test tests/*.test.mjs to check the selected controls and remaining training seeds. There are no npm dependencies. State resets on restart. Stop another copy using port 4173 first, or set PORT=4175.

Compare the two commits in this repository: the vulnerable training baseline and the prepared fix. The original vulnerable repository is https://github.com/yangsalas-cmd/harbor-bank-security-lab. Its main branch is not changed by this demo.

Diagnostics remain informational. This comparison copy does not include the privileged presenter controller or any GitHub credentials. The View security findings button links to the original local presenter on port 4180 while it is running.
