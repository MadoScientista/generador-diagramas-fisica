import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="home-page">
      <h2>Generadores Disponibles</h2>
      <div className="generator-cards">
        <Link to="/generador/mruv" className="generator-card">
          <h3>MRUV</h3>
          <p>Movimiento Rectilineo Uniformemente Variado</p>
        </Link>
        <Link to="/generador/plano-cartesiano" className="generator-card">
          <h3>Plano Cartesiano</h3>
          <p>Generador de planos cartesianos configurables</p>
        </Link>
      </div>
    </div>
  );
}
