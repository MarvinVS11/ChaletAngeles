import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/galeria', label: 'Galería' },
  { to: '/mapa', label: 'Mapa' },
  { to: '/contacto', label: 'Contáctanos' },
];

function Navbar() {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
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
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end}>
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
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} onClick={closeMenu}>
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
