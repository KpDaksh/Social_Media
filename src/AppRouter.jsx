// filepath: /home/kapil.daksh@corp.easyrewardz.com/Desktop/VS CODE /Practice/Social Media/social-media/src/AppRouter.jsx
import { Routes, Route } from 'react-router-dom';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import Profile from './pages/Profile';
import RequireAuth from './features/auth/RequireAuth';
// import other pages/components

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
  <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      {/* Add more routes here */}
    </Routes>
  );
}