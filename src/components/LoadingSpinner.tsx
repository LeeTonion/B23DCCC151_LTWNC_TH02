export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" role="status" aria-label="Đang tải"></div>
        <span className="sr-only">Đang tải...</span>
      </div>
    </div>
  );
}