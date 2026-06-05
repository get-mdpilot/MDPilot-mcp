'use client';

interface Suggestion {
  type: 'missing' | 'unclear' | 'tip';
  text: string;
}

function analyzeTaskInput(input: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const trimmed = input.trim();

  if (/accept|criteria|given|when|then|expected/i.test(trimmed) === false) {
    suggestions.push({
      type: 'missing',
      text: "No acceptance criteria found. We'll infer them — but adding yours improves accuracy.",
    });
  }

  if (/improve|fix|update|change|make better/i.test(trimmed) && trimmed.length < 120) {
    suggestions.push({
      type: 'unclear',
      text: 'Description is short. Adding what specifically changes and what the end state looks like will produce a sharper TASK.md.',
    });
  }

  if (!/react|next|vue|python|node|typescript|java|go|rust|swift|flutter|supabase|postgres|django|rails/i.test(trimmed)) {
    suggestions.push({
      type: 'tip',
      text: 'No tech stack detected. Add your stack in the section below for framework-specific output.',
    });
  }

  if (/decided|agreed|let'?s go with|we'?ll use|consensus/i.test(trimmed)) {
    suggestions.push({
      type: 'tip',
      text: 'Decisions detected in your input. These will be extracted into the Decision Log section.',
    });
  }

  if (/https?:\/\//i.test(trimmed)) {
    suggestions.push({
      type: 'tip',
      text: "Links detected. We'll reference these in context but won't fetch their content.",
    });
  }

  return suggestions;
}

const SUGGESTION_STYLES = {
  missing: {
    border: 'border-l-[var(--md-amber)]',
    bg: 'bg-[var(--md-amber-light)]',
    iconColor: 'text-[var(--md-amber)]',
    textColor: 'text-[var(--md-amber)]',
    icon: (
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    ),
  },
  unclear: {
    border: 'border-l-[var(--md-coral)]',
    bg: 'bg-[var(--md-coral-light)]',
    iconColor: 'text-[var(--md-coral)]',
    textColor: 'text-[var(--md-coral)]',
    icon: (
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
      </svg>
    ),
  },
  tip: {
    border: 'border-l-[#4FACFF]',
    bg: 'bg-[#4FACFF]/[0.07]',
    iconColor: 'text-[#4FACFF]',
    textColor: 'text-[#4FACFF]/80',
    icon: (
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
      </svg>
    ),
  },
};

interface TaskSuggestionsProps {
  input: string;
}

export default function TaskSuggestions({ input }: TaskSuggestionsProps) {
  const all = analyzeTaskInput(input);
  if (all.length === 0) return null;

  const visible = all.slice(0, 3);

  return (
    <div className="mt-3 space-y-2 animate-[fade-up_0.3s_ease-out_both]">
      {visible.map((s, i) => {
        const style = SUGGESTION_STYLES[s.type];
        return (
          <div
            key={i}
            className={`flex items-start gap-3 rounded-r-lg border-l-2 ${style.border} ${style.bg} px-3 py-2.5`}
          >
            <span className={`shrink-0 mt-0.5 ${style.iconColor}`}>{style.icon}</span>
            <p className={`text-[12px] leading-relaxed ${style.textColor}`}>{s.text}</p>
          </div>
        );
      })}
    </div>
  );
}
