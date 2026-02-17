'use client';

export default function ErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-100">
      <div className="min-w-0">{message}</div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md border border-red-800/60 px-2 py-1 text-xs hover:bg-red-900/30"
        >
          Dismiss
        </button>
      ) : null}
    </div>
  );
}
