# Task Mode — Prompt Quality QA Log

Real-world test cases run against MDPilot Task mode. Each entry records what worked,
what failed, the root cause, and what was fixed (or still needs fixing).

---

## Test 001 — AWS Cost Investigation

**Input:** "London prod acc cost increased for May, use --profile AdministratorAccess-010928207579, compare with last 3 months"
**Date:** June 2026
**Outcome:** Root cause identified but required significant mid-session correction

---

### What was good

| Observation | Why it mattered |
|---|---|
| AWS domain detected from `--profile` context | Correct domain lens was applied |
| Given/When/Then acceptance criteria | Well-formed and testable without clarification |
| Out of scope defined | Prevented irrelevant scope expansion |
| Starting command anchored the agent | `aws cloudfront get-distribution` gave a concrete first step |

---

### What failed

#### Failure 1 — Wrong year (2024 instead of 2026)
- **What happened:** The generated command used `Start=2024-05-01, End=2024-05-31`
- **Why:** No rule to verify the year against task context; template from an old example silently carried the wrong year
- **Impact:** User caught this manually and corrected mid-session

#### Failure 2 — Off-by-one end date (root cause of $92 discrepancy)
- **What happened:** `End=2026-05-31` silently excluded May 31st; API returned $1,432 instead of true $1,480
- **Why:** AWS Cost Explorer uses exclusive end dates — `End=2026-05-31` means "up to but NOT including May 31". The prompt had no knowledge of this API behaviour
- **Impact:** The entire first analysis was wrong. The discrepancy was only caught when the user shared a console screenshot. The prompt embedded the buggy command so the bug was inherited without question

#### Failure 3 — Wrong metric
- **What happened:** `--metrics AmortizedCost` was used instead of `UnblendedCost`
- **Why:** No rule to match the CLI metric to the user's comparison source (the AWS console)
- **Impact:** API numbers did not match the console for the whole session; caused confusion on the $92 gap

#### Failure 4 — Single-month comparison
- **What happened:** Only May data was fetched initially; comparison months came in later as a vague "last 2 months" addition
- **Why:** No rule requiring investigation tasks to fetch ≥ 3 comparison periods up front
- **Impact:** Could not distinguish a new trend from an existing one. March data later showed April was already elevated above March — the full picture required two re-runs

#### Failure 5 — Wrong watch-out (NAT Gateway instead of Public IPv4)
- **What happened:** Watch-out warned about NAT Gateway charges; the actual cause was Public IPv4 address charges ($0.005/hr/IP) under the VPC service line
- **Why:** The AWS lens had one generic "cost traps" note; the agent served it regardless of whether it applied to the specific scenario
- **Impact:** Sent the investigation in the wrong direction initially

---

### Fixes applied

| Fix | File | What changed |
|---|---|---|
| Year validation rule | `src/lib/prompts/task.ts` | Implementation plan section now requires year to be verified against task context |
| Exclusive end date anti-pattern | `src/lib/prompts/task.ts` | Added `DO NOT use End=YYYY-MM-31 for full-month coverage` — note `[DATE_EXCLUSIVE]` when API uses exclusive end dates |
| Metric verification rule | `src/lib/prompts/task.ts` | Added `[METRIC_VERIFY]` flag requirement when metric might not match the user's comparison source |
| Investigation task rule | `src/lib/prompts/task.ts` | Investigation tasks (cost, metrics, anomalies) must fetch ≥ 3 periods and end with a "verify totals against source" step |
| Watch-out relevance gate | `src/lib/prompts/task.ts` | Quality bar now requires watch-outs to fit the specific scenario, not all watch-outs in the domain lens |
| AWS Cost Explorer traps | `src/lib/task/domains.ts` | Added to AWS lens: exclusive end dates, UnblendedCost vs AmortizedCost, 3-month minimum, Public IPv4 pricing |
| AWS detection patterns | `src/lib/task/domains.ts` | Added: `cost explorer`, `billing`, `cost increase`, `--profile`, `AdministratorAccess` — so AWS lens fires on cost tasks |

