import { useEffect } from "react";
import "@fontsource/inter";

// Main App component
function App() {
  useEffect(() => {
    // Redirect to snake game immediately
    window.location.href = '/snake';
  }, []);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#111', 
      color: '#fff',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          marginBottom: '1rem', 
          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent' 
        }}>
          🐍 Loading Snake Game...
        </h1>
        <p style={{ opacity: 0.7 }}>Redirecting to game...</p>
      </div>
    </div>
  );
}

export default App;
