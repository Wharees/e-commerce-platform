import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const useAutoLogout = (logoutAction) => {
  const navigate = useNavigate();
  // This ref will hold onto our timer so we can cancel it later
  const timerRef = useRef(null); 

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        
        // 1. The user left. Start the 30-second countdown (30000 milliseconds)
        timerRef.current = setTimeout(() => {
          // Clear local storage
          localStorage.removeItem('authToken'); 
          localStorage.removeItem('userData');
          sessionStorage.clear();

          // Trigger the store's logout function
          if (logoutAction) {
            logoutAction(); 
          }

          // Redirect to login
          navigate('/login');
        }, 300000); 

      } else if (document.visibilityState === 'visible') {
        
        // 2. The user came back! Cancel the timer if it's running
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null; // Reset the ref
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Safety check: clear the timer if the component unmounts
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [navigate, logoutAction]); 
};

export default useAutoLogout;