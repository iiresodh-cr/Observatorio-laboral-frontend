import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{ padding: '1rem', background: '#2c3e50', color: 'white', display: 'flex', gap: '1rem' }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Inicio</Link>
      <Link to="/denuncia" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Orientación / Denuncia</Link>
      <Link to="/admin" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Admin</Link>
    </nav>
  );
}