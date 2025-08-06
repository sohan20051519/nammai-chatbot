import React, { useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { CredentialResponse } from '@react-oauth/google';
import type { UserProfile } from './types';
import Chat from './components/Chat';
import Login from './components/Login';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);

  const handleLoginSuccess = useCallback((credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      const decoded: { name: string; picture: string; email: string } = jwtDecode(credentialResponse.credential);
      setUser({
        name: decoded.name,
        picture: decoded.picture,
        email: decoded.email,
      });
    }
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <div className="bg-[#1e1e1e] text-[#f5f5f5] min-h-screen font-sans">
      <div style={{ color: "white", fontSize: "2rem", textAlign: "center", marginTop: "30px" }}>
        👋 Welcome to NammAI Chatbot!
      </div>

      {user ? (
        <Chat user={user} onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
};

export default App;
