import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import "@fontsource/inter";

// Main App component
function App() {
  const [showCanvas, setShowCanvas] = useState(false);

  // Show the canvas once everything is loaded
  useEffect(() => {
    setShowCanvas(true);
  }, []);

  if (!showCanvas) {
    return <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#111', color: '#fff' }}>Loading...</div>;
  }

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      backgroundColor: '#111',
      color: '#fff',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '2rem', background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🎮 Game Hub
        </h1>
        
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '2rem',
            borderRadius: '15px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            maxWidth: '300px',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }} 
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onClick={() => window.location.href = '/snake'}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🐍 Snake Game</h2>
            <p style={{ marginBottom: '1rem', opacity: 0.9 }}>
              Classic snake game with jungle theme. Eat apples and grow your snake!
            </p>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '0.5rem 1rem',
              borderRadius: '25px',
              display: 'inline-block'
            }}>
              Play Now
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            padding: '2rem',
            borderRadius: '15px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            maxWidth: '300px',
            opacity: 0.6,
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⚡ 3D Game</h2>
            <p style={{ marginBottom: '1rem', opacity: 0.9 }}>
              3D game with React Three Fiber - Coming Soon!
            </p>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '0.5rem 1rem',
              borderRadius: '25px',
              display: 'inline-block'
            }}>
              In Development
            </div>
          </div>
        </div>

        <div style={{ 
          position: 'absolute', 
          bottom: '2rem', 
          fontSize: '0.9rem', 
          opacity: 0.7 
        }}>
          Select a game to start playing
        </div>
      </div>
    </div>
  );
}

export default App;
