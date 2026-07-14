import { NavLink } from 'react-router-dom';

export function NavBar() {
  return (
    <nav className="navbar">
      <NavLink to="/" end>Inicio</NavLink>
      <NavLink to="/generador/mru">MRU</NavLink>
    </nav>
  );
}
