import { type JSX, type ReactNode } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/authSlice';

export function Layout({ children }: { children: ReactNode }) {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-40 bg-gradient-to-r from-brand to-brand-dark text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-bold tracking-tight flex items-center gap-1.5">
            <span>🇧🇩</span><span>LMVS</span>
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="hidden sm:flex items-center gap-2 opacity-95">
                  <span>{user.fullName || user.phone}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${user.role === 'ADMIN' ? 'bg-accent/90' : 'bg-white/20'}`}>
                    {user.role}
                  </span>
                </span>
                <button
                  onClick={() => { dispatch(logout()); nav('/login'); }}
                  className="bg-white/15 hover:bg-white/25 transition-colors px-3 py-1.5 rounded-lg font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:underline">Login</Link>
                <Link to="/register" className="bg-white text-brand px-3 py-1.5 rounded-lg font-medium shadow-sm hover:shadow transition-shadow">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full">{children}</main>
      <footer className="text-center text-xs text-slate-400 py-4">
        Labor Migration Verification System · Demo
      </footer>
    </div>
  );
}

export function ProtectedRoute({ roles, children }: { roles: string[]; children: JSX.Element }) {
  const { token, user } = useAppSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (user && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}