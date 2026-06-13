type SpinnerProps = {
  label?: string;
  className?: string;
};

/** Accessible loading spinner. */
export default function Spinner({ label = "Memuat…", className }: SpinnerProps) {
  return (
    <div role="status" className={className}>
      <span
        aria-hidden="true"
        className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand-600"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
