import React, { useState, useEffect } from 'react';
import { Car, GameStats } from './types';
import GameCanvasProps from './components/GameCanvas';
import Garage from './components/Garage';
import { audioEngine } from './components/AudioEngine';
import { Coins, Trophy, Clock, ShieldAlert, Sparkles, Award, Play, RotateCcw } from 'lucide-react';

const INITIAL_CARS: Car[] = [
  {
    id: 'damas',
    name: 'Damas',
    price: 0,
    description: "O'zbekiston ko'chalarining afsonasi. Kichkina lekin chaqqon shahar qiroli.",
    color: '#f8fafc', // White
    baseMaxHealth: 100,
    baseMaxSpeed: 140,
    baseHandling: 1.0,
    baseMagnetRadius: 65,
    size: { width: 32, height: 16 },
    unlocked: true,
    upgrades: { speed: 0, health: 0, handling: 0, magnet: 0 }
  },
  {
    id: 'tico',
    name: 'Tico',
    price: 1200,
    description: "Sariq quti! Juda kichik o'lchami bilan tor tirqishlardan chaqqon qochib ketadi.",
    color: '#ef4444', // Red
    baseMaxHealth: 75,
    baseMaxSpeed: 155,
    baseHandling: 1.25,
    baseMagnetRadius: 75,
    size: { width: 26, height: 14 },
    unlocked: false,
    upgrades: { speed: 0, health: 0, handling: 0, magnet: 0 }
  },
  {
    id: 'matiz',
    name: 'Matiz',
    price: 2500,
    description: "Hamyonbop va yumshoq shahar mashinasi. Shinam va moslashuvchan.",
    color: '#a3e635', // Light Lime Green
    baseMaxHealth: 110,
    baseMaxSpeed: 150,
    baseHandling: 1.15,
    baseMagnetRadius: 80,
    size: { width: 30, height: 15 },
    unlocked: false,
    upgrades: { speed: 0, health: 0, handling: 0, magnet: 0 }
  },
  {
    id: 'nexia1',
    name: 'Nexia 1 (SOHC)',
    price: 5000,
    description: "Haqiqiy klassika! Eski maktabning pishgan va ishonchli jangchisi.",
    color: '#94a3b8', // Silverish Grey
    baseMaxHealth: 130,
    baseMaxSpeed: 165,
    baseHandling: 1.05,
    baseMagnetRadius: 90,
    size: { width: 34, height: 17 },
    unlocked: false,
    upgrades: { speed: 0, health: 0, handling: 0, magnet: 0 }
  },
  {
    id: 'nexia2',
    name: 'Nexia 2 (Doncha)',
    price: 8000,
    description: "Kuchaytirilgan motor va quyma diskli milliy yo'l to'lqiri.",
    color: '#334155', // Wet Asphalt Dark Blue/Grey
    baseMaxHealth: 140,
    baseMaxSpeed: 175,
    baseHandling: 1.1,
    baseMagnetRadius: 95,
    size: { width: 35, height: 17 },
    unlocked: false,
    upgrades: { speed: 0, health: 0, handling: 0, magnet: 0 }
  },
  {
    id: 'nexia3',
    name: 'Nexia 3',
    price: 12000,
    description: "Yangi avlod Nexia. Ko'rkam dizayn va chaqqon shahar krossoverligi.",
    color: '#e2e8f0', // Shiny Grey
    baseMaxHealth: 150,
    baseMaxSpeed: 180,
    baseHandling: 1.12,
    baseMagnetRadius: 100,
    size: { width: 35, height: 17 },
    unlocked: false,
    upgrades: { speed: 0, health: 0, handling: 0, magnet: 0 }
  },
  {
    id: 'cobalt',
    name: 'Cobalt (Borzoy)',
    price: 18000,
    description: "Keng bamper va mustahkam podveska! Cho'llardagi chuqurlarni umuman ko'rmaydi.",
    color: '#64748b', // Cobalt Blue/Grey
    baseMaxHealth: 170,
    baseMaxSpeed: 185,
    baseHandling: 1.08,
    baseMagnetRadius: 105,
    size: { width: 36, height: 18 },
    unlocked: false,
    upgrades: { speed: 0, health: 0, handling: 0, magnet: 0 }
  },
  {
    id: 'gentra',
    name: 'Gentra (Lacetti)',
    price: 25000,
    description: "Lyukli qora joziba! Tuning muxlislarining mutlaq sevimlisi.",
    color: '#09090b', // Pitch Black
    baseMaxHealth: 185,
    baseMaxSpeed: 195,
    baseHandling: 1.2,
    baseMagnetRadius: 110,
    size: { width: 36, height: 17 },
    unlocked: false,
    upgrades: { speed: 0, health: 0, handling: 0, magnet: 0 }
  },
  {
    id: 'tracker',
    name: 'Tracker 2',
    price: 35000,
    description: "Chiroyli LED chiroqlar va turbodvigatelli zamonaviy shahar krossoveri.",
    color: '#1d4ed8', // Sporty Royal Blue
    baseMaxHealth: 190,
    baseMaxSpeed: 210,
    baseHandling: 1.25,
    baseMagnetRadius: 115,
    size: { width: 35, height: 18 },
    unlocked: false,
    upgrades: { speed: 0, health: 0, handling: 0, magnet: 0 }
  },
  {
    id: 'captiva',
    name: 'Captiva 4',
    price: 48000,
    description: "Katta oilaviy yo'ltanlamas. Og'ir vazi bilan politsiya to'siqlarini yiqitadi.",
    color: '#cbd5e1', // Captiva Pearl
    baseMaxHealth: 250,
    baseMaxSpeed: 190,
    baseHandling: 1.0,
    baseMagnetRadius: 120,
    size: { width: 38, height: 19 },
    unlocked: false,
    upgrades: { speed: 0, health: 0, handling: 0, magnet: 0 }
  },
  {
    id: 'onix',
    name: 'Onix Turbo',
    price: 60000,
    description: "Eng tezkor turbo sedan. Tezlasha boshlaganda, chiyaborilar changida qoladi.",
    color: '#dc2626', // Crimson active Red
    baseMaxHealth: 200,
    baseMaxSpeed: 220,
    baseHandling: 1.22,
    baseMagnetRadius: 125,
    size: { width: 36, height: 17 },
    unlocked: false,
    upgrades: { speed: 0, health: 0, handling: 0, magnet: 0 }
  },
  {
    id: 'monza',
    name: 'Monza',
    price: 75000,
    description: "Yirtqich qiyofadagi sportchi. Katta tezlik va aerodinamik qattiq burilish.",
    color: '#a21caf', // Deep Neon Purple
    baseMaxHealth: 210,
    baseMaxSpeed: 235,
    baseHandling: 1.25,
    baseMagnetRadius: 130,
    size: { width: 37, height: 17.5 },
    unlocked: false,
    upgrades: { speed: 0, health: 0, handling: 0, magnet: 0 }
  },
  {
    id: 'malibu2',
    name: 'Malibu 2 Turbo',
    price: 95000,
    description: "Biznes klass va super tezlik uyg'unligi. Premium qulaylik va xavfsizlik drayvi.",
    color: '#451a03', // Elegant Shaded Chocolate Brown/Bronze
    baseMaxHealth: 230,
    baseMaxSpeed: 245,
    baseHandling: 1.28,
    baseMagnetRadius: 140,
    size: { width: 37.5, height: 18 },
    unlocked: false,
    upgrades: { speed: 0, health: 0, handling: 0, magnet: 0 }
  },
  {
    id: 'tahoe',
    name: 'Tahoe V8',
    price: 130000,
    description: "Prezident darajasidagi yo'ltanlamas. Politsiya va chiyaborilarni shunchaki ramlab parchalaydi!",
    color: '#1c1917', // Matte Black
    baseMaxHealth: 350,
    baseMaxSpeed: 205,
    baseHandling: 0.95,
    baseMagnetRadius: 150,
    size: { width: 44, height: 21 },
    unlocked: false,
    upgrades: { speed: 0, health: 0, handling: 0, magnet: 0 }
  },
  {
    id: 'byd',
    name: 'BYD Song Plus',
    price: 180000,
    description: "Elektr quvvati cheksiz! Lahzada tezlashadi va tangalarni magnit kabi o'ziga jalb qiladi.",
    color: '#0d9488', // Emerald Electric Cyan
    baseMaxHealth: 280,
    baseMaxSpeed: 260,
    baseHandling: 1.35,
    baseMagnetRadius: 170,
    size: { width: 38, height: 18.5 },
    unlocked: false,
    upgrades: { speed: 0, health: 0, handling: 0, magnet: 0 }
  }
];

