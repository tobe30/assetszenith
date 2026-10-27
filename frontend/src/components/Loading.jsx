const Loading = ({ label = 'Loading...', fullScreen = false, className = '' }) => (
  <div
    aria-busy="true"
    aria-live="polite"
    className={`flex w-full flex-col items-center justify-center gap-3 bg-[#f8faf8] px-5 text-center ${fullScreen ? 'min-h-screen' : 'min-h-48'} ${className}`}
    role="status"
  >
    <span
      aria-hidden="true"
      className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#e4e9e6] border-t-[#ed161f] motion-reduce:animate-none"
    />
    <span className="text-sm font-medium text-[#586168]">{label}</span>
  </div>
)

export default Loading
