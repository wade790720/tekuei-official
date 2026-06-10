import { Link } from 'react-router-dom'

export function CaseSiteNav() {
  return (
    <nav className="case-site-nav">
      <Link to="/" className="case-site-nav__logo">
        T E K U E I
      </Link>
      <div className="case-site-nav__links">
        <Link to="/work" className="case-site-nav__back">
          <span className="case-site-nav__back-line" aria-hidden />
          <span>A L L &nbsp; W O R K</span>
        </Link>
      </div>
    </nav>
  )
}
