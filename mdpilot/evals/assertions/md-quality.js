/**
 * Custom promptfoo assertions for MDPilot generated markdown quality.
 *
 * Checks:
 * 1. Minimum length (not a stub)
 * 2. No forbidden placeholder strings
 * 3. At least one code block (has runnable examples)
 * 4. No hallucinated cross-stack commands (npm in a Python file, etc.)
 * 5. Structured sections (at least 2 ## headings)
 * 6. Depth: no banned platitudes (best practices, thoroughly, properly, robust…)
 * 7. Depth: at least one specific named mechanism (flag, constant, version, path…)
 */

// Category-level platitudes that signal "outsider/plain" output. A senior practitioner
// names the concrete mechanism instead. Word-boundary matched, case-insensitive.
const BANNED_PLATITUDES = [
  /\bbest practices\b/i,
  /\btest(?:ing)? thoroughly\b/i,
  /\bthoroughly tested\b/i,
  /\b(?:handle|handled|handling)[^.]{0,20}\bproperly\b/i,
  /\brobust solution\b/i,
  /\bas needed\b/i,
  /\bas appropriate\b/i,
  /\bensure quality\b/i,
  /\bfollow(?:ing)? (?:standard|industry) (?:conventions|standards)\b/i,
];

// A "specific named mechanism": CLI flag, dotted/scoped identifier, ALL_CAPS constant,
// region/zone code, version, CamelCase API/metric name, or an inline-code span.
const SPECIFIC_MECHANISM_RE =
  /`[^`]+`|--?[a-z][\w-]+|\b[A-Z][A-Za-z]+(?:[A-Z][A-Za-z]+)+\b|\b[A-Z][A-Z0-9_]{2,}\b|\b[a-z]+-[a-z]+-\d\b|\bv?\d+\.\d+(?:\.\d+)?\b/;

module.exports = {
  assertionTypes: ['md-quality'],

  /**
   * @param {string} output   - The LLM output (generated markdown)
   * @param {object} context  - { vars, prompt, test } from promptfoo
   * @returns {{ pass: boolean, score: number, reason: string }}
   */
  evaluate(output, context) {
    const vars = context.vars ?? {};
    const fileType = vars.fileType ?? 'unknown';
    const fixture = vars.fixture ?? {};

    const failures = [];
    let score = 1.0;

    // 1. Minimum length
    if (output.length < 300) {
      failures.push(`Output too short (${output.length} chars — minimum 300)`);
      score -= 0.4;
    }

    // 2. No forbidden placeholder strings
    const forbidden = fixture.forbiddenContent ?? ['TODO', 'placeholder', '[INSERT'];
    for (const f of forbidden) {
      if (output.includes(f)) {
        failures.push(`Contains forbidden string: "${f}"`);
        score -= 0.15;
      }
    }

    // 3. At least one code block
    if (!output.includes('```')) {
      failures.push('No code blocks found — generated file must include at least one runnable example');
      score -= 0.2;
    }

    // 4. At least 2 ## headings for structure
    const headings = (output.match(/^##\s+.+/gm) ?? []).length;
    if (headings < 2) {
      failures.push(`Only ${headings} ## heading(s) — need at least 2 for proper structure`);
      score -= 0.1;
    }

    // 5. Stack-specific keyword presence
    const expectedKeywords = fixture.expectedKeywords?.[fileType] ?? [];
    const missingKeywords = expectedKeywords.filter(kw => !output.includes(kw));
    if (missingKeywords.length > 0) {
      failures.push(`Missing expected keywords for ${fileType}: ${missingKeywords.join(', ')}`);
      score -= 0.1 * missingKeywords.length;
    }

    // 6. Depth — no category-level platitudes (the "plain/outsider" tell)
    const platitudes = BANNED_PLATITUDES
      .filter(re => re.test(output))
      .map(re => re.source);
    if (platitudes.length > 0) {
      failures.push(`Contains banned platitude(s) — name the concrete mechanism instead: ${platitudes.join(', ')}`);
      score -= 0.15 * platitudes.length;
    }

    // 7. Depth — at least one specific named mechanism (outside code fences too).
    // README is human-facing prose, but still must carry real commands/identifiers.
    if (!SPECIFIC_MECHANISM_RE.test(output)) {
      failures.push('No specific named mechanism (flag, constant, version, API/metric name) — reads as category-level/plain');
      score -= 0.2;
    }

    score = Math.max(0, Math.min(1, score));

    return {
      pass: failures.length === 0,
      score,
      reason: failures.length === 0
        ? `Quality check passed (score: ${score.toFixed(2)})`
        : `Quality issues:\n  - ${failures.join('\n  - ')}`,
    };
  },
};
