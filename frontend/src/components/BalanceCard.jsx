const BalanceCard = ({ title, amount = 0, currency = 'USD', icon: Icon, iconClassName = 'bg-[#eaf7ec] text-[#1caf35]', loading = false, unavailable = false }) => {
  const numericAmount = Number(amount)
  const displayAmount = Number.isFinite(numericAmount)
    ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numericAmount)
    : '0.00'

  return (
    <article className="flex min-h-[132px] min-w-0 flex-col justify-between rounded-2xl border border-[#dfe4e6] bg-white p-4 shadow-[0_2px_8px_rgba(20,30,25,0.025)] transition-shadow hover:shadow-[0_8px_24px_rgba(20,30,25,0.07)] sm:p-5">
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
          </span>
        )}
        <h2 className="min-w-0 text-base font-semibold leading-6 text-[#273036] sm:text-[17px]">{title}</h2>
      </div>
      <p className="truncate pl-[52px] text-2xl font-semibold tracking-[-0.035em] text-[#15191c] sm:text-[25px]">
        {loading ? 'Loading…' : unavailable ? '—' : `${currency} ${displayAmount}`}
      </p>
    </article>
  )
}

export default BalanceCard