export default function App() {
  // Game state loaded from localStorage
  const [cars, setCars] = useState<Car[]>(INITIAL_CARS);
  const [selectedCarId, setSelectedCarId] = useState<string>('damas');
  const [playerMoney, setPlayerMoney] = useState<number>(0);
  const [highscore, setHighscore] = useState<number>(0);

  // Runtime View States
  const [activeScreen, setActiveScreen] = useState<'garage' | 'game'>('garage');
  const [lastStats, setLastStats] = useState<GameStats | null>(null);
  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(false);

  // Load initial settings on mounting from localStorage
  useEffect(() => {
    try {
      const savedMoney = localStorage.getItem('chiyabori_player_money');
      if (savedMoney !== null) {
        setPlayerMoney(parseInt(savedMoney, 10));
      } else {
        // Starting balance
        setPlayerMoney(0);
      }

      const savedHighscore = localStorage.getItem('chiyabori_highscore');
      if (savedHighscore !== null) {
        setHighscore(parseInt(savedHighscore, 10));
      }

      const savedCarId = localStorage.getItem('chiyabori_selected_car');
      if (savedCarId !== null) {
        setSelectedCarId(savedCarId);
      }

      const savedCars = localStorage.getItem('chiyabori_unlocked_cars');
      if (savedCars !== null) {
        const parsedCarsList = JSON.parse(savedCars) as { id: string; unlocked: boolean; upgrades: Car['upgrades'] }[];
        
        setCars((prevCars) => 
          prevCars.map((car) => {
            const saved = parsedCarsList.find((c) => c.id === car.id);
            if (saved) {
              return {
                ...car,
                unlocked: saved.unlocked,
                upgrades: saved.upgrades || { speed: 0, health: 0, handling: 0, magnet: 0 },
              };
            }
            return car;
          })
        );
      }
    } catch (e) {
      console.error("Local storage fetching failed:", e);
    }
  }, []);

  // Save changes to localStorage on modifier actions
  const saveStateToStorage = (updatedMoney: number, updatedCars: Car[], updatedCarId: string, updatedHighscore: number) => {
    try {
      localStorage.setItem('chiyabori_player_money', updatedMoney.toString());
      localStorage.setItem('chiyabori_highscore', updatedHighscore.toString());
      localStorage.setItem('chiyabori_selected_car', updatedCarId);
      
      const compressedCars = updatedCars.map((c) => ({
        id: c.id,
        unlocked: c.unlocked,
        upgrades: c.upgrades,
      }));
      localStorage.setItem('chiyabori_unlocked_cars', JSON.stringify(compressedCars));
    } catch (e) {
      console.error("Local storage saving failed:", e);
    }
  };

  // Switch Selected Car
  const handleSelectCar = (carId: string) => {
    setSelectedCarId(carId);
    audioEngine.playCoin();
    saveStateToStorage(playerMoney, cars, carId, highscore);
  };

  // Buy custom vehicle with accumulated cash
  const handleUnlockCar = (carId: string, price: number) => {
    if (playerMoney < price) return;
    
    const newMoney = playerMoney - price;
    const newCars = cars.map((c) => (c.id === carId ? { ...c, unlocked: true } : c));
    
    setPlayerMoney(newMoney);
    setCars(newCars);
    setSelectedCarId(carId); // switch immediately

    audioEngine.playUpgrade();
    saveStateToStorage(newMoney, newCars, carId, highscore);
  };

  // Perform a vehicle upgrade (speed, armor handling, magnet)
  const handleUpgradeCar = (carId: string, type: 'speed' | 'health' | 'handling' | 'magnet', cost: number) => {
    if (playerMoney < cost) return;

    const newMoney = playerMoney - cost;
    const newCars = cars.map((c) => {
      if (c.id === carId) {
        const currentLvl = c.upgrades[type];
        return {
          ...c,
          upgrades: {
            ...c.upgrades,
            [type]: currentLvl + 1,
          },
        };
      }
      return c;
    });

    setPlayerMoney(newMoney);
    setCars(newCars);

    audioEngine.playUpgrade();
    saveStateToStorage(newMoney, newCars, selectedCarId, highscore);
  };

  // Game over hook to save coins on death as requested! "men o'lganda tanga saqlanib qolsin"
  const handleGameOver = (earnedInRun: number, stats: GameStats) => {
    const finalRunMoney = earnedInRun;
    const newTotalMoney = playerMoney + finalRunMoney;
    
    let isBetterScore = false;
    let newHigh = highscore;
    if (stats.score > highscore) {
      newHigh = stats.score;
      setHighscore(newHigh);
      isBetterScore = true;
    }

    setPlayerMoney(newTotalMoney);
    setLastStats(stats);
    setShowGameOverModal(true);
    setActiveScreen('garage'); // return back to main garage menu for shopping or retrying

    // Save state directly to protect money earnings
    saveStateToStorage(newTotalMoney, cars, selectedCarId, newHigh);
  };

  const currentSelectedCar = cars.find((c) => c.id === selectedCarId) || cars[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0b1329] to-[#01040f] text-white flex flex-col font-sans selection:bg-yellow-500 selection:text-black relative overflow-hidden">
      
      {/* Immersive Road Perspective Grid background */}
      <div className="game-grid absolute inset-0 z-0 pointer-events-none opacity-40" />
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 filter blur-3xl pulse-ambient pointer-events-none z-0" />
      <div className="absolute top-2/3 right-10 w-[450px] h-[450px] rounded-full bg-purple-900/10 filter blur-3xl pulse-ambient pointer-events-none z-0" />

      {/* Immersive top header summary row */}
      <header className="p-4 glass sticky top-0 z-50 shadow-2xl border-b border-slate-705/30">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center text-neutral-950 font-bold text-lg select-none shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              🦊
            </div>
            <div>
              <h1 className="text-white text-base font-extrabold uppercase tracking-tight leading-4">
                Chiyabori & Politsiya
              </h1>
              <span className="text-[10px] text-blue-400 font-mono tracking-wider">
                O'zbek Davlat Avto Quvlagichi
              </span>
            </div>
          </div>

          {/* Quick stats totals */}
          <div className="flex items-center gap-4 text-xs font-mono">
            {/* Balance banner */}
            <div className="flex items-center gap-1.5 glass px-4 py-2 rounded-xl border border-slate-700/50 shadow-inner">
              <Coins size={14} className="text-yellow-400 glow-yellow" />
              <span className="text-slate-400">Mablag':</span>
              <span className="text-yellow-400 font-extrabold">${playerMoney.toLocaleString()}</span>
            </div>

            {/* Highscore banner */}
            <div className="flex items-center gap-1.5 glass px-4 py-2 rounded-xl border border-slate-700/50 shadow-inner">
              <Trophy size={14} className="text-purple-400 glow-purple" />
              <span className="text-slate-400">Maks:</span>
              <span className="text-purple-300 font-extrabold">{highscore.toLocaleString()} b.</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Workspace Frame container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 flex flex-col gap-6 z-10 relative">
        
        {/* Toggle Game or Garage Screen Workspace */}
        {activeScreen === 'garage' ? (
          <div className="flex flex-col gap-6">
            
            {/* Hero welcome dashboard info containing instructions */}
            <div className="relative w-full rounded-2xl border border-slate-800/60 glass p-6 overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
              
              <div className="space-y-3 max-w-lg">
                <div className="flex items-center gap-1.5 text-yellow-500 font-mono text-xs uppercase tracking-widest">
                  <span className="animate-ping w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  O'yin Qoidalari (O'zbek tilida)
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
                  Chiyaborilar va Politsiya o'ljasi bo'lmang!
                </h2>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Cho'l o'rtasida oltin tangalar sochildi. Har bir tanga <span className="text-emerald-400 font-semibold">$100</span> dollar, tasodifiy tushadigan mega tangalar esa <span className="text-yellow-300 font-semibold animate-pulse glow-yellow">$300</span> dollardan daromad keltiradi! Politsiya va Chiyaborilar sizni quvlaydi. Mashinangizni boshqarib qoching.
                </p>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono font-bold pt-1.5 text-slate-300">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">W: Oldinga</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">S: Orqaga</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800/80 text-blue-300">D: Chapga (Left)</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800/80 text-blue-300">A: O'ngga (Right)</span>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  * Muhim: Katta tezlikda borib dushmanlarga urilsangiz, ularni portlatib yuborasiz (Ram Attack) va katta pul mukofoti olasiz!
                </p>
              </div>

              {/* Big play button section */}
              <div className="flex flex-col items-center gap-3 pr-0 lg:pr-6">
                <button
                  onClick={() => {
                    audioEngine.playCoin();
                    setActiveScreen('game');
                  }}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-neutral-950 flex flex-col items-center justify-center gap-1 shadow-[0_0_30px_rgba(250,204,21,0.3)] hover:shadow-[0_0_40px_rgba(250,204,21,0.55)] hover:scale-105 active:scale-95 duration-200 cursor-pointer transform transition-all border-4 border-slate-900"
                >
                  <Play size={36} fill="currentColor" />
                  <span className="font-mono text-xs uppercase font-extrabold tracking-widest mt-1">SAYOHAT</span>
                </button>
                <span className="text-[10px] text-yellow-300 font-mono tracking-tight select-none">
                  {currentSelectedCar.name} bilan jangga!
                </span>
              </div>

            </div>

            {/* Garage layout containing 15 cars Catalog and Upgrade mechanisms */}
            <Garage
              cars={cars}
              selectedCarId={selectedCarId}
              playerMoney={playerMoney}
              onSelectCar={handleSelectCar}
              onUnlockCar={handleUnlockCar}
              onUpgradeCar={handleUpgradeCar}
            />

          </div>
        ) : (
          /* Canvas Active Gameplay Zone */
          <div className="flex flex-col gap-4">
            
            {/* Upper action bar */}
            <div className="flex justify-between items-center px-2">
              <button
                onClick={() => {
                  audioEngine.playCoin();
                  setActiveScreen('garage');
                }}
                className="px-4 py-2 border border-slate-800/40 glass text-white rounded-xl font-mono text-xs hover:bg-slate-800/50 hover:border-slate-700/60 transition cursor-pointer"
              >
                ⬅️ Garajga qaytish
              </button>

              <div className="text-right text-xs text-slate-400 font-mono">
                Mashina: <span className="text-white font-bold">{currentSelectedCar.name}</span> | Tezlik x{1 + currentSelectedCar.upgrades.speed * 0.15}
              </div>
            </div>

            <GameCanvasProps
              currentCar={currentSelectedCar}
              playerMoney={playerMoney}
              onGameOver={handleGameOver}
            />

          </div>
        )}

      </main>

      {/* Persistent overlay notification banner for Game Over statistics */}
      {showGameOverModal && lastStats && (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center p-4 z-50 animate-fade-in select-none backdrop-blur-md">
          <div className="glass border border-slate-800 rounded-2xl w-full max-w-md p-6 relative flex flex-col items-center shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            
            {/* Emoji badge */}
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center text-3xl mb-4 animate-bounce">
              💥
            </div>

            {/* Title */}
            <h3 className="text-white text-xl font-mono uppercase tracking-widest font-extrabold text-red-500">
              O'yin Tugadi (Crash!)
            </h3>
            
            <p className="text-slate-400 text-xs text-center mt-1 mb-5">
              Mashinangiz politsiya va chiyaborilar tomonidan butkul tamom qilindi.
            </p>

            {/* Run Stats box */}
            <div className="w-full bg-slate-950/80 p-4 border border-slate-800/40 rounded-xl space-y-3 font-mono text-xs mb-6 shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 uppercase">Tirik qolindi:</span>
                <span className="text-white font-bold">{lastStats.timeSurvived} soniya</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 uppercase">Yig'ilgan Tangalar:</span>
                <span className="text-white font-bold">{lastStats.coinsCollected} ta</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 uppercase">Yig'ilgan Mega Tangalar:</span>
                <span className="text-yellow-400 font-bold glow-yellow">{lastStats.megaCoinsCollected} ta</span>
              </div>
              <div className="h-px bg-slate-800/60 w-full" />
              <div className="flex justify-between items-center text-yellow-400">
                <span className="uppercase font-bold">Ushbu jangda topildi:</span>
                <span className="font-extrabold text-base glow-yellow">+${lastStats.earnedInRun}</span>
              </div>
              <div className="flex justify-between items-center text-purple-400 font-semibold">
                <span className="uppercase font-bold">Jami Sayohat Ballari:</span>
                <span className="font-extrabold text-base glow-purple">{lastStats.score} ball</span>
              </div>
            </div>

            {/* Coin persistence guarantee notification in Uzbek as requested */}
            <div className="w-full p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-center font-mono text-[10px] mb-6">
              🛡️ Tangalaringiz saqlandi! topilgan <span className="font-bold">+${lastStats.earnedInRun}</span> yangi mashinalarni sotib olish hamda kuchaytirish uchun hisobingizga qo'shildi.
            </div>

            {/* Buttons */}
            <div className="flex gap-3 w-full">
              <button
                onClick={() => {
                  audioEngine.playCoin();
                  setShowGameOverModal(false);
                  setActiveScreen('game');
                }}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-neutral-950 font-mono text-xs uppercase font-extrabold rounded-xl transition cursor-pointer shadow-[0_4px_15px_rgba(245,158,11,0.2)] active:scale-95 duration-100"
              >
                Qayta Bosish (Retry)
              </button>
              <button
                onClick={() => {
                  audioEngine.playCoin();
                  setShowGameOverModal(false);
                }}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 font-mono text-xs uppercase font-bold rounded-xl transition cursor-pointer active:scale-95"
              >
                Garaj (Garage)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer credits content */}
      <footer className="py-6 border-t border-slate-900/40 bg-slate-950/80 text-center text-xs text-slate-500 font-mono z-10 relative">
        <div>© 2026 Chiyabori va Politsiya Escape Avtodrome. Tasdiqlangan Uzbek avto to'lqiri.</div>
        <div className="text-[10px] text-slate-600 mt-1">W/S/A/D maxsus teskari boshqaruv tizimi faollashtirilgan.</div>
      </footer>

    </div>
  );
}
