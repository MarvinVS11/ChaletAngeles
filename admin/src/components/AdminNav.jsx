import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function AdminNav() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="admin-nav">
      <div className="admin-nav-inner">
        <span className="admin-brand">Sueños de Ángeles · Admin</span>
        <nav className="admin-links">
          <NavLink to="/" end>
            Chalet
          </NavLink>
          <NavLink to="/secciones">Secciones</NavLink>
          <NavLink to="/reservas">Reservas</NavLink>
          <button type="button" className="admin-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </nav>
      </div>
    </header>
  );
}

export default AdminNav;
