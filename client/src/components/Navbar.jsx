import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/galeria', label: 'Galería' },
  { to: '/mapa', label: 'Mapa' },
  { to: '/contacto', label: 'Contáctanos' },
];

const homeSections = [
  { to: '/acerca-del-chalet', label: 'Acerca del Chalet' },
  { to: '/actividades', label: 'Actividades en Sueños de Ángeles' },
  { to: '/opciones-en-la-zona', label: 'Opciones en la zona' },
  { to: '/gastronomia', label: 'Gastronomía' },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [homeMenuOpen, setHomeMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  function closeMenu() {
    setOpen(false);
    setHomeMenuOpen(false);
  }

  useEffect(() => {
    if (!homeMenuOpen) return undefined;

    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setHomeMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [homeMenuOpen]);

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
            <div className="nav-dropdown" ref={dropdownRef}>
              <button
                type="button"
                className="nav-dropdown-trigger"
                aria-expanded={homeMenuOpen}
                onClick={() => setHomeMenuOpen((prev) => !prev)}
              >
                Inicio <span className="nav-dropdown-arrow">▾</span>
              </button>

              {homeMenuOpen && (
                <div className="nav-dropdown-menu">
                  {homeSections.map((section, index) => (
                    <NavLink
                      key={section.to}
                      to={section.to}
                      className={index === 0 ? 'is-first' : ''}
                      onClick={closeMenu}
                    >
                      {section.label}
                    </NavLink>
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
            <NavLink key={section.to} to={section.to} onClick={closeMenu}>
              {section.label}
            </NavLink>
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
