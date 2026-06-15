import React, { useState } from 'react';
import { Car, UpgradeConfig } from '../types';
import { audioEngine } from './AudioEngine';
import { Shield, Zap, RefreshCw, Award, Lock, Sparkles, Coins, HelpCircle } from 'lucide-react';

interface GarageProps {
  cars: Car[];
  selectedCarId: string;
  playerMoney: number;
  onSelectCar: (carId: string) => void;
  onUnlockCar: (carId: string, price: number) => void;
  onUpgradeCar: (carId: string, type: 'speed' | 'health' | 'handling' | 'magnet', cost: number) => void;
}

export const UPGRADE_MAX_LEVEL = 5;

export const UPGRADE_CONFIG: UpgradeConfig = {
  speedCost: [300, 600, 1000, 1600, 2500],
  healthCost: [250, 500, 850, 1400, 2200],
  handlingCost: [200, 450, 800, 1200, 1900],
  magnetCost: [150, 350, 700, 1000, 1500],
};

export default function Garage({
  cars,
  selectedCarId,
  playerMoney,
  onSelectCar,
  onUnlockCar,
  onUpgradeCar,
}: GarageProps) {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'upgrades'>('vehicles');
  
  const currentCar = cars.find(c => c.id === selectedCarId) || cars[0];

  // Helper to determine upgrade price
  const getUpgradeCost = (type: 'speed' | 'health' | 'handling' | 'magnet', currentLvl: number) => {
    if (currentLvl >= UPGRADE_MAX_LEVEL) return -1; // max level
    switch (type) {
      case 'speed': return UPGRADE_CONFIG.speedCost[currentLvl];
      case 'health': return UPGRADE_CONFIG.healthCost[currentLvl];
      case 'handling': return UPGRADE_CONFIG.handlingCost[currentLvl];
      case 'magnet': return UPGRADE_CONFIG.magnetCost[currentLvl];
    }
  };

  const handleUpgrade = (type: 'speed' | 'health' | 'handling' | 'magnet') => {
    const currentLvl = currentCar.upgrades[type];
    const cost = getUpgradeCost(type, currentLvl);
    
    if (cost === -1) return;
    if (playerMoney < cost) {
      // flash alert or fail sound
      audioEngine.playCrash();
      return;
    }

    onUpgradeCar(currentCar.id, type, cost);
  };

  const handleUnlock = (car: Car) => {
    if (playerMoney < car.price) {
      audioEngine.playCrash();
      return;
    }
    onUnlockCar(car.id, car.price);
  };

  return (
    <div className="w-full flex flex-col glass rounded-2xl border border-slate-800/60 p-5 shadow-2xl select-none relative overflow-hidden">
      
      {/* Upper bar: Balance and Nav */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-950/70 px-4 py-3 rounded-xl border border-slate-800/40 mb-5 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 animate-pulse glow-yellow">
            <Coins size={22} />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Sizning Pul hisobingiz</div>
            <div className="text-xl font-mono font-extrabold text-yellow-400 glow-yellow">
              ${playerMoney.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`px-4 py-1.5 font-mono text-xs font-bold rounded-md transition duration-155 cursor-pointer ${activeTab === 'vehicles' ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-neutral-950 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-white'}`}
          >
            Mashinalar (15 ta)
          </button>
          <button
            onClick={() => setActiveTab('upgrades')}
            className={`px-4 py-1.5 font-mono text-xs font-bold rounded-md transition duration-155 cursor-pointer ${activeTab === 'upgrades' ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-neutral-950 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-white'}`}
          >
            Kuchaytirish (Upgrade)
          </button>
        </div>
      </div>

      {activeTab === 'vehicles' ? (
        /* Dynamic list of 15 cars */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Detailed selected vehicle card representation */}
          <div className="md:col-span-1 glass-highlight rounded-xl border border-slate-800/60 p-5 flex flex-col justify-between items-center text-center shadow-lg">
            
            <div className="w-full">
              <span className="text-[9px] font-mono text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                Garajdagi mashina
              </span>
              <h3 className="text-white text-base font-bold uppercase mt-2 font-sans tracking-tight">
                {currentCar.name}
              </h3>
              <p className="text-slate-350 text-xs mt-1 font-mono">{currentCar.description}</p>
            </div>

            {/* Stylized top-down abstract drawing of the selected vehicle */}
            <div className="relative w-full h-40 bg-slate-950/90 border border-slate-900/60 rounded-xl my-4 overflow-hidden flex items-center justify-center">
              
              {/* Back lights glow decoration */}
              <div 
                className="absolute w-24 h-24 rounded-full filter blur-xl opacity-30 animate-pulse"
                style={{ backgroundColor: currentCar.color }}
              />

              {/* Wheels top/bottom representation */}
              <div className="absolute w-28 h-12 flex justify-between items-center">
                <div className="flex flex-col justify-between h-14">
                  <div className="w-6 h-3.5 bg-neutral-800 rounded-sm" />
                  <div className="w-6 h-3.5 bg-neutral-800 rounded-sm" />
                </div>
                <div className="flex flex-col justify-between h-14">
                  <div className="w-6 h-3.5 bg-neutral-800 rounded-sm" />
                  <div className="w-6 h-3.5 bg-neutral-800 rounded-sm" />
                </div>
              </div>

              {/* Chassis body outline color */}
              <div 
                className="relative w-24 h-11 rounded-lg border-2 border-white/20 shadow-lg flex items-center justify-center transition"
                style={{ backgroundColor: currentCar.color }}
              >
                {/* Windshield */}
                <div className="absolute right-4 w-5 h-7 bg-slate-950/80 rounded-sm border border-white/15" />
                <span className="text-white font-mono text-[10px] uppercase font-extrabold rotate-0 tracking-tight z-10 select-none">
                  {currentCar.name}
                </span>
              </div>
            </div>

            {/* Selected car base features */}
            <div className="w-full flex gap-2 font-mono text-[9px] text-slate-300 justify-center mb-1">
              <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800/40">Tezlik: {currentCar.baseMaxSpeed}</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800/40">HP: {currentCar.baseMaxHealth}</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800/40 text-yellow-300">Magnit: {currentCar.baseMagnetRadius}m</span>
            </div>

          </div>

          {/* Catalog of 15 cars grid */}
          <div className="md:col-span-2 flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
            {cars.map((car) => {
              const isSelected = car.id === selectedCarId;
              
              return (
                <div 
                  key={car.id}
                  onClick={() => car.unlocked && onSelectCar(car.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                    isSelected 
                      ? 'bg-gradient-to-r from-slate-900 to-slate-950 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.15)] translate-x-1' 
                      : car.unlocked 
                        ? 'bg-slate-900/45 border-slate-800/60 hover:border-slate-700/80' 
                        : 'bg-slate-950/15 border-slate-900/40 opacity-55'
                  }`}
                >
                  {/* Left Column info */}
                  <div className="flex items-center gap-3">
                    {/* Tiny representation badge in vehicle color */}
                    <div 
                      className="w-10 h-7 rounded flex items-center justify-center font-mono text-[8px] font-bold text-white shadow-inner uppercase border border-white/10"
                      style={{ backgroundColor: car.color }}
                    >
                      {car.name.slice(0, 3)}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-white text-xs font-bold uppercase tracking-tight">{car.name}</span>
                        {car.unlocked ? (
                          <span className="text-[8px] font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 rounded-full uppercase">Sotib olingan</span>
                        ) : (
                          <span className="text-[8px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-1.5 rounded-full uppercase">Qulflangan</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-405 font-mono mt-0.5">{car.description}</div>
                    </div>
                  </div>

                  {/* Right Action column */}
                  <div>
                    {car.unlocked ? (
                      isSelected ? (
                        <div className="px-3.5 py-1.5 rounded-lg bg-yellow-400/15 border border-yellow-400/30 text-[10px] font-mono font-bold text-yellow-400 uppercase tracking-widest text-center animate-pulse glow-yellow">
                          Faollashtirilgan
                        </div>
                      ) : (
                        <button 
                          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-[10px] font-semibold transition cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCar(car.id);
                          }}
                        >
                          Tanlash
                        </button>
                      )
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlock(car);
                        }}
                        className={`px-3.5 py-1.5 rounded-lg font-mono text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          playerMoney >= car.price 
                            ? 'bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white shadow-md' 
                            : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                        }`}
                      >
                        <Lock size={11} />
                        Sotib Olish (${car.price})
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      ) : (
        /* Dynamic Upgrade view for the chosen active vehicle */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Active vehicle preview card */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800/60 p-5 flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-mono text-slate-400 bg-slate-900 border border-slate-800/50 px-2.5 py-1 rounded-full uppercase">Tanlangan transport</span>
              <h4 className="text-white text-lg font-bold uppercase mt-3.5">{currentCar.name}</h4>
              <p className="text-slate-400 text-xs mt-1.5 font-mono leading-relaxed">Xususiyatlarini yangilab, qurol va quvvatlarni kuchaytiring.</p>
            </div>

            {/* Current Level display matrix */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="bg-slate-900/65 border border-slate-800/50 p-3 rounded-xl font-mono text-xs shadow-inner">
                <div className="text-slate-400">Tezlik Level:</div>
                <div className="text-white font-extrabold text-sm">{currentCar.upgrades.speed} / {UPGRADE_MAX_LEVEL}</div>
              </div>
              <div className="bg-slate-900/65 border border-slate-800/50 p-3 rounded-xl font-mono text-xs shadow-inner">
                <div className="text-slate-400">Zarba Lvl:</div>
                <div className="text-white font-extrabold text-sm">{currentCar.upgrades.health} / {UPGRADE_MAX_LEVEL}</div>
              </div>
              <div className="bg-slate-900/65 border border-slate-800/50 p-3 rounded-xl font-mono text-xs shadow-inner">
                <div className="text-slate-400">Grip Lvl:</div>
                <div className="text-white font-extrabold text-sm">{currentCar.upgrades.handling} / {UPGRADE_MAX_LEVEL}</div>
              </div>
              <div className="bg-slate-900/65 border border-slate-800/50 p-3 rounded-xl font-mono text-xs shadow-inner">
                <div className="text-slate-400">Magnit Lvl:</div>
                <div className="text-yellow-400 font-extrabold text-sm">{currentCar.upgrades.magnet} / {UPGRADE_MAX_LEVEL}</div>
              </div>
            </div>

            <div className="text-[10px] text-amber-400 px-3 py-1.5 bg-amber-500/5 border border-amber-500/15 rounded-xl font-mono animate-pulse">
              * Kuchliroq magnit sizga uzoqdagi oltin tangalarni tezroq tortadi!
            </div>
          </div>

          {/* Interactive slider upgrades with pricing list */}
          <div className="flex flex-col gap-3">
            
            {/* 1. Speed upgrade option */}
            {(() => {
              const currentLvl = currentCar.upgrades.speed;
              const cost = getUpgradeCost('speed', currentLvl);
              const isMax = currentLvl >= UPGRADE_MAX_LEVEL;
              
              return (
                <div className="p-3.5 bg-slate-900/40 border border-slate-800/60 rounded-xl flex items-center justify-between gap-3 shadow-md glass-highlight">
                  <div className="flex-1">
                    <div className="flex justify-between items-center text-xs font-bold font-mono">
                      <span className="text-blue-400 flex items-center gap-1">⚡ Maksimal Tezlik</span>
                      <span className="text-slate-400">Lv {currentLvl}/{UPGRADE_MAX_LEVEL}</span>
                    </div>
                    {/* Metrix level indicator block */}
                    <div className="flex gap-1.5 mt-2">
                      {[1, 2, 3, 4, 5].map((idx) => (
                        <div 
                          key={idx} 
                          className={`flex-1 h-2 rounded-full ${idx <= currentLvl ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-slate-850'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    {isMax ? (
                      <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">MAKS</span>
                    ) : (
                      <button
                        onClick={() => handleUpgrade('speed')}
                        disabled={playerMoney < cost}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                          playerMoney >= cost 
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md' 
                            : 'bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-850'
                        }`}
                      >
                        Yangilash (${cost})
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 2. Health durability upgrade option */}
            {(() => {
              const currentLvl = currentCar.upgrades.health;
              const cost = getUpgradeCost('health', currentLvl);
              const isMax = currentLvl >= UPGRADE_MAX_LEVEL;
              
              return (
                <div className="p-3.5 bg-slate-900/40 border border-slate-800/60 rounded-xl flex items-center justify-between gap-3 shadow-md glass-highlight">
                  <div className="flex-1">
                    <div className="flex justify-between items-center text-xs font-bold font-mono">
                      <span className="text-emerald-400 flex items-center gap-1">🛡️ Zarba Bardoshi</span>
                      <span className="text-slate-400">Lv {currentLvl}/{UPGRADE_MAX_LEVEL}</span>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      {[1, 2, 3, 4, 5].map((idx) => (
                        <div 
                          key={idx} 
                          className={`flex-1 h-2 rounded-full ${idx <= currentLvl ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-850'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    {isMax ? (
                      <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">MAKS</span>
                    ) : (
                      <button
                        onClick={() => handleUpgrade('health')}
                        disabled={playerMoney < cost}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                          playerMoney >= cost 
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md' 
                            : 'bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-850'
                        }`}
                      >
                        Yangilash (${cost})
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 3. Handling performance upgrade option */}
            {(() => {
              const currentLvl = currentCar.upgrades.handling;
              const cost = getUpgradeCost('handling', currentLvl);
              const isMax = currentLvl >= UPGRADE_MAX_LEVEL;
              
              return (
                <div className="p-3.5 bg-slate-900/40 border border-slate-800/60 rounded-xl flex items-center justify-between gap-3 shadow-md glass-highlight">
                  <div className="flex-1">
                    <div className="flex justify-between items-center text-xs font-bold font-mono">
                      <span className="text-purple-400 flex items-center gap-1">⚙️ Burilish kuchi (Grip)</span>
                      <span className="text-slate-400">Lv {currentLvl}/{UPGRADE_MAX_LEVEL}</span>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      {[1, 2, 3, 4, 5].map((idx) => (
                        <div 
                          key={idx} 
                          className={`flex-1 h-2 rounded-full ${idx <= currentLvl ? 'bg-purple-500 shadow-[0_0_8px_#a855f7]' : 'bg-slate-850'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    {isMax ? (
                      <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">MAKS</span>
                    ) : (
                      <button
                        onClick={() => handleUpgrade('handling')}
                        disabled={playerMoney < cost}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                          playerMoney >= cost 
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md' 
                            : 'bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-850'
                        }`}
                      >
                        Yangilash (${cost})
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 4. Gold Magnet radius expansion upgrade option */}
            {(() => {
              const currentLvl = currentCar.upgrades.magnet;
              const cost = getUpgradeCost('magnet', currentLvl);
              const isMax = currentLvl >= UPGRADE_MAX_LEVEL;
              
              return (
                <div className="p-3.5 bg-slate-900/40 border border-slate-800/60 rounded-xl flex items-center justify-between gap-3 shadow-md glass-highlight">
                  <div className="flex-1">
                    <div className="flex justify-between items-center text-xs font-bold font-mono">
                      <span className="text-yellow-400 flex items-center gap-1">🧲 Tanga Tortgich (Magnet)</span>
                      <span className="text-slate-400">Lv {currentLvl}/{UPGRADE_MAX_LEVEL}</span>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      {[1, 2, 3, 4, 5].map((idx) => (
                        <div 
                          key={idx} 
                          className={`flex-1 h-2 rounded-full ${idx <= currentLvl ? 'bg-yellow-500 shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'bg-slate-850'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    {isMax ? (
                      <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">MAKS</span>
                    ) : (
                      <button
                        onClick={() => handleUpgrade('magnet')}
                        disabled={playerMoney < cost}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                          playerMoney >= cost 
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-neutral-950 shadow-md' 
                            : 'bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-850'
                        }`}
                      >
                        Yangilash (${cost})
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

          </div>

        </div>
      )}

    </div>
  );
}
