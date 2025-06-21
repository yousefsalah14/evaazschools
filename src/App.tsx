import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Schools from './components/Schools';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [showSchools, setShowSchools] = useState(false);

  const handleLogin = () => {
    setShowSchools(true);
  };

  // Show schools page if authenticated or after successful login
  if (isAuthenticated || showSchools) {
    return <Schools />;
  }

  // Show login page by default
  return <Login onLogin={handleLogin} />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;