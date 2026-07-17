import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Reservas from './pages/Reservas';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reservas" element={<Reservas />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
