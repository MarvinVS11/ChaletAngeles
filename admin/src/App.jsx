import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminNav from './components/AdminNav';
import Login from './pages/Login';
import ChaletEditor from './pages/ChaletEditor';
import SectionsEditor from './pages/SectionsEditor';
import Reservations from './pages/Reservations';
import NewReservation from './pages/NewReservation';

function AdminLayout({ children }) {
  return (
    <div className="app">
      <AdminNav />
      <main>{children}</main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ChaletEditor />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/secciones"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <SectionsEditor />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservas"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Reservations />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservas/nueva"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <NewReservation />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
