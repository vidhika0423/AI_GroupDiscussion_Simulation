import React from 'react';
import './Landing.css';

const Landing = () => {
  return (
    <div className="container">
      {/* Left Panel */}
      <div className="left-panel">
        <div className='GDPhoto'>
            
            <img className="GDPhoto-img" src="/LandingPgImg.jpg" alt="landing image" />
           
        </div>
        
      </div>

      {/* Right Panel */}
      <div className="right-panel">
      <div className="welcome-box">
          <h1 className="logo">ArguMint</h1>
          <h2>Hey There, Welcome!</h2>
          <p className="subtext">Minting meaningful dialogue from every discussion.</p>
          
        </div>
      </div>
    </div>
  );
};

export default Landing;
