import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">
          Chalet Los Ángeles
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/" end>
            Inicio
          </NavLink>
          <NavLink to="/reservas">Reservas</NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
