// components/loaders/PageLoader.jsx
// Inline page spinner — Suspense fallback. Minimal.

export default function PageLoader() {
  return (
    <div
      className="flex items-center justify-center w-full min-h-[60vh]"
      role="status"
      aria-label="Loading page"
    >
      <div
        className="w-5 h-5 rounded-full border-[1.5px] animate-spin"
        style={{
          borderColor: 'var(--border-default)',
          borderTopColor: 'var(--color-accent-500)',
        }}
      />
    </div>
  )
}
