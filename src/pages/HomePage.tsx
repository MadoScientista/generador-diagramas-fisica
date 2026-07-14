import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="home-page">
      <h2>Generadores Disponibles</h2>
      <div className="generator-cards">
        <Link to="/generador/mru" className="generator-card">
          <h3>MRU</h3>
          <p>Movimiento Rectilineo Uniforme</p>
        </Link>
      </div>
    </div>
  );
}
