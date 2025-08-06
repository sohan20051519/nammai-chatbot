
import React from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

interface LoginProps {
  onLoginSuccess: (credentialResponse: CredentialResponse) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-5xl md:text-7xl font-bold mb-4">NammAI 🤖</h1>
      <p className="text-lg md:text-xl text-gray-300 mb-8">Your Kanglish-speaking AI companion.</p>
      <div className="p-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
         <GoogleLogin
            onSuccess={onLoginSuccess}
            onError={() => {
              console.error('Login Failed');
            }}
            theme="filled_black"
            size="large"
            shape="pill"
         />
      </div>
      <p className="mt-8 text-sm text-gray-500">Proudly developed by Sohan A 💻✨</p>
    </div>
  );
};

export default Login;
