const SecuritySection = () => (
  <section aria-labelledby="security-heading" className="bg-[#fafafa] px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
    <div className="relative mx-auto flex min-h-[480px] max-w-[1152px] items-center overflow-hidden rounded-2xl bg-[#171c20] text-white shadow-sm sm:min-h-[500px]" id="security">
      <img
        alt="A woman holding a tablet with a digital security shield displayed beside her"
        className="absolute inset-0 h-full w-full object-cover object-[62%_center]"
        loading="lazy"
        src="/images/security-feature.png"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#111619]/95 via-[#111619]/75 to-[#111619]/5" />

      <div className="relative z-[1] max-w-[500px] px-7 py-12 sm:px-10 lg:px-12">
        <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          Cybersecurity
        </span>
        <h2 className="mt-5 text-3xl font-semibold leading-[1.1] tracking-[-0.045em] sm:text-4xl" id="security-heading">
          Your online security matters
        </h2>
        <p className="mt-5 max-w-[390px] text-base leading-6 text-white/85 sm:text-lg sm:leading-7">
          Online scams are becoming more common. Learn how to recognize suspicious activity and protect your account.
        </p>
        <a className="mt-7 inline-flex items-center gap-2 text-sm font-semibold !text-[#1caf35] transition-colors hover:!text-[#63d77a]" href="#security">
          Learn more <span aria-hidden="true" className="text-lg leading-none">→</span>
        </a>
      </div>
    </div>
  </section>
)

export default SecuritySection
