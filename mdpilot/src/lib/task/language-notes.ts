export type Language =
  | 'python'
  | 'typescript'
  | 'javascript'
  | 'go'
  | 'rust'
  | 'java'
  | 'csharp'
  | 'ruby'
  | 'php'
  | 'swift'
  | 'kotlin'
  | 'cpp';

export interface LanguageNote {
  language: Language;
  displayName: string;
  detectionPatterns: RegExp[];
  traps: string;
}

export const LANGUAGE_NOTES: LanguageNote[] = [
  {
    language: 'python',
    displayName: 'Python',
    detectionPatterns: [
      /\.py\b/i, /\bpython\b/i, /\bpip\b/i, /\bpyproject\b/i,
      /\buvicorn\b/i, /\bdjango\b/i, /\bfastapi\b/i, /\bpytest\b/i,
      /\bvenv\b/i, /\bpandas\b/i, /\bnumpy\b/i, /\bpydantic\b/i,
    ],
    traps: `Python language traps:
- Mutable default arguments: \`def f(items=[])\` — the list is shared across all calls. Use \`def f(items=None)\` and initialize inside the function body.
- GIL: threading doesn't parallelize CPU-bound work in CPython. Use multiprocessing or asyncio for I/O-bound work. For CPU-bound tasks, use concurrent.futures.ProcessPoolExecutor.
- Late binding closures: loop variables in lambdas capture by reference, not value. \`lambda: i\` in a for loop always returns the last value of i. Fix: \`lambda i=i: i\`.
- Pydantic v1 vs v2: v2 is a near-complete rewrite. \`parse_obj\` → \`model_validate\`, \`.dict()\` → \`.model_dump()\`. Don't mix v1 and v2 usage patterns in the same codebase.
- async pitfall: \`async def\` without \`await\` runs synchronously and blocks the event loop. Never call blocking I/O (requests, open()) inside an async function — use httpx/aiofiles instead.`,
  },
  {
    language: 'typescript',
    displayName: 'TypeScript',
    detectionPatterns: [
      /\.tsx?\b/i, /\btypescript\b/i, /\btsconfig\b/i,
      /\btype \w/i, /\binterface \w/i, /\bas const\b/i,
    ],
    traps: `TypeScript language traps:
- \`any\` is contagious: one \`any\` disables type checking for everything downstream. Use \`unknown\` + type narrowing instead. Enable \`noImplicitAny\` in tsconfig.
- Type assertions (\`as\`) lie: \`x as SomeType\` bypasses the type checker entirely. Prefer type guards (\`typeof\`, \`instanceof\`, \`in\`) or Zod validation at system boundaries.
- \`interface\` vs \`type\`: interfaces are open (declaration merging); types are closed. Use \`type\` for unions, mapped types, and computed shapes; \`interface\` for extensible contracts.
- Strict null checks: enable \`strictNullChecks: true\` from the start — retrofitting it later is extremely painful. \`T | undefined\` forces you to handle the missing case everywhere.
- Enum pitfalls: numeric enums lose type safety (any number is assignable). Prefer \`as const\` object maps or string literal union types for safer alternatives.`,
  },
  {
    language: 'javascript',
    displayName: 'JavaScript',
    detectionPatterns: [
      /\.jsx?\b/i, /\bjavascript\b/i, /\bcommonjs\b/i,
      /\besm\b/i, /\brequire\s*\(/i,
    ],
    traps: `JavaScript language traps:
- \`==\` vs \`===\`: always use strict equality (\`===\`). \`null == undefined\` is true; \`0 == ''\` is true. Loose equality has dozens of surprising cases — never use it.
- Hoisting: \`var\` is hoisted to function scope; \`let\`/\`const\` are block-scoped with a temporal dead zone. Use \`const\` by default, \`let\` when reassignment is needed, never \`var\`.
- Async/await error handling: unhandled promise rejections crash Node.js (v15+). Always add \`.catch()\` or wrap in try/catch. Use \`Promise.allSettled\` when you need all results even if some fail.
- \`this\` binding: arrow functions don't have their own \`this\`. Regular functions do — and it changes based on how they're called. Prefer arrow functions for callbacks and class methods.
- JSON.parse: throws on invalid input. Always wrap in try/catch. \`JSON.stringify\` silently drops \`undefined\` values and functions.`,
  },
  {
    language: 'go',
    displayName: 'Go',
    detectionPatterns: [
      /\.go\b/i, /\bgolang\b/i, /\bgo\.mod\b/i,
      /\bgoroutine\b/i, /\bchan(nel)?\b/i, /\bdefer\b/i, /\bgo\s+func\b/i,
    ],
    traps: `Go language traps:
- Error handling: errors are values — check every error return. Wrap with \`fmt.Errorf("context: %w", err)\` to preserve unwrapping via \`errors.Is\`/\`errors.As\`. Never use \`_\` to discard errors in production paths.
- Goroutine leaks: goroutines are cheap but not free. Always ensure goroutines can exit — use \`context.Context\` cancellation or close a done channel. Leaked goroutines cause slow memory growth over time.
- nil interface trap: a nil *T stored in an interface is not a nil interface — the interface holds a non-nil type with a nil value. Checking \`if err != nil\` on a typed nil misses the error.
- Slice append: \`append\` may return a new backing array. Never assume the original slice is modified after appending — always use the returned value. Pass slices as \`*[]T\` when mutation is needed.
- defer in loops: \`defer\` in a loop runs at function exit, not loop iteration end. This holds file handles and locks until the function returns. Close inside the loop explicitly, or extract a helper function.
- Race conditions: maps are not safe for concurrent access. Run tests with \`-race\` flag. Use \`sync.Map\` or a mutex-protected map for shared state.`,
  },
  {
    language: 'rust',
    displayName: 'Rust',
    detectionPatterns: [
      /\.rs\b/i, /\brust\b/i, /\bcargo\b/i,
      /\bCargo\.toml\b/, /\bownership\b/i, /\btokio\b/i, /\blifetime\b/i,
    ],
    traps: `Rust language traps:
- \`unwrap()\` / \`expect()\`: these panic on None/Err — unacceptable in production paths. Propagate errors with \`?\` or handle explicitly with match. Reserve unwrap for tests and values guaranteed to be Some/Ok.
- Clone costs: \`.clone()\` on large data structures is expensive. Profile before cloning — often you can restructure to pass references (\`&T\`) or use \`Arc<T>\` for shared ownership across threads.
- Async blocking: tokio's async runtime is single-threaded per task. Blocking calls inside async functions (thread::sleep, synchronous I/O) block the executor thread. Use \`tokio::time::sleep\` and \`tokio::fs\` for async alternatives.
- Send + Sync: types crossing \`await\` points must be \`Send\`. If you hit "future is not Send" errors, look for non-Send types (\`Rc\`, \`RefCell\`, \`MutexGuard\`) held across awaits — replace with \`Arc\`/\`Mutex\`.
- Integer overflow: Rust panics on overflow in debug, wraps in release. Use \`checked_add\`/\`saturating_add\`/\`wrapping_add\` explicitly when overflow is possible rather than relying on mode-dependent behavior.`,
  },
  {
    language: 'java',
    displayName: 'Java',
    detectionPatterns: [
      /\.java\b/i, /\bjava\b/i, /\bspring\b/i,
      /\bmaven\b/i, /\bgradle\b/i, /\bhibernate\b/i, /\bjvm\b/i,
    ],
    traps: `Java language traps:
- NullPointerException: use \`Optional<T>\` for nullable returns. Annotate with \`@NonNull\`/\`@Nullable\`. In Spring, \`@Autowired\` fields on test instances that aren't initialized are a common NPE source.
- equals() / hashCode() contract: always override both together. Objects used as Map keys or Set members without proper equals/hashCode produce duplicates or "ghost" entries that can't be removed.
- Checked exceptions: don't wrap everything in RuntimeException just to avoid declaring it — you lose error context. Use specific exception types and handle them at the layer with enough context to act.
- String concatenation in loops: \`String + String\` in a loop is O(n²) — each concatenation allocates a new String. Use \`StringBuilder\` or \`String.join()\`.
- Hibernate lazy loading: \`LazyInitializationException\` occurs when accessing a lazy collection outside a transaction. Fetch what you need explicitly with JOIN FETCH in the query, or use DTOs to project only needed fields.
- ThreadLocal in pooled threads: ThreadLocal values persist across requests when threads are reused (all servlet containers). Always call \`ThreadLocal.remove()\` in a finally block — or use request-scoped beans.`,
  },
  {
    language: 'csharp',
    displayName: 'C#',
    detectionPatterns: [
      /\.cs\b/i, /\bc#\b/i, /\bcsharp\b/i,
      /\b\.net\b/i, /\basp\.net\b/i, /\bnuget\b/i,
      /\blazor\b/i, /\bentity framework\b/i, /\blinq\b/i,
    ],
    traps: `C# language traps:
- async void: \`async void\` swallows exceptions — they propagate to the synchronization context, not the caller. Use \`async Task\` everywhere except top-level event handlers.
- IDisposable: types implementing IDisposable (SqlConnection, HttpClient, FileStream) must be disposed — use \`using\` statements or declarations. Failing to dispose DB connections exhausts the pool under load.
- HttpClient: don't instantiate HttpClient per request — it exhausts socket handles (TIME_WAIT). Use IHttpClientFactory or a shared static instance.
- LINQ deferred execution: LINQ queries don't execute until enumerated. Multiple enumerations of a DB-backed query hit the DB multiple times. Call \`.ToList()\` or \`.ToArray()\` to materialize results once.
- EF Core tracking: tracked entities accumulate in DbContext — don't reuse a single DbContext across requests in a long-lived service. Use \`AsNoTracking()\` for read-only queries to avoid tracking overhead.
- Struct mutability: mutable structs are error-prone because assignment copies the struct. Prefer immutable structs or use classes for any type with mutable state.`,
  },
  {
    language: 'ruby',
    displayName: 'Ruby',
    detectionPatterns: [
      /\.rb\b/i, /\bruby\b/i, /\brails\b/i,
      /\bgemfile\b/i, /\bbundler\b/i, /\brspec\b/i, /\bsinatra\b/i,
    ],
    traps: `Ruby language traps:
- Symbol vs String: symbols are immutable and interned (same object every time); strings are not. In Rails, hash keys may be strings or symbols — use HashWithIndifferentAccess or params.permit consistently.
- N+1 in ActiveRecord: \`Post.all.each { |p| p.comments }\` fires one query per post. Use \`Post.includes(:comments)\` or \`eager_load\`. Install the Bullet gem to catch N+1 in development automatically.
- Freeze string literals: add \`# frozen_string_literal: true\` at the top of every file — prevents accidental string mutation, reduces GC pressure, and improves allocation performance.
- Object mutation: Ruby passes object references — \`array.map { ... }\` returns a new array (non-mutating); \`array.map! { ... }\` mutates in place. Be explicit about mutation intent.
- Exception hierarchy: rescuing \`StandardError\` handles application errors (correct). Rescuing \`Exception\` catches signal traps and system exits — almost never what you want.`,
  },
  {
    language: 'php',
    displayName: 'PHP',
    detectionPatterns: [
      /\.php\b/i, /\bphp\b/i, /\blaravel\b/i,
      /\bcomposer\b/i, /\bsymfony\b/i, /\bwordpress\b/i,
    ],
    traps: `PHP language traps:
- Type juggling: loose comparison (\`==\`) has notoriously surprising results: \`"0" == false\` is true, \`"" == null\` is true, \`0 == "abc"\` is true. Use strict comparison (\`===\`) everywhere.
- Null coalescing: use \`??\` to safely access potentially null/missing values: \`$x = $arr['key'] ?? 'default'\` avoids undefined index notices without an isset() check.
- Error vs Exception: PHP has both legacy errors and exceptions. Set \`error_reporting(E_ALL)\` and a custom error handler that converts errors to ErrorException in development — otherwise errors fail silently.
- Session security: always set \`session.cookie_httponly = 1\`, \`session.cookie_secure = 1\`, and \`session.cookie_samesite = Strict\` in production. Regenerate session ID on any privilege escalation.
- Dependency injection: avoid global state and static methods (Service Locator antipattern). Use a DI container (Laravel IoC / Symfony DI) to make dependencies explicit and testable.`,
  },
  {
    language: 'swift',
    displayName: 'Swift',
    detectionPatterns: [
      /\.swift\b/i, /\bswift\b/i, /\bxcode\b/i,
      /\bswiftui\b/i, /\buikit\b/i, /\bcocoa\b/i, /\bmacos\b/i,
    ],
    traps: `Swift language traps:
- Force unwrap (!): \`optional!\` crashes if nil — one of the top App Store crash sources. Use \`guard let\`, \`if let\`, or \`??\` for defaults. Only force-unwrap literals you've hardcoded and know are valid.
- Retain cycles: closures capture \`self\` strongly by default. In async callbacks, timers, and notification handlers, use \`[weak self]\` to avoid memory leaks. Verify with Instruments Leaks template before shipping.
- Main thread: UIKit / SwiftUI updates must happen on the main thread. Always dispatch UI updates from async completion handlers with \`DispatchQueue.main.async\` or \`@MainActor\`.
- Sendable / actors: Swift concurrency enforces \`Sendable\` conformance for cross-actor data. Non-Sendable types produce compiler warnings (errors in strict concurrency mode). Design value types (structs/enums) for cross-actor data.
- Codable synthesis: automatic synthesis only works when all properties are Codable. One non-Codable property breaks the whole type and requires manual conformance — use \`CodingKeys\` enum to exclude specific properties.`,
  },
  {
    language: 'kotlin',
    displayName: 'Kotlin',
    detectionPatterns: [
      /\.kt\b/i, /\bkotlin\b/i, /\bkoroutine\b/i,
      /\bjetpack\b/i, /\bandroid\b/i, /\bgradle\.kts\b/i, /\bcompose\b/i,
    ],
    traps: `Kotlin language traps:
- Coroutine scope leaks: \`GlobalScope.launch\` is an antipattern — not tied to any lifecycle and can't be cancelled. Use \`viewModelScope\`, \`lifecycleScope\`, or a structured CoroutineScope with a SupervisorJob.
- Null safety + Java interop: Java APIs return platform types (T!) with unknown nullability. Annotate Java dependencies or treat all Java returns as nullable in Kotlin to avoid NullPointerExceptions at the interop boundary.
- data class copy: \`.copy()\` is a shallow copy — nested mutable objects are shared between original and copy. For deep immutability, use nested immutable data classes or copy all levels explicitly.
- Sealed class exhaustiveness: \`when\` on a sealed class is only guaranteed exhaustive when used as an expression (with a return value). As a statement, missing branches compile without warning. Add a compiler plugin or write it as an expression.
- Compose recomposition: expensive computations in composable functions run on every recomposition. Use \`remember { ... }\` to cache computations, \`derivedStateOf\` for derived state, and \`LaunchedEffect\` for one-time side effects.`,
  },
  {
    language: 'cpp',
    displayName: 'C++',
    detectionPatterns: [
      /\.cpp\b/i, /\.hpp\b/i, /\bc\+\+\b/i,
      /\bcmake\b/i, /\bstd::\b/, /\bboost\b/i, /\bllvm\b/i,
    ],
    traps: `C++ language traps:
- Memory management: prefer smart pointers (\`unique_ptr\`, \`shared_ptr\`) over raw new/delete. Raw ownership requires perfect lifetime discipline — one missed delete leaks; one double-delete crashes.
- Undefined behavior: signed integer overflow, out-of-bounds access, and use-after-free are UB — the compiler may optimize assuming UB never happens, producing counterintuitive results. Run with AddressSanitizer (\`-fsanitize=address\`) and UBSan in dev.
- Copy vs move semantics: passing large objects by value copies them. Pass by const reference (\`const T&\`) for read-only access; by rvalue reference (\`T&&\`) for transfer. Implement move constructors/assignments for classes owning resources.
- \`#pragma once\` vs include guards: \`#pragma once\` is supported by all major compilers and simpler than manual \`#ifndef\` guards — prefer it for new code.
- std::vector invalidation: inserting into or reserving a vector may reallocate its backing array — all iterators, pointers, and references to elements are invalidated. Re-fetch after any mutation that may reallocate.`,
  },
];

export function detectLanguages(text: string): Language[] {
  const scores = new Map<Language, number>();

  for (const note of LANGUAGE_NOTES) {
    let score = 0;
    for (const pattern of note.detectionPatterns) {
      const matches = text.match(new RegExp(pattern.source, 'gi'));
      score += matches ? matches.length : 0;
    }
    if (score > 0) scores.set(note.language, score);
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([lang]) => lang);
}

export function getLanguageNote(language: Language): LanguageNote {
  return LANGUAGE_NOTES.find(n => n.language === language)!;
}