---

### What a correct output looks like (after fixes)

```
aws ce get-cost-and-usage \
  --profile AdministratorAccess-010928207579 \
  --time-period Start=2026-03-01,End=2026-06-01 \   ← 3 months; End is exclusive → covers all of May
  --granularity MONTHLY \
  --metrics UnblendedCost \                          ← matches AWS console
  --group-by Type=DIMENSION,Key=SERVICE

# [DATE_EXCLUSIVE]: End=2026-06-01 includes May 31. End=2026-05-31 silently excludes it.
# Final step: verify totals match Cost Explorer monthly view before reporting findings.
```

---

## Test 002 — CloudFront Search Debug

**Input:** Completed CloudFront setup for ParamountCruises; team reports search failing at `cdn-test.paramountcruises.com/search`; debug and fix
**Date:** June 2026
**Outcome:** Root cause identified and fixed ✅ — but required extensive live investigation that a better prompt would have avoided

---

### What was good

| Observation | Why it mattered |
|---|---|
| Specific IDs provided | Distribution ID (E1ZHD4SEWXARZH), AWS profile, GTM container ID, test URL — all exact. No time wasted on "what account / which distribution?" |
| Structure was usable | Clear sections meant the agent started without back-and-forth |
| Given/When/Then criteria | Well-formed and testable |
| Out of scope defined | Prevented irrelevant work on GTM container and distribution ID |
| Starting command anchored the agent | `aws cloudfront get-distribution` was the right first step |

---

### What failed

#### Failure 1 — Architecture was missing
- **What happened:** Tech stack listed "AWS CloudFront, Google Tag Gateway" only. The actual request chain was: `CloudFront → ALB → nginx (ECS) → Dreamlake Fastly → App`
- **Why:** The user knew the full stack but the prompt had no field or instruction to capture the request chain; it was omitted as implicit
- **Impact:** Debugging started at CloudFront and had to work backwards through each layer to reach nginx (ECS) — where the root cause lived. Every layer between CloudFront and nginx was invisible

**What to add:** A one-line "request chain" in Context: `Browser → CloudFront (E1ZHD4SEWXARZH) → ALB → nginx (ECS) → Dreamlake → App`

#### Failure 2 — Wrong domain in Requirements
- **What happened:** Requirements said "debug issue on CloudFront distribution for www.paramountcruises.com" but the failing URL was `cdn-test.paramountcruises.com`
- **Why:** These are architecturally different — www currently bypasses CloudFront entirely
- **Impact:** Created ambiguity about which domain was in scope; had to be clarified

**What to add:** "Note: `cdn-test` is the new test domain routed through CloudFront; `www` still goes direct to Dreamlake and is not in scope."

#### Failure 3 — Implementation plan assumed logging was enabled
- **What happened:** Step 3 said "Check the CloudFront logs for errors" — but logging was disabled (`"Logging": {"Enabled": false}`)
- **Why:** No prerequisite check; the plan assumed logging was available
- **Impact:** Step 3 was a dead end; wasted time before pivoting to ECS CloudWatch logs

**What to add:** "Verify CloudFront access logging is enabled (`"Logging.Enabled": true`) before Step 3. If disabled, go directly to ECS CloudWatch log groups."

#### Failure 4 — Decision log empty
- **What happened:** The most useful context was absent — why was `paramount-cruises-uk.client.prod.eu-west.dreamlake.io` chosen as the nginx origin?
- **Why:** The user had the reasoning but the prompt didn't prompt for prior decisions on setup choices
- **Impact:** Knowing the origin hostname choice and its rationale would have surfaced the root cause immediately; instead it required tracing the full chain live

**What to add:** When the task type is setup/config and a decision log exists, capture: "Origin chosen: [hostname] — Reason: [rationale]"

