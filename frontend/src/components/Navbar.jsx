import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const submitSearch = (event) => {
    event.preventDefault()
    const query = searchQuery.trim()
    navigate(query ? `/markets?search=${encodeURIComponent(query)}` : '/markets')
    setSearchOpen(false)
    setMenuOpen(false)
  }

  return (
    <header className="relative z-20 mx-auto flex w-full max-w-[1440px] items-center justify-between gap-5 px-5 py-4 text-white sm:px-8 lg:px-12">
      <div className="flex items-center gap-9">
        <Link aria-label="Assets Zenith home" className="flex shrink-0 items-center gap-3" to="/">
          <svg aria-hidden="true" className="h-9 w-9 shrink-0" fill="none" viewBox="0 0 40 40">
            <path d="M20 2.5 37.5 12.6v14.8L20 37.5 2.5 27.4V12.6L20 2.5Z" stroke="#ff1018" strokeWidth="2" />
            <path d="m10.5 25.5 9.5-15 9.5 15h-4.4l-5.1-8.2-5.1 8.2h-4.4Z" fill="#ff1018" />
            <path d="M14.5 29h11" stroke="white" strokeLinecap="round" strokeWidth="2" />
          </svg>
          <span className="text-lg font-semibold leading-tight tracking-[-0.035em] sm:text-xl">Assets Zenith</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link className="transition-opacity hover:opacity-70" to="/invest">Invest</Link>
          <Link className="transition-opacity hover:opacity-70" to="/markets">Markets</Link>
          <Link className="transition-opacity hover:opacity-70" to="/about">About us</Link>
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <form className="relative flex items-center" onSubmit={submitSearch} role="search">
          {searchOpen && (
            <input
              aria-label="Search markets"
              autoFocus
              className="absolute right-10 top-1/2 w-[min(68vw,260px)] -translate-y-1/2 rounded-lg border border-white/20 bg-[#151a1f] px-3 py-2 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#1caf35] md:right-0 md:top-12 md:w-64 md:translate-y-0"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search stocks, crypto…"
              value={searchQuery}
            />
          )}
          <button
            aria-expanded={searchOpen}
            aria-label={searchOpen ? 'Close search' : 'Search markets'}
            className="btn btn-ghost btn-circle btn-sm inline-flex text-white"
            onClick={() => setSearchOpen((open) => !open)}
            type="button"
          >
            <svg aria-hidden="true" fill="none" height="21" viewBox="0 0 24 24" width="21">
              <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
              <path d="m16 16 4.2 4.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
            </svg>
          </button>
          <button aria-hidden="true" className="sr-only" tabIndex={-1} type="submit">Search</button>
        </form>
        <button aria-label="Choose language" className="btn btn-ghost btn-circle btn-sm hidden text-white md:inline-flex">
          <svg aria-hidden="true" fill="none" height="21" viewBox="0 0 24 24" width="21">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3.5 12h17M12 3c2.3 2.5 3.4 5.5 3.4 9s-1.1 6.5-3.4 9c-2.3-2.5-3.4-5.5-3.4-9S9.7 5.5 12 3Z" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
        <Link className="hidden rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-white/10 md:inline-flex" to="/login">
          Customer Access
        </Link>
        <Link className="btn hidden min-h-10 rounded-lg border-0 bg-[#1caf35] px-4 text-sm font-bold text-white shadow-none hover:bg-[#15952b] md:inline-flex md:px-5" to="/register">
          Become a Customer
        </Link>
        <button
          aria-controls="mobile-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="btn btn-ghost btn-circle btn-sm text-white md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? (
            <svg aria-hidden="true" fill="none" height="23" viewBox="0 0 24 24" width="23">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
            </svg>
          ) : (
            <svg aria-hidden="true" fill="none" height="23" viewBox="0 0 24 24" width="23">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="absolute left-5 right-5 top-full flex flex-col gap-1 rounded-xl border border-white/10 bg-[#151a1f]/95 p-4 shadow-2xl backdrop-blur-lg sm:left-8 sm:right-8 md:hidden"
          id="mobile-navigation"
        >
          <Link className="rounded-lg px-4 py-3 font-medium transition-colors hover:bg-white/10" to="/invest" onClick={() => setMenuOpen(false)}>Invest</Link>
          <Link className="rounded-lg px-4 py-3 font-medium transition-colors hover:bg-white/10" to="/markets" onClick={() => setMenuOpen(false)}>Markets</Link>
          <Link className="rounded-lg px-4 py-3 font-medium transition-colors hover:bg-white/10" to="/about" onClick={() => setMenuOpen(false)}>About us</Link>
          <Link className="rounded-lg px-4 py-3 font-medium transition-colors hover:bg-white/10" to="/login" onClick={() => setMenuOpen(false)}>Customer Access</Link>
          <button className="rounded-lg px-4 py-3 text-left font-medium transition-colors hover:bg-white/10" onClick={() => setMenuOpen(false)} type="button">Choose language</button>
          <Link className="btn mt-2 min-h-11 rounded-lg border-0 bg-[#1caf35] text-sm font-bold text-white shadow-none hover:bg-[#15952b]" to="/register" onClick={() => setMenuOpen(false)}>
            Become a Customer
          </Link>
        </nav>
      )}
    </header>
  )
}

export default Navbar
