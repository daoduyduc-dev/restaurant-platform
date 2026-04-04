import { Outlet } from 'react-router-dom';

export const AuthLayout = () => (
  <div className="auth-bg">
    {/* Decorative orbs */}
    <div style={{ position:'absolute', top:'-20%', right:'-10%', width:'600px', height:'600px', background:'radial-gradient(circle, rgba(255,98,0,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
    <div style={{ position:'absolute', bottom:'-15%', left:'-5%', width:'500px', height:'500px', background:'radial-gradient(circle, rgba(0,196,180,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />
    <Outlet />
  </div>
);