#### Failure 5 — Out of scope listed a non-suspect as suspect
- **What happened:** "Updating the Dreamlake CDN-Loop custom header" was listed as out of scope
- **Why:** The user may have been cautious about touching it, but listing it implies it was a considered candidate
- **Impact:** Added investigative noise — "if it's explicitly out of scope, should we look at it?"

**Rule:** Only list something as out of scope if it is genuinely related to the task and explicitly excluded. Don't use out of scope as a "we won't touch this" list.

#### Failure 6 — Acceptance criteria was ambiguous on response type
- **What happened:** "Search results are displayed correctly" — but the search page always returns 200 HTML regardless of query validity. The actual failure was a 400 on specific parameter combinations
- **Why:** No instruction to specify the expected HTTP status code and content-type in acceptance criteria for HTTP endpoints
- **Impact:** The acceptance criterion could be satisfied by a broken page that returned 200 with an error UI

**What a precise criterion looks like:** `GET /search?pageNumber=0&pageSize=10&isActiveFlag=true → HTTP 200, Content-Type: text/html, body contains search result elements`

---

### Fixes applied (June 2026)

| Gap | File changed | What was added |
|---|---|---|
| Architecture / request chain missing | `task.ts` Context section | MULTI-HOP ARCHITECTURE rule: when task involves CDN/reverse proxy/load balancer, require one-line "Request chain: Browser → [each hop] → Origin" |
| Domain/environment mismatch | `task.ts` Requirements section | MULTI-ENVIRONMENT rule: when task mentions multiple hostnames or envs, require explicit "In scope: X. Out of scope: Y — different routing path" note |
| Prerequisite assumptions in implementation plan | `task.ts` Implementation plan section | PREREQUISITE CHECKS rule: for any step consuming a service (logging, tracing, metrics), add a Step 0 that verifies the service is enabled with check command and fallback |
| Empty decision log on setup/config tasks | `task.ts` Decision log section | SETUP/CONFIG TASKS rule: actively prompt for origin/target hostname and config choice rationale even if not in the raw input |
| Acceptance criteria HTTP precision | `task.ts` Acceptance criteria section | HTTP ENDPOINTS rule: require status code + Content-Type + body assertion for any HTTP criterion; "displays correctly" explicitly blocked |
| quality_bar | `task.ts` quality_bar block | Added 4 new gates: HTTP criteria precision, prerequisite Step 0, request chain presence, setup decision log capture |
| anti_patterns | `task.ts` anti_patterns block | Added 5 new DO NOTs covering all Test 002 failure modes |

---

## Cross-test Patterns

Recurring weaknesses observed across both tests:

| Pattern | Both tests | Fix status |
|---|---|---|
| Implementation plan assumes prerequisites exist (logging enabled, correct year, metric available) | ✅ Test 001, ✅ Test 002 | ✅ Fixed — PREREQUISITE CHECKS rule + DATE/TIME-RANGE VALIDATION |
| Tech stack description was shallower than the real system | ✅ Test 002 | ✅ Fixed — MULTI-HOP ARCHITECTURE rule forces request chain into Context |
| Acceptance criteria accepted vague outcomes ("works", "displays correctly") | ✅ Test 001 ($92 discrepancy), ✅ Test 002 (200 with broken UI) | ✅ Fixed — HTTP ENDPOINTS rule requires status + Content-Type + body assertion |
| Watch-outs pulled from domain lens without checking task relevance | ✅ Test 001 (NAT Gateway), ✅ Test 002 (cache invalidation vs actual problem) | ✅ Fixed — watch-out relevance gate + anti_pattern DO NOT for scenario mismatch |

---

## Score Summary

| Area | Test 001 (Before) | Test 001 (After) | Test 002 (Before) | Test 002 (After fixes) |
|---|---|---|---|---|
| Structure & formatting | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Specific IDs & credentials | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Architecture description | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Acceptance criteria precision | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Implementation plan accuracy | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Decision log / prior context | ⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ |
| Watch-out relevance | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
