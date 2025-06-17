import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import GDRoom from './pages/Room'
import Analysis from "./pages/Analysis";

import "./Navbar.css";


function App() {
  return (
    <Router>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">ArguMint</div>
          <div className="navbar-links">
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/room">Room</Link>
            <Link to="/analysis">Analysis</Link>
            
          </div>
        </div>
      </nav>
     

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/room" element={<GDRoom />} />
        <Route path="/analysis" element={<Analysis />} />
      </Routes>
    </Router>
  );
}

export default App;
