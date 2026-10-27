import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

const principles = [
  {
    number: '01',
    title: 'Clarity first',
    description: 'We make it easier to understand the choices in front of you, with clear market information and straightforward tools.',
  },
  {
    number: '02',
    title: 'More ways to invest',
    description: 'Explore stocks, ETFs, crypto, and investment plans in one place, then shape an approach around your own goals.',
  },
  {
    number: '03',
    title: 'Built for the long view',
    description: 'Investing is a journey. Assets Zenith is designed to help you stay curious, informed, and focused as you move forward.',
  },
]

const About = () => (
  <div>
    <section className="relative isolate min-h-[560px] overflow-hidden bg-[#111416] text-white lg:min-h-[620px]">
      <img
        alt="Investment professionals meeting around a table in a bright office"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        fetchPriority="high"
        src="/images/about-team.jpg"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#111416]/90 via-[#111416]/72 to-[#111416]/20" />
      <Navbar />
      <div className="mx-auto flex min-h-[470px] max-w-[1440px] items-center px-6 pb-14 pt-10 sm:px-10 lg:min-h-[520px] lg:px-12">
        <div className="max-w-[760px]">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-white/90 backdrop-blur-sm">
            About Assets Zenith
          </span>
          <h1 className="mt-6 text-[clamp(3rem,7vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.065em]">
            Invest with clarity.<br />
            Move with confidence.
          </h1>
          <p className="mt-6 max-w-[570px] text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
            We’re building a clearer way to explore the markets. Discover stocks, ETFs, crypto, and investment plans with useful information in one place.
          </p>
          <Link className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-lg bg-[#1caf35] px-6 text-sm font-bold text-white transition-colors hover:bg-[#15952b]" to="/#markets">
            Explore the markets <span aria-hidden="true" className="text-lg leading-none">→</span>
          </Link>
        </div>
      </div>
    </section>

    <main>
      <section aria-labelledby="about-story-heading" className="bg-[#fafafa] px-6 py-16 text-[#101114] sm:px-10 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-[1152px] gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <span className="inline-flex rounded-full bg-[#f0f1f2] px-3 py-1 text-xs font-semibold">Our approach</span>
            <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.05em] sm:text-4xl" id="about-story-heading">
              A more considered way to invest
            </h2>
          </div>
          <div className="space-y-5 text-base leading-7 text-[#59616b] sm:text-lg sm:leading-8">
            <p>
              Investing can feel complicated. We believe the experience should make your options easier to explore and the information you need easier to find.
            </p>
            <p>
              Assets Zenith brings market discovery and investment tools together in a clean, focused experience—so you can learn, compare, and make decisions at your own pace.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="about-principles-heading" className="bg-white px-6 py-16 text-[#101114] sm:px-10 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1152px]">
          <div className="max-w-[650px]">
            <span className="inline-flex rounded-full bg-[#f0f1f2] px-3 py-1 text-xs font-semibold">What guides us</span>
            <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.05em] sm:text-4xl" id="about-principles-heading">
              Made for thoughtful investors
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3 lg:mt-14">
            {principles.map((principle) => (
              <article className="rounded-2xl border border-[#e8e9eb] bg-[#fafafa] p-6 sm:p-7" key={principle.number}>
                <span className="text-sm font-bold text-[#ff1018]">{principle.number}</span>
                <h3 className="mt-8 text-xl font-semibold tracking-[-0.035em]">{principle.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#59616b] sm:text-base">{principle.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f5eee5] px-6 py-14 text-center text-[#101114] sm:px-10 sm:py-16">
        <div className="mx-auto max-w-[720px]">
          <h2 className="text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Your next step starts with a closer look.</h2>
          <p className="mt-4 text-base leading-7 text-[#59616b]">Explore the markets and see what fits your investing goals.</p>
          <Link className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-lg bg-[#1caf35] px-6 text-sm font-bold text-white transition-colors hover:bg-[#15952b]" to="/#markets">
            Explore markets <span aria-hidden="true" className="text-lg leading-none">→</span>
          </Link>
        </div>
      </section>
    </main>
    <Footer />
  </div>
)

export default About
