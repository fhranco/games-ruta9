import React, { useState, useEffect } from 'react'
import WelcomeScreen from './components/WelcomeScreen'
import PlayerForm from './components/PlayerForm'
import CountdownScreen from './components/CountdownScreen'
import StopwatchGame from './components/StopwatchGame'
import ResultScreen from './components/ResultScreen'
import RulesScreen from './components/RulesScreen'
import AdminPanel from './components/AdminPanel'

function App() {
  const [gameState, setGameState] = useState('welcome') // welcome, form, countdown, playing, result, rules, admin
  const [playerData, setPlayerData] = useState({ name: '', receipt: '' })
  const [lastResult, setLastResult] = useState(null)
  const [adminClickCount, setAdminClickCount] = useState(0)

  // 🛡️ BLINDAJE KIOSCO: Bloqueo de menú contextual y Wake Lock
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);

    // Intentar mantener la pantalla encendida
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').catch(() => {
        console.warn('Wake Lock no disponible o bloqueado.');
      });
    }

    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // 🕵️ Easter Egg Admin
  const handleAdminClick = () => {
    const newCount = adminClickCount + 1
    if (newCount >= 5) {
      setGameState('admin')
      setAdminClickCount(0)
    } else {
      setAdminClickCount(newCount)
    }
  }

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-r9-dark">
      {/* Header Fijo */}
      <header className="p-8 flex justify-center items-center z-10">
        <h1 
          onClick={handleAdminClick}
          className="text-3xl font-black tracking-tighter text-white select-none cursor-pointer"
        >
          RUTA<span className="text-r9-red">9</span> <span className="font-light opacity-50">GAMES</span>
        </h1>
      </header>

      {/* Pantallas */}
      <div className="flex-1 w-full max-w-lg mx-auto px-6 pb-12 overflow-y-auto no-scrollbar">
        {gameState === 'welcome' && (
          <WelcomeScreen 
            onPlay={() => {
              setPlayerData({ name: 'Cliente', receipt: '12345' });
              setGameState('countdown');
            }} 
            onRules={() => setGameState('rules')} 
          />
        )}

        {gameState === 'countdown' && (
          <CountdownScreen 
            onFinished={() => setGameState('playing')} 
          />
        )}

        {gameState === 'playing' && (
          <StopwatchGame 
            onFinished={(result) => {
              setLastResult(result)
              setGameState('result')
            }} 
          />
        )}

        {gameState === 'result' && (
          <ResultScreen 
            result={lastResult}
            playerData={playerData}
            onReset={() => {
              setPlayerData({ name: '', phone: '' })
              setGameState('welcome')
            }}
          />
        )}

        {gameState === 'rules' && (
          <RulesScreen onBack={() => setGameState('welcome')} />
        )}

        {gameState === 'admin' && (
          <AdminPanel onBack={() => setGameState('welcome')} />
        )}
      </div>

      {/* Footer / Decoración */}
      <footer className="p-6 text-center opacity-20 text-[10px] uppercase tracking-[0.3em]">
        Propiedad de Ruta9 Magallanes
      </footer>
    </div>
  )
}

export default App
