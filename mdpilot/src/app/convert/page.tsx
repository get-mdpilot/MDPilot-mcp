export default function ConvertPage() {
  return (
    <div className="text-center py-20">
      <div className="w-12 h-12 rounded-xl bg-[var(--md-teal-light)] text-[var(--md-teal)] flex items-center justify-center mx-auto mb-4">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
        </svg>
      </div>
      <h1 className="text-xl font-semibold mb-2">Convert mode</h1>
      <p className="text-sm text-[var(--md-text-secondary)] mb-1">
        Any file → clean markdown via MarkItDown
      </p>
      <p className="text-xs text-[var(--md-text-tertiary)] mb-6">
        Coming in v2
      </p>
      <a href="/" className="text-sm text-[var(--md-blue)] hover:underline">
        ← Back to home
      </a>
    </div>
  );
}
