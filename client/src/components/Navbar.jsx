import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const links = [
  { to: '/galeria', label: 'Galería' },
  { to: '/mapa', label: 'Mapa' },
  { to: '/contacto', label: 'Contáctanos' },
];

const homeSections = [
  { hash: 'acerca-del-chalet', label: 'Acerca del Chalet' },
  { hash: 'actividades', label: 'Actividades en Sueños de Ángeles' },
  { hash: 'opciones-en-la-zona', label: 'Opciones en la zona' },
  { hash: 'gastronomia', label: 'Gastronomía' },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [homeMenuOpen, setHomeMenuOpen] = useState(false);
  const navigate = useNavigate();

  function closeMenu() {
    setOpen(false);
    setHomeMenuOpen(false);
  }

  function goToSection(hash) {
    closeMenu();
    navigate(`/#${hash}`);
    window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }

  return (
    <>
      <header className="site-header">
        <div className="header-row">
          <NavLink to="/" className="brand-plain" onClick={closeMenu}>
            Sueños de Ángeles
          </NavLink>

          <button
            type="button"
            className="nav-toggle"
            aria-label="Abrir menú"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            ☰
          </button>

          <nav className="nav-pill">
            <div
              className="nav-dropdown"
              onMouseEnter={() => setHomeMenuOpen(true)}
              onMouseLeave={() => setHomeMenuOpen(false)}
            >
              <NavLink
                to="/"
                end
                className="nav-dropdown-trigger"
                onClick={(e) => {
                  e.preventDefault();
                  setHomeMenuOpen((prev) => !prev);
                }}
              >
                Inicio <span className="nav-dropdown-arrow">▾</span>
              </NavLink>

              {homeMenuOpen && (
                <div className="nav-dropdown-menu">
                  {homeSections.map((section, index) => (
                    <button
                      key={section.hash}
                      type="button"
                      className={index === 0 ? 'is-first' : ''}
                      onClick={() => goToSection(section.hash)}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {links.map((link) => (
              <NavLink key={link.to} to={link.to}>
                {link.label}
              </NavLink>
            ))}
            <NavLink to="/reservas" className="nav-cta">
              Reservar
            </NavLink>
          </nav>
        </div>
      </header>

      <div
        className={`nav-backdrop ${open ? 'open' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <nav className={`nav-drawer ${open ? 'open' : ''}`} aria-label="Menú móvil">
        <button
          type="button"
          className="nav-drawer-close"
          aria-label="Cerrar menú"
          onClick={closeMenu}
        >
          ✕
        </button>

        <NavLink to="/" end onClick={closeMenu}>
          Inicio
        </NavLink>
        <div className="nav-drawer-sub">
          {homeSections.map((section) => (
            <button key={section.hash} type="button" onClick={() => goToSection(section.hash)}>
              {section.label}
            </button>
          ))}
        </div>

        {links.map((link) => (
          <NavLink key={link.to} to={link.to} onClick={closeMenu}>
            {link.label}
          </NavLink>
        ))}
        <NavLink to="/reservas" className="nav-cta" onClick={closeMenu}>
          Reservar
        </NavLink>
      </nav>
    </>
  );
}

export default Navbar;
