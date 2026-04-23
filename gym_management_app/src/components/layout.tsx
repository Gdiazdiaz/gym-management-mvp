import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import './layout.css';
import logo from '../assets/gym-logo.png';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/members" className="brand">
            <img src={logo} width={70} alt='PulseGym' />
          </Link>
          <nav className="nav">
            <Link to="/members">Members</Link>
            <Link to="/members/new">New member</Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
