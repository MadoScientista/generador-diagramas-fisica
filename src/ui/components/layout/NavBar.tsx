import { NavLink } from 'react-router-dom';

export function NavBar() {
  return (
    <nav className="navbar">
      <NavLink to="/" end>Inicio</NavLink>
      <NavLink to="/generador/mru">MRU</NavLink>
      <NavLink to="/generador/mru-v2">MRU v2</NavLink>
      <NavLink to="/generador/mruv">MRUV</NavLink>
    </nav>
  );
}
