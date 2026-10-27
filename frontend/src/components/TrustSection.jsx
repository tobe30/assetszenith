import { useEffect, useRef } from 'react'

const TrustSection = () => {
  const imageRef = useRef(null)

  useEffect(() => {
    const image = imageRef.current
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!image || motionPreference.matches) return

    let frameId = 0
    const updateImage = () => {
      cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(() => {
        const bounds = image.getBoundingClientRect()
        const start = window.innerHeight * 0.85
        const end = window.innerHeight * 0.2
        const progress = Math.min(1, Math.max(0, (start - bounds.top) / (start - end)))
        const scale = 0.84 + progress * 0.2
        const rotation = -8 + progress * 8
        image.style.transform = `scale(${scale}) rotate(${rotation}deg)`
      })
    }

    updateImage()
    window.addEventListener('scroll', updateImage, { passive: true })
    window.addEventListener('resize', updateImage)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', updateImage)
      window.removeEventListener('resize', updateImage)
    }
  }, [])

  return (
  <section aria-labelledby="trust-heading" className="overflow-hidden bg-[#f5eee5] px-6 pt-16 text-[#10271f] sm:px-10 sm:pt-20 lg:px-12 lg:pt-24">
    <div className="mx-auto flex max-w-[1200px] flex-col items-center text-center">
      <div className="max-w-[760px]">
        <div className="mx-auto mb-6 flex h-20 w-64 items-center justify-center rounded-full border-[3px] border-[#ff1018] sm:h-24 sm:w-80">
          <span className="text-xl font-bold tracking-[-0.025em] sm:text-2xl">Investment plans</span>
        </div>
        <h2 className="text-4xl font-bold leading-[1.12] tracking-[-0.045em] sm:text-5xl lg:text-[3.5rem]" id="trust-heading">
          Discover new possibilities.
        </h2>
        <p className="mx-auto mt-6 max-w-[700px] text-base leading-7 text-[#4d5750] sm:text-lg sm:leading-8">
          Discover a smarter way to invest passively with ETFs and build your portfolio around your long-term goals.
        </p>
      </div>
      <img
        alt="A collection of technology company symbols representing investment choices"
        className="mt-16 w-full max-w-[960px] object-contain transition-transform duration-200 ease-out sm:mt-20"
        loading="lazy"
        ref={imageRef}
        src="/images/trust-assets.png"
      />
    </div>
  </section>
  )
}

export default TrustSection
