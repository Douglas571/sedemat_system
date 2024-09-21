import useAuthentication from 'hooks/useAuthentication';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const {setUserAuth} = useAuthentication()

  useEffect(() => {
    // Clear user data from localStorage
    setUserAuth({})

    // Optionally clear all data in localStorage
    // localStorage.clear();

    // Navigate to login or home page after logout
    navigate('/login');
  }, [navigate]);

  return (
    <></>
  );
};

export default Logout;