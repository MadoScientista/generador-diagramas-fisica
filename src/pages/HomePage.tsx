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
        <Link to="/generador/mru-v2" className="generator-card">
          <h3>MRU v2</h3>
          <p>Movimiento Rectilineo Uniforme (v2)</p>
        </Link>
        <Link to="/generador/mruv" className="generator-card">
          <h3>MRUV</h3>
          <p>Movimiento Rectilineo Uniformemente Variado</p>
        </Link>
      </div>
    </div>
  );
}
