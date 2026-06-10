export type Domain =
  | 'aws'
  | 'gcp'
  | 'azure'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'devops'
  | 'data_ml'
  | 'mobile'
  | 'security'
  | 'general';

export interface DomainLens {
  domain: Domain;
  detectionPatterns: RegExp[];
  expertiseNote: string;
}

export const DOMAIN_LENSES: DomainLens[] = [
  {
    domain: 'aws',
    detectionPatterns: [
      /\baws\b/i, /\bS3\b/, /\bEC2\b/, /\bLambda\b/i, /\bCloudFront\b/i,
      /\bECS\b/, /\bEKS\b/, /\bRDS\b/, /\bDynamoDB\b/i, /\bSQS\b/,
      /\bSNS\b/, /\bIAM\b/, /\bCloudWatch\b/i, /\bAPI Gateway\b/i,
      /\bCognito\b/i, /\bRoute 53\b/i, /\bElastiCache\b/i, /\bSageMaker\b/i,
      /\bcost explorer\b/i, /\bce get-cost\b/i, /\bbilling\b/i,
      /\bcost increase\b/i, /\bcost anomaly\b/i, /\baws cost\b/i,
      /--profile\s+\w+/i, /AdministratorAccess/i,
    ],
    expertiseNote: `AWS-specific watch-outs:
- IAM least-privilege: never use * in Action or Resource on new policies. Scope to specific ARNs and add a deny-override for sensitive actions.
- S3 bucket policies vs ACLs: ACLs are legacy — use bucket policies + block public access by default. Enable versioning and object lock for compliance buckets.
- Lambda cold starts: prefer provisioned concurrency for latency-sensitive paths; arm64 is cheaper and faster for most workloads. Set memory thoughtfully — more memory = more CPU = faster cold start.
- CloudFront cache invalidation: /* invalidations cost $0.005/path after 1k/month free — use versioned paths instead (e.g. /assets/v2/) and set appropriate Cache-Control headers at origin.
- RDS: enable deletion protection and automated backups; use parameter groups to version DB config changes. Avoid changing instance class in prod during peak. Use RDS Proxy for serverless connections.
- SQS: set dead-letter queue before going live; visibility timeout must be ≥ function timeout or messages re-appear mid-process. Use FIFO queues only when ordering is truly required — they're slower and more expensive.
- Cost Explorer — CRITICAL date/metric traps: (1) End dates are EXCLUSIVE — End=2026-05-31 silently excludes May 31st; to include all of May use End=2026-06-01 (first day of the next month). (2) Always use --metrics UnblendedCost to match the AWS console view — AmortizedCost spreads Reserved Instance charges over time and will not match console totals. (3) For cost increase investigations, always fetch ≥ 3 months in one query so you can distinguish a new trend from a one-month anomaly. (4) New Public IPv4 address charges ($0.005/hr/IP, rolled out 2024) appear under the VPC service line — not NAT Gateway — and are a common surprise cost in accounts that haven't audited their EIPs and load balancers.
- Cost traps: NAT Gateway charges per GB — route S3/DynamoDB traffic through VPC endpoints. Reserved Instances/Savings Plans save 30-60% for steady workloads. Enable Cost Anomaly Detection.
- CloudFormation/CDK drift: always use change sets before applying; never make manual console changes to managed resources or the stack drifts silently.`,
  },
  {
    domain: 'gcp',
    detectionPatterns: [
      /\bgcp\b/i, /\bgoogle cloud\b/i, /\bcloud run\b/i, /\bbigquery\b/i,
      /\bpub.?sub\b/i, /\bgke\b/i, /\bfirebase\b/i, /\bcloud storage\b/i,
      /\bvertex ai\b/i, /\bcloud functions\b/i, /\bspanner\b/i, /\bgcloud\b/i,
      /\bfirestore\b/i, /\bcloud sql\b/i, /\bmemorystore\b/i,
    ],
    expertiseNote: `GCP-specific watch-outs:
- Cloud Run: set --concurrency and --max-instances explicitly — unlimited concurrency + auto-scaling can surprise billing. Set min-instances = 1 for latency-critical services to avoid cold starts.
- BigQuery: always partition tables by date/column before querying in prod. Unpartitioned full scans are expensive. Use LIMIT with preview queries and set project-level cost controls (maximum bytes billed).
- IAM: prefer predefined roles over primitive roles (viewer/editor/owner). Use service accounts with Workload Identity Federation instead of key files — key files are a credential management nightmare.
- Pub/Sub: set message retention and dead-letter topics before publishing. Unacked messages accumulate until retention window and are dropped. Enable exactly-once delivery only when your subscriber can handle it.
- GKE: enable Workload Identity on new clusters — mounting service account key files into pods is a security antipattern. Use node auto-provisioning and vertical pod autoscaling together for cost efficiency.
- Cloud Storage: uniform bucket-level access > per-object ACLs. Enable versioning on critical buckets. Set lifecycle rules to transition cold data to Nearline/Coldline/Archive.
- Firestore: indexes are required for compound queries — plan composite indexes before building queries or queries silently return 0 results. Firestore is strongly consistent in native mode; Datastore mode is eventually consistent.`,
  },
  {
    domain: 'azure',
    detectionPatterns: [
      /\bazure\b/i, /\baks\b/i, /\bblob storage\b/i, /\bservice bus\b/i,
      /\bazure functions\b/i, /\bcosmos db\b/i, /\bapim\b/i, /\barm template\b/i,
      /\bbicep\b/i, /\bapp service\b/i, /\bentra id\b/i, /\baad\b/i,
      /\bazure devops\b/i, /\bkey vault\b/i, /\bstorage account\b/i,
    ],
    expertiseNote: `Azure-specific watch-outs:
- Managed Identity over service principal keys: use system-assigned or user-assigned Managed Identities to avoid key rotation and credential leakage. Grant RBAC roles at the minimum scope (resource > resource group > subscription).
- App Service plans: consumption plan has cold-start latency — use Premium EP1 for always-warm functions. Avoid per-function scale unit billing surprises; always set function timeout explicitly.
- Cosmos DB: RU/s billing is tricky — model access patterns before choosing partition key; a hot partition saturates provisioned RUs and returns 429s. Enable autoscale for variable workloads; avoid serverless for high-throughput steady workloads.
- Service Bus: sessions are per-queue — enable them at queue creation, not after (you'd need to recreate). Set max-delivery-count and dead-letter on first deploy. Use premium tier for VNet integration and message size > 256KB.
- AKS: use Azure CNI over kubenet for production — Pod CIDR exhaustion is a common incident with kubenet in large clusters. Enable cluster auto-scaler and node pools per workload type.
- Bicep/ARM: use deployment stacks or Blueprints for environment guardrails. Never deploy main.bicep directly to prod — use a pipeline with approvals and what-if analysis first.
- Entra ID (AAD): conditional access policies can block automation service principals — test with break-glass accounts before locking down. Use app registrations with certificate credentials, not client secrets (secrets expire and aren't rotated automatically).`,
  },
  {
    domain: 'frontend',
    detectionPatterns: [
      /\breact\b/i, /\bnext\.?js\b/i, /\bvue\b/i, /\bsvelte\b/i, /\bangular\b/i,
      /\btailwind\b/i, /\bui component\b/i, /\bhydrat/i, /\bcsr\b/i, /\bssr\b/i,
      /\ba11y\b/i, /\baccessib/i, /\blcp\b/i, /\bcls\b/i, /\bfcp\b/i,
      /\bweb vitals\b/i, /\bfrontend\b/i, /\bcomponent\b/i, /\bdesign system\b/i,
    ],
    expertiseNote: `Frontend-specific watch-outs:
- Hydration mismatches: server and client must render identical HTML. Never use Date.now(), Math.random(), or browser APIs (window/document) in component render without useEffect or 'use client'. Mismatches cause silent hydration failures in prod that don't appear in dev.
- Core Web Vitals: LCP must be ≤ 2.5s — preload the hero image, avoid lazy-loading above-fold content. CLS > 0.1 is a ranking signal — always set explicit width/height on images and embeds. FID/INP < 200ms — avoid long tasks on the main thread.
- Accessibility: interactive elements must have accessible names (aria-label or visible text). Focus indicators must not be removed (outline: none without replacement = WCAG 2.1 AA failure). Test with axe-core or Lighthouse before shipping.
- Bundle size: code-split at route boundaries. Analyze with next-bundle-analyzer or vite-bundle-visualizer before shipping — one moment.js import costs 300KB. Use dynamic imports for heavy components below the fold.
- State management: avoid storing derived state in useState — derive it inline or memo it. Server state (fetched data) belongs in React Query / SWR, not Redux/Zustand.
- Client-side only rendering: if a component only works in the browser, gate it behind dynamic(() => import(...), { ssr: false }) — avoids FOUC and hydration panics.
- Error boundaries: wrap route-level components in error boundaries. An uncaught error in one component tree should not blank the entire page.`,
  },
  {
    domain: 'backend',
    detectionPatterns: [
      /\bapi\b/i, /\brest(ful)?\b/i, /\bgraphql\b/i, /\bwebhook\b/i,
      /\bexpress\b/i, /\bfastapi\b/i, /\bdjango\b/i, /\brails\b/i, /\bgrpc\b/i,
      /\bmicroservice\b/i, /\bworker\b/i, /\bqueue\b/i, /\brate.?limit/i,
      /\bauth(n|orization)?\b/i, /\bendpoint\b/i, /\bserver.?side\b/i,
    ],
    expertiseNote: `Backend-specific watch-outs:
- Idempotency: every mutating endpoint should accept (or generate) an idempotency key — clients retry on network failure; double-processing orders/payments is catastrophic. Store idempotency keys with a TTL in Redis or the DB.
- Webhook signatures: always verify HMAC or RSA signatures before processing. Log unverified payloads to a separate audit table, never process them. Respond 200 immediately and process async — synchronous webhook handlers time out under load.
- Rate limiting: implement per-IP and per-user limits separately. Shared rate limits let one user degrade others. Use a sliding window algorithm, not a fixed bucket — fixed buckets allow 2× burst at the window boundary.
- Auth: JWTs must be verified with the full signature — never decode without verify(). Rotate refresh tokens on use (refresh token rotation). Set short access token TTLs (15 min max). Validate audience and issuer claims.
- N+1 queries: ORMs hide N+1 — log slow queries in dev (set log_min_duration_statement = 100ms in Postgres). Use DataLoader-style batching for GraphQL resolvers. Add query timeout at the DB connection level.
- Graceful shutdown: handle SIGTERM — finish in-flight requests (drain), close DB pool, stop consuming from queues. Kubernetes sends SIGTERM 30s before SIGKILL — use that window. Set terminationGracePeriodSeconds accordingly.
- Error handling: never expose internal error messages or stack traces to API clients — log them server-side with a correlation ID, return only the correlation ID to the client.`,
  },
  {
    domain: 'database',
    detectionPatterns: [
      /\bpostgres(ql)?\b/i, /\bmysql\b/i, /\bmongodb\b/i, /\bsqlite\b/i,
      /\bmigrat/i, /\bschema\b/i, /\bindex(ing|es)?\b/i, /\btransact/i,
      /\bforeign key\b/i, /\bnormali[sz]/i, /\borm\b/i, /\bprisma\b/i,
      /\bdrizzle\b/i, /\bsupabase\b/i, /\bquery\b/i, /\bsql\b/i,
    ],
    expertiseNote: `Database-specific watch-outs:
- Migrations: always make migrations backwards-compatible — deploy code that handles both old and new schema before running the migration. Never rename a column in one step; use three deploys: add new column → backfill → remove old column.
- Indexes: adding an index on a large table locks writes on Postgres < 12 — use CREATE INDEX CONCURRENTLY. Monitor index bloat with pg_stat_user_indexes; unused indexes still impose write overhead.
- Transactions: keep transactions short — long transactions hold locks, block autovacuum, and cause replication lag. Never do I/O (HTTP calls, file writes) inside a transaction. Set statement_timeout and lock_timeout on all connections.
- EXPLAIN: run EXPLAIN (ANALYZE, BUFFERS) on any query touching > 100k rows. Seq scans on large tables are almost always a bug. Use pg_stat_statements to find the slow queries you didn't know about.
- Connection pooling: Postgres has a connection limit (default 100). Use PgBouncer/Supabase pooler in transaction mode for serverless deployments — not session mode (which holds connections open while the function is idle).
- Backups: test restore, not just backup. RTO and RPO must be documented. Point-in-time recovery requires WAL archiving — enable it before you need it.
- Soft deletes: if using deleted_at, add a partial index WHERE deleted_at IS NULL to all frequently-queried "active" lookups — or every query becomes a full table scan filtering tombstones.`,
  },
  {
    domain: 'devops',
    detectionPatterns: [
      /\bkubernetes\b/i, /\bk8s\b/i, /\bdocker\b/i, /\bhelm\b/i, /\bterraform\b/i,
      /\bci.?cd\b/i, /\bgithub actions\b/i, /\bjenkins\b/i, /\bdeploy/i,
      /\bcanary\b/i, /\bblue.?green\b/i, /\binfrastructure\b/i, /\bcertificate\b/i,
      /\bssl\b/i, /\btls\b/i, /\bmonitoring\b/i, /\bobs[ae]rvability\b/i,
      /\bpipeline\b/i, /\brelease\b/i, /\brollback\b/i,
    ],
    expertiseNote: `DevOps-specific watch-outs:
- Canary deploys: route 5% traffic before 100%. Monitor error rate and p99 latency for at least one full request cycle (≥ 5 min) before promoting. Define automated rollback triggers on SLO breach before deployment starts, not after.
- Kubernetes: set resource requests AND limits on every container — missing requests break scheduler bin-packing; missing limits allow noisy-neighbor OOM kills. Set PodDisruptionBudgets for critical workloads. Use readiness gates for zero-downtime deploys.
- Terraform: use remote state with locking (S3 + DynamoDB, or Terraform Cloud) — local state files cause split-brain. Never run terraform apply without a terraform plan output reviewed in a PR. Use workspaces or separate state files per environment.
- Secrets management: use Secrets Manager / Vault / External Secrets Operator — never bake secrets into Docker images or ConfigMaps. Rotate secrets via a reference change, not a code change. Audit secret access logs.
- TLS certificates: set cert expiry alerts at 30 days and 7 days. Let's Encrypt auto-renew fails silently if the DNS challenge fails — verify renewal dry-run in staging monthly.
- Observability: the three pillars — metrics (Prometheus/Datadog), logs (structured JSON with correlation IDs), traces (OpenTelemetry). Instrument before go-live; adding observability during an incident costs time you don't have.
- Health checks: implement both /healthz (liveness) and /readyz (readiness). Kubernetes kills pods that fail liveness; stops routing to pods that fail readiness. Test that readiness fails correctly during DB connection loss.`,
  },
  {
    domain: 'data_ml',
    detectionPatterns: [
      /\bml\b/i, /\bmachine learning\b/i, /\bpandas\b/i, /\bnumpy\b/i,
      /\bpytorch\b/i, /\btensorflow\b/i, /\bscikit/i, /\bfeature\b/i,
      /\btraining\b/i, /\bdataset\b/i, /\bembedding\b/i, /\bleak(age)?\b/i,
      /\bprecision\b/i, /\brecall\b/i, /\bdata pipeline\b/i, /\bmodel\b/i,
      /\binference\b/i, /\bfine.?tun/i, /\bvector\b/i, /\bairflow\b/i,
    ],
    expertiseNote: `ML/Data-specific watch-outs:
- Data leakage: fit the scaler/encoder ONLY on training data — calling fit_transform on the full dataset before splitting is the most common ML bug. Use sklearn Pipeline objects to enforce this mechanically — they prevent leakage by design.
- Train/val/test split: test set must be held out until final evaluation — never tune hyperparameters on test data. For time-series, always split chronologically, never shuffle. Use stratified splits for class imbalance.
- Reproducibility: set random seeds in numpy (np.random.seed), torch (torch.manual_seed), and Python's random module at entry. Pin library versions in requirements.txt — scikit-learn minor versions change algorithm defaults silently.
- Class imbalance: accuracy is misleading on imbalanced data — always report precision, recall, F1, and AUC-ROC together. Consider SMOTE or class_weight='balanced' before undersampling (undersampling discards real signal).
- Feature engineering: document every feature transformation in code and a feature store if possible. Models in prod fail because serving-time transformations diverge from training-time transformations — use the same pipeline artifact for both.
- Model deployment: validate input schema strictly at inference time — silent type coercions produce wrong predictions, not errors. Log input feature distributions (not just outputs) to catch data drift early.
- GPU memory: batch size is the first knob for OOM. Use gradient checkpointing for large models. Profile with torch.profiler before requesting more GPU — most OOMs are solvable at the same GPU size.`,
  },
  {
    domain: 'mobile',
    detectionPatterns: [
      /\bios\b/i, /\bandroid\b/i, /\bflutter\b/i, /\breact native\b/i,
      /\bswift(ui)?\b/i, /\bkotlin\b/i, /\bapp store\b/i, /\bplay store\b/i,
      /\boffline\b/i, /\bpush notif/i, /\bdeep link\b/i, /\bbiometric\b/i,
      /\bpermission\b/i, /\bmobile\b/i, /\bnative\b/i, /\bjetpack\b/i,
    ],
    expertiseNote: `Mobile-specific watch-outs:
- Offline-first: assume the network will be unreliable. Queue mutations locally (SQLite/WatermelonDB/Room) and sync on reconnect with conflict resolution defined upfront. Show optimistic UI immediately; handle conflict resolution explicitly, not as an afterthought.
- App Store review: Apple reviews every update — plan 1-3 day delay in your release timeline. Never ship a forced update that bricks users on the current version. Use feature flags (Remote Config / LaunchDarkly) to enable functionality server-side without a new submission.
- Permissions: request permissions at the moment of need, not on launch. Explain why before the system dialog appears — rejected permissions cannot be re-requested without the user navigating to Settings. iOS Home Screen widgets can't prompt for permissions.
- Push notifications: handle background refresh and foreground message display differently. Test on real devices — simulators and emulators do not reliably replicate push behavior. APNs tokens rotate; handle device token updates.
- Deep links: register URL schemes AND associated domains (iOS universal links / Android App Links). Validate every path the app handles — malformed deep links that crash on open cause App Store rejections.
- Battery / background: background processing is heavily throttled. Use BGTaskScheduler (iOS) or WorkManager (Android) — not Thread.sleep() loops or background timers.
- Accessibility: support Dynamic Type (iOS) / font scaling (Android) — hard-coded font sizes that ignore system scale fail accessibility review. Test with VoiceOver / TalkBack before shipping.`,
  },
  {
    domain: 'security',
    detectionPatterns: [
      /\bsecurity\b/i, /\bauth(enticati|oriz)/i, /\brbac\b/i, /\babac\b/i,
      /\bcryptograph/i, /\bencrypt/i, /\bvulnerabilit/i, /\bpentest\b/i,
      /\bsql inject/i, /\bxss\b/i, /\bcsrf\b/i, /\bcors\b/i, /\bcve\b/i,
      /\bowasp\b/i, /\bsso\b/i, /\bsaml\b/i, /\boidc\b/i, /\b2fa\b/i,
      /\bmfa\b/i, /\bsecret\b/i, /\bsession\b/i, /\btoken\b/i,
    ],
    expertiseNote: `Security-specific watch-outs:
- Authorization vs authentication: authn proves who you are; authz proves what you're allowed to do. Most vulnerabilities are authz failures — verify the user owns the requested resource on EVERY request, not just at login. Never trust client-sent role or permission claims.
- RBAC / IDOR: validate the JWT subject owns the requested resource ID at every endpoint. Indirect object references (changing ?id=123 to ?id=124) are IDOR vulnerabilities if you don't check ownership server-side.
- Input validation: validate at every system boundary — whitelist expected values, reject everything else. Never pass user input to shell commands (exec), SQL queries without parameterization, or file paths without canonicalization.
- Secrets: secrets in environment variables are readable by all processes in the container. Use Secrets Manager or Vault with short-lived leases. Scan for committed secrets with truffleHog/gitleaks in CI — pre-commit hooks don't cover force pushes.
- Cryptography: never implement your own crypto primitives. For password hashing: argon2id (preferred) or bcrypt (min cost 10) — not SHA-256 (fast hashing is wrong for passwords). For symmetric encryption: AES-256-GCM with a random nonce per message.
- CORS: don't set Access-Control-Allow-Origin: * on APIs that use cookies or carry sensitive data. Whitelist specific origins. SameSite=Lax on session cookies prevents most CSRF without an explicit CSRF token.
- Dependencies: run npm audit / pip-audit / cargo audit in CI. Pin major versions; patch minor/patch via Dependabot. High-severity CVEs in prod deps require same-day patches — have a runbook ready.`,
  },
  {
    domain: 'general',
    detectionPatterns: [],
    expertiseNote: `General engineering watch-outs:
- Define done before starting: every task needs at least one testable acceptance criterion. "It works" is not a criterion — "the API returns 200 with the expected JSON shape for valid input and 422 for invalid" is.
- Change one thing at a time: mixing a refactor with a feature addition makes rollback impossible and code review unreasonable. Keep the diff focused.
- Error handling: handle errors at the layer that has enough context to act. Deep utility functions should surface errors to callers, not swallow them.
- Observability first: add logging and metrics before shipping to prod, not as a follow-up. You cannot diagnose what you cannot observe — and incidents happen at 2am, not during the next sprint.
- Rollback plan: every deploy needs a documented rollback step. If you can't roll back in under 5 minutes, the change carries higher risk than it appears.`,
  },
];

export interface DetectedDomains {
  primary: Domain;
  secondary?: Domain;
}

export function detectDomain(text: string): DetectedDomains {
  if (!text.trim()) return { primary: 'general' };

  const scores = new Map<Domain, number>();

  for (const lens of DOMAIN_LENSES) {
    if (lens.domain === 'general') continue;
    let score = 0;
    for (const pattern of lens.detectionPatterns) {
      const matches = text.match(new RegExp(pattern.source, 'gi'));
      score += matches ? matches.length : 0;
    }
    if (score > 0) scores.set(lens.domain, score);
  }

  if (scores.size === 0) return { primary: 'general' };

  const sorted = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  const primary = sorted[0][0];

  if (sorted.length >= 2 && sorted[1][1] >= sorted[0][1] * 0.5) {
    return { primary, secondary: sorted[1][0] };
  }

  return { primary };
}

export function getLens(domain: Domain): DomainLens {
  return (
    DOMAIN_LENSES.find(l => l.domain === domain) ??
    DOMAIN_LENSES.find(l => l.domain === 'general')!
  );
}
