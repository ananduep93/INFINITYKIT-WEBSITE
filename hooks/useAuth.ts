import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { authService } from '../lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Process redirect checks on first mount
    authService.handleRedirectResult().then((userResult) => {
      if (userResult) {
        setUser(userResult);
      }
    });

    const unsubscribe = authService.onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    isLoggedIn: !!user,
    loginWithGoogle: () => authService.loginWithGoogle(),
    signUpWithEmail: (e: string, p: string, n: string) => authService.signUpWithEmail(e, p, n),
    loginWithEmail: (e: string, p: string) => authService.loginWithEmail(e, p),
    loginAnonymously: () => authService.loginAnonymously(),
    logout: () => authService.logout()
  };
}
export default useAuth;
