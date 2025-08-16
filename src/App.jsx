// filepath: /home/kapil.daksh@corp.easyrewardz.com/Desktop/VS CODE /Practice/Social Media/social-media/src/App.jsx
import React from 'react';
import './index.css';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './AppRouter';

export default function App() {
  return (
    <>
     <div className="bg-black min-h-screen text-white">
      <Router>
        <AppRouter />
      </Router>
      </div>
    </>
  );
}