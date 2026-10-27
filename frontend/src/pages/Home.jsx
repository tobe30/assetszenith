import Hero from '../components/Hero'
import Investment from '../components/Investment'
import TrustSection from '../components/TrustSection'
import CredibilitySection from '../components/CredibilitySection'
import RatesSection from '../components/RatesSection'
import MarketsSection from '../components/MarketsSection'
import SecuritySection from '../components/SecuritySection'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <div>
        <Hero />
        <Investment />
        <TrustSection />
        <CredibilitySection />
        <RatesSection />
        <MarketsSection />
        <SecuritySection />
        <Footer />
    </div>
  )
}

export default Home
