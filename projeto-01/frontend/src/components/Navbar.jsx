import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { type: 'hash',  href: '#inicio',      label: 'Início' },
  { type: 'hash',  href: '#sobre',       label: 'Quem Somos' },
  { type: 'route', to: '/servicos',      label: 'Serviços' },
  { type: 'route', to: '/produtos',      label: 'Produtos' },
  { type: 'hash',  href: '#galeria',     label: 'Galeria' },
  { type: 'hash',  href: '#depoimentos', label: 'Depoimentos' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const close = () => setMenuOpen(false)

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <Link className="navbar__logo" to="/" onClick={close}>
        Esboço<span>Cerimonialistas</span>
      </Link>

      <button
        className="navbar__toggle"
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Abrir menu"
        aria-expanded={menuOpen}
      >
        <span className="navbar__toggle-bar" />
        <span className="navbar__toggle-bar" />
        <span className="navbar__toggle-bar" />
      </button>

      <ul className={`navbar__menu${menuOpen ? ' navbar__menu--open' : ''}`}>
        {NAV_ITEMS.map((item) => (
          <li key={item.label}>
            {item.type === 'route' ? (
              <Link
                to={item.to}
                onClick={close}
                className={pathname === item.to ? 'navbar__link--active' : undefined}
              >
                {item.label}
              </Link>
            ) : (
              <a href={isHome ? item.href : `/${item.href}`} onClick={close}>{item.label}</a>
            )}
          </li>
        ))}
        <li>
          <a href={isHome ? '#contato' : '/#contato'} onClick={close} className="navbar__cta">Contato</a>
        </li>
      </ul>
    </nav>
  )
}
