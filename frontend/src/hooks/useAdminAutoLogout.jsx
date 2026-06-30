import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const useAdminAutoLogout = (timeoutInMinutes = 10) => {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    // 10 minutes in milliseconds
    const timeoutMs = timeoutInMinutes * 60 * 1000;

    const performAdminLogout = () => {
      console.log("🔒 Admin session expired due to inactivity. Logging out...");
      
      // Specifically clear the admin token
      localStorage.removeItem('lasu_token'); 
      
      // Kick straight to admin login
      navigate('/admin/login');
    };

    // Resets the clock to standard 10-minute timeout
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(performAdminLogout, timeoutMs);
    };

    // 🛡️ LAYER 1: PHYSICAL ACTIVITY TRACKER
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));

    // 🛡️ LAYER 2: TAB VISIBILITY TRACKER
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // If they hide the tab, start a strict 5-minute (300,000ms) kill switch
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(performAdminLogout, 300000); 
      } else {
        // If they come back, reset to normal tracking
        resetTimer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start the clock immediately
    resetTimer();

    // Cleanup when they leave the dashboard
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => document.removeEventListener(event, resetTimer));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate, timeoutInMinutes]); 
};

export default useAdminAutoLogout;