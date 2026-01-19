import React, { useRef, useState } from 'react';
import './App.css';
import Activities from './components/Activities';
import Leaderboard from './components/Leaderboard';
import Teams from './components/Teams';
import Users from './components/Users';
import Workouts from './components/Workouts';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/activities', label: 'Activities', exact: true },
  { path: '/leaderboard', label: 'Leaderboard' },
  { path: '/teams', label: 'Teams' },
  { path: '/users', label: 'Users' },
  { path: '/workouts', label: 'Workouts' },
];

const navLinkClass = ({ isActive }) =>
  `nav-link px-3 py-2 rounded-pill ${
    isActive ? 'bg-white text-primary fw-semibold shadow-sm' : 'text-white-50'
  }`;

function App() {
  const [navOpen, setNavOpen] = useState(false);
  const toggleNav = () => setNavOpen((prev) => !prev);
  const closeNav = () => setNavOpen(false);

  return (
    <div className="app-shell min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-dark shadow-sm sticky-top">
        <div className="container">
          <NavLink to="/activities" className="navbar-brand text-white" onClick={closeNav}>
            <span className="brand-wrap">
              <img
                src={process.env.PUBLIC_URL + '/octofitapp-small.png'}
                alt="OctoFit logo"
                className="brand-logo"
                onError={(e) => {
                  // Fallback to default CRA logo if octofit logo isn't available
                  e.currentTarget.src = process.env.PUBLIC_URL + '/logo192.png';
                }}
              />
              <span className="fw-semibold tracking-wide">OctoFit Tracker</span>
            </span>
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            aria-controls="mainNavigation"
            aria-expanded={navOpen}
            aria-label="Toggle navigation"
            onClick={toggleNav}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className={`collapse navbar-collapse justify-content-end ${navOpen ? 'show' : ''}`}
            id="mainNavigation"
          >
            <div className="navbar-nav gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={navLinkClass}
                  end={item.exact}
                  onClick={closeNav}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <main className="container py-5">
        <Routes>
          <Route path="/" element={<Navigate to="/activities" replace />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/users" element={<Users />} />
          <Route path="/workouts" element={<Workouts />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
