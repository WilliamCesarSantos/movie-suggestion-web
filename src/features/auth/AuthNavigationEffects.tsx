import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from './sessionStore';

export function AuthNavigationEffects() {
  const navigate = useNavigate();
  const { logout } = useSession();

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout, navigate]);

  return null;
}