import { Outlet } from 'react-router-dom';

export const AuthLayout = () => (
  <div className="auth-bg">
    {/* Decorative orbs */}
    <div style={{ position:'absolute', top:'-20%', right:'-10%', width:'600px', height:'600px', background:'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', pointerEvents:'none' }} />
    <div style={{ position:'absolute', bottom:'-15%', left:'-5%', width:'500px', height:'500px', background:'radial-gradient(circle, hsla(204, 100%, 40%, 0.10) 0%, transparent 70%)', pointerEvents:'none' }} />
    <Outlet />
  </div>
);
