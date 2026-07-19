import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Reservas from './pages/Reservas';
import Galeria from './pages/Galeria';
import Mapa from './pages/Mapa';
import Contacto from './pages/Contacto';
import ManageReservation from './pages/ManageReservation';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/galeria" element={<Galeria />} />
          <Route path="/mapa" element={<Mapa />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/mi-reserva/:token" element={<ManageReservation />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
