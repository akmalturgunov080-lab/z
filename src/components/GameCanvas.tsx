import React, { useRef, useEffect, useState } from 'react';
import { Car, Enemy, Coin, HealthPack, Particle, FloatingText, GameStats } from '../types';
import { audioEngine } from './AudioEngine';
import { Volume2, VolumeX, Shield, Zap, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';

interface GameCanvasProps {
  currentCar: Car;
  playerMoney: number;
  onGameOver: (earnedInRun: number, stats: GameStats) => void;
}

export default function GameCanvas({ currentCar, playerMoney, onGameOver }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isVolumeMuted, setIsVolumeMuted] = useState(false);
  const [showControlsHint, setShowControlsHint] = useState(true);

  // Dynamic game stats shown in HUD
  const [hudHealth, setHudHealth] = useState(100);
  const [hudMaxHealth, setHudMaxHealth] = useState(100);
  const [hudCoins, setHudCoins] = useState(0);
  const [hudMegaCoins, setHudMegaCoins] = useState(0);
  const [hudEarnedMoney, setHudEarnedMoney] = useState(0);
  const [hudTime, setHudTime] = useState(0);

  // Keyboard state
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Physics & Arena Config
  const arenaWidth = 2400;
  const arenaHeight = 2400;

  // Real-time states kept in refs for the physics loop to avoid React trigger re-renders
  const gameStateRef = useRef<{
    playerX: number;
    playerY: number;
    playerVx: number;
    playerVy: number;
    playerAngle: number;
    playerHealth: number;
    playerMaxHealth: number;
    coinsCollected: number;
    megaCoinsCollected: number;
    earnedRunMoney: number;
    timeElapsed: number;
    lastTime: number;
    enemies: Enemy[];
    coins: Coin[];
    healthPacks: HealthPack[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    lastSirenTime: number;
    sirenPitchToggle: boolean;
    lastEnemySpawnTime: number;
    lastItemSpawnTime: number;
    activeSirenVolume: number; // visual effect
  }>({
    playerX: arenaWidth / 2,
    playerY: arenaHeight / 2,
    playerVx: 0,
    playerVy: 0,
    playerAngle: 0,
    playerHealth: 100,
    playerMaxHealth: 100,
    coinsCollected: 0,
    megaCoinsCollected: 0,
    earnedRunMoney: 0,
    timeElapsed: 0,
    lastTime: 0,
    enemies: [],
    coins: [],
    healthPacks: [],
    particles: [],
    floatingTexts: [],
    lastSirenTime: 0,
    sirenPitchToggle: false,
    lastEnemySpawnTime: 0,
    lastItemSpawnTime: 0,
    activeSirenVolume: 0,
  });

  // Calculate stats based on car and upgrade level
  const getCarStats = () => {
    // Level multipliers (0 to 5)
    // baseMaxSpeed, baseMaxHealth, baseHandling, baseMagnetRadius
    const speedLvl = currentCar.upgrades.speed;
    const healthLvl = currentCar.upgrades.health;
    const handlingLvl = currentCar.upgrades.handling;
    const magnetLvl = currentCar.upgrades.magnet;

    return {
      maxSpeed: currentCar.baseMaxSpeed * (1 + speedLvl * 0.15),
      maxHealth: currentCar.baseMaxHealth * (1 + healthLvl * 0.20),
      handling: currentCar.baseHandling * (1 + handlingLvl * 0.12),
      magnetRadius: currentCar.baseMagnetRadius * (1 + magnetLvl * 0.35),
    };
  };

  // Mute volume toggle
  const handleToggleVolume = () => {
    const isMuted = audioEngine.toggleMute();
    setIsVolumeMuted(isMuted);
  };

  // Start the Game
  const handleStartGame = () => {
    audioEngine.resume();
    audioEngine.startEngineSound();

    const carStats = getCarStats();
    
    // Reset state
    gameStateRef.current = {
      playerX: arenaWidth / 2,
      playerY: arenaHeight / 2,
      playerVx: 0,
      playerVy: 0,
      playerAngle: -Math.PI / 2,
      playerHealth: carStats.maxHealth,
      playerMaxHealth: carStats.maxHealth,
      coinsCollected: 0,
      megaCoinsCollected: 0,
      earnedRunMoney: 0,
      timeElapsed: 0,
      lastTime: performance.now(),
      enemies: [],
      coins: [],
      healthPacks: [],
      particles: [],
      floatingTexts: [],
      lastSirenTime: 0,
      sirenPitchToggle: false,
      lastEnemySpawnTime: 0,
      lastItemSpawnTime: 0,
      activeSirenVolume: 0,
    };

    // Pre-populate items
    spawnInitialItems();

    setHudHealth(carStats.maxHealth);
    setHudMaxHealth(carStats.maxHealth);
    setHudCoins(0);
    setHudMegaCoins(0);
    setHudEarnedMoney(0);
    setHudTime(0);

    setIsPlaying(true);
    setIsPaused(false);
  };

  const spawnInitialItems = () => {
    const state = gameStateRef.current;
    // Spawn 15 coins
    for (let i = 0; i < 15; i++) {
      spawnCoin(true);
    }
    // Spawn 2 health packs
    for (let i = 0; i < 2; i++) {
      spawnHealthPack();
    }
  };

  const spawnCoin = (allowClose = false) => {
    const state = gameStateRef.current;
    if (state.coins.length > 40) return; // cap coins to prevent lag

    const angle = Math.random() * Math.PI * 2;
    const dist = allowClose ? Math.random() * 800 : 400 + Math.random() * 1000;
    const x = Math.max(80, Math.min(arenaWidth - 80, state.playerX + Math.cos(angle) * dist));
    const y = Math.max(80, Math.min(arenaHeight - 80, state.playerY + Math.sin(angle) * dist));

    // 15% chance to spawn a mega coin ($300)
    const isMega = Math.random() < 0.15;

    state.coins.push({
      id: Math.random().toString(),
      x,
      y,
      isMega,
      value: isMega ? 300 : 100,
      size: isMega ? 14 : 9,
    });
  };

  const spawnHealthPack = () => {
    const state = gameStateRef.current;
    if (state.healthPacks.length > 6) return; // cap

    const angle = Math.random() * Math.PI * 2;
    const dist = 500 + Math.random() * 800;
    const x = Math.max(85, Math.min(arenaWidth - 85, state.playerX + Math.cos(angle) * dist));
    const y = Math.max(85, Math.min(arenaHeight - 85, state.playerY + Math.sin(angle) * dist));

    state.healthPacks.push({
      id: Math.random().toString(),
      x,
      y,
      healAmount: 25,
      size: 10,
    });
  };

  const spawnEnemy = () => {
    const state = gameStateRef.current;
    if (state.enemies.length > 18) return; // caps amount to keep performance high

    const angle = Math.random() * Math.PI * 2;
    const dist = 700 + Math.random() * 300; // spawn off-screen
    const x = Math.max(50, Math.min(arenaWidth - 50, state.playerX + Math.cos(angle) * dist));
    const y = Math.max(50, Math.min(arenaHeight - 50, state.playerY + Math.sin(angle) * dist));

    // Decide type: Chiyaborilar (fast jackal) or Police car or Police armored truck
    const roll = Math.random();
    let type: 'policeman' | 'jackal_fast' | 'police_truck' = 'jackal_fast';
    let color = '#ea580c'; // jackal orange
    let health = 30;
    let speed = 4.2;
    let damage = 12;
    let size = 12;

    if (roll > 0.75) {
      type = 'police_truck';
      color = '#1e293b'; // black tactical truck
      health = 80;
      speed = 3.0;
      damage = 25;
      size = 20;
    } else if (roll > 0.4) {
      type = 'policeman';
      color = '#0284c7'; // police blue
      health = 45;
      speed = 4.8;
      damage = 16;
      size = 17;
    }

    state.enemies.push({
      id: Math.random().toString(),
      type,
      x,
      y,
      vx: 0,
      vy: 0,
      angle: 0,
      health,
      maxHealth: health,
      speed,
      damage,
      color,
      size,
      isRedFlashing: 0,
    });
  };

  const spawnParticles = (x: number, y: number, color: string, count = 8) => {
    const state = gameStateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  };

  const addFloatingText = (x: number, y: number, text: string, color: string) => {
    gameStateRef.current.floatingTexts.push({
      id: Math.random().toString(),
      x,
      y: y - 10,
      text,
      color,
      life: 1.0,
      size: 14 + Math.random() * 4,
    });
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = true;
      
      // Prevent browser default arrow key scrolling & space scrolling
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 's', 'a', 'd', ' '].includes(key)) {
        e.preventDefault();
      }

      if (e.key === 'p' || e.key === 'P') {
        setIsPaused((p) => !p);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      audioEngine.stopEngineSound();
    };
  }, []);

  // Set up volume icons on load
  useEffect(() => {
    setIsVolumeMuted(audioEngine.isMuted());
  }, []);

  // Core Game Loop
  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      if (!isPlaying || isPaused) {
        animId = requestAnimationFrame(tick);
        return;
      }

      const state = gameStateRef.current;
      const dt = Math.min((now - state.lastTime) / 1000, 0.1); // clamp dt to avoid huge jumps
      state.lastTime = now;

      // Update Game Duration Timer
      state.timeElapsed += dt;

      // Controls Processing
      // REQUIRED BINDINGS:
      // W -> Oldinga (Forward / Upwards on top down view)
      // S -> Orqaga (Backward / Downwards on top down view)
      // D -> Chapga (Left / Decreasing X direction)
      // A -> O'ngga (Right / Increasing X direction)
      const moveUp = keysRef.current['w'];
      const moveDown = keysRef.current['s'];
      const moveLeft = keysRef.current['d']; // D goes LEFT
      const moveRight = keysRef.current['a']; // A goes RIGHT

      const carStats = getCarStats();

      // Simple physics: acceleration vector
      let ax = 0;
      let ay = 0;
      const accel = 600 * carStats.handling; // handling scales accelerations and grip

      if (moveUp) ay -= accel;
      if (moveDown) ay += accel;
      if (moveLeft) ax -= accel;
      if (moveRight) ax += accel;

      // Friction / Drag resistance
      const drag = 3.5;
      state.playerVx += (ax - state.playerVx * drag) * dt;
      state.playerVy += (ay - state.playerVy * drag) * dt;

      // Calculate travel speed
      const travelSpeed = Math.sqrt(state.playerVx * state.playerVx + state.playerVy * state.playerVy);
      
      // Clamp player velocity to Max Speed upgrade
      if (travelSpeed > carStats.maxSpeed) {
        state.playerVx = (state.playerVx / travelSpeed) * carStats.maxSpeed;
        state.playerVy = (state.playerVy / travelSpeed) * carStats.maxSpeed;
      }

      // Update position
      state.playerX += state.playerVx * dt;
      state.playerY += state.playerVy * dt;

      // Map Boundaries with bouncing damage
      const halfW = currentCar.size.width / 2;
      const halfH = currentCar.size.height / 2;
      const wallRepulsion = 0.5;

      if (state.playerX < 60) {
        state.playerX = 60;
        state.playerVx = -state.playerVx * wallRepulsion;
        dealPlayerDamage(4);
        spawnParticles(60, state.playerY, '#ef4444', 4);
      } else if (state.playerX > arenaWidth - 60) {
        state.playerX = arenaWidth - 60;
        state.playerVx = -state.playerVx * wallRepulsion;
        dealPlayerDamage(4);
        spawnParticles(arenaWidth - 60, state.playerY, '#ef4444', 4);
      }

      if (state.playerY < 60) {
        state.playerY = 60;
        state.playerVy = -state.playerVy * wallRepulsion;
        dealPlayerDamage(4);
        spawnParticles(state.playerX, 60, '#ef4444', 4);
      } else if (state.playerY > arenaHeight - 60) {
        state.playerY = arenaHeight - 60;
        state.playerVy = -state.playerVy * wallRepulsion;
        dealPlayerDamage(4);
        spawnParticles(state.playerX, arenaHeight - 60, '#ef4444', 4);
      }

      // Rotate car layout towards moving speed vector
      if (Math.abs(state.playerVx) > 5 || Math.abs(state.playerVy) > 5) {
        state.playerAngle = Math.atan2(state.playerVy, state.playerVx);
      }

      // Exhaust particles
      if (travelSpeed > 30 && Math.random() < 0.25) {
        // Find position behind the car
        const angleBehind = state.playerAngle + Math.PI;
        const ex = state.playerX + Math.cos(angleBehind) * (currentCar.size.height / 2);
        const ey = state.playerY + Math.sin(angleBehind) * (currentCar.size.height / 2);
        
        state.particles.push({
          x: ex,
          y: ey,
          vx: Math.cos(angleBehind) * (5 + Math.random() * 20) + (Math.random() - 0.5) * 10,
          vy: Math.sin(angleBehind) * (5 + Math.random() * 20) + (Math.random() - 0.5) * 10,
          life: 0.8,
          color: 'rgba(200, 200, 200, 0.35)',
          size: 2 + Math.random() * 3,
        });
      }

      // Sound Engine update
      audioEngine.updateEngineSound(travelSpeed / carStats.maxSpeed);

      // Periodically spawn enemies (faster spawn rates as run time increases)
      const diffMultiplier = 1 + state.timeElapsed / 30; // double spawn rates every 30s
      const enemySpawnInterval = Math.max(1200, 3500 - (diffMultiplier * 150));
      if (now - state.lastEnemySpawnTime > enemySpawnInterval) {
        spawnEnemy();
        state.lastEnemySpawnTime = now;
      }

      // Periodically spawn items
      if (now - state.lastItemSpawnTime > 3000) {
        spawnCoin(false);
        if (Math.random() < 0.35) {
          spawnHealthPack();
        }
        state.lastItemSpawnTime = now;
      }

      // Intermittent Siren sound trigger when police cars exist in game
      const hasPolice = state.enemies.some(e => e.type === 'policeman' || e.type === 'police_truck');
      if (hasPolice && now - state.lastSirenTime > 1200) {
        state.sirenPitchToggle = !state.sirenPitchToggle;
        audioEngine.playSiren(state.sirenPitchToggle);
        state.lastSirenTime = now;
        state.activeSirenVolume = 1.0;
      }
      if (state.activeSirenVolume > 0) {
        state.activeSirenVolume -= dt * 2;
      }

      // Update Enemies
      for (let i = state.enemies.length - 1; i >= 0; i--) {
        const enemy = state.enemies[i];
        
        // Decay hit blink timer
        if (enemy.isRedFlashing > 0) {
          enemy.isRedFlashing -= dt;
        }

        // Vector pointing to player
        const dx = state.playerX - enemy.x;
        const dy = state.playerY - enemy.y;
        const dist = Math.hypot(dx, dy);

        // Angle pointing towards player
        enemy.angle = Math.atan2(dy, dx);

        // Move enemy towards player
        const evx = Math.cos(enemy.angle) * enemy.speed;
        const evy = Math.sin(enemy.angle) * enemy.speed;

        // Smooth velocity adjustment
        enemy.vx += (evx - enemy.vx) * 2 * dt;
        enemy.vy += (evy - enemy.vy) * 2 * dt;

        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        // Repel from each other to avoid stacking neatly
        for (let j = 0; j < state.enemies.length; j++) {
          if (i === j) continue;
          const other = state.enemies[j];
          const edx = other.x - enemy.x;
          const edy = other.y - enemy.y;
          const edist = Math.hypot(edx, edy);
          const rLimit = enemy.size + other.size + 10;
          if (edist < rLimit && edist > 1) {
            const overlap = rLimit - edist;
            const pushX = (edx / edist) * overlap * 0.15;
            const pushY = (edy / edist) * overlap * 0.15;
            enemy.x -= pushX;
            enemy.y -= pushY;
            other.x += pushX;
            other.y += pushY;
          }
        }

        // Collision Enemy vs Player Car (Damaging or Ramming!)
        const pDist = Math.hypot(state.playerX - enemy.x, state.playerY - enemy.y);
        const colThreshold = enemy.size + Math.max(currentCar.size.width, currentCar.size.height) / 2;

        if (pDist < colThreshold) {
          // If the player is driving fast (e.g. > 150px/s) and they have high upgrades,
          // they can execute a RAM ATTACK!
          // Large heavy vehicles like capture, tahoe, or upgraded BYD do extra ram damage
          const isHeavyCar = ['captiva', 'tahoe', 'byd'].includes(currentCar.id);
          const ramMultiplier = isHeavyCar ? 2.5 : 1.2;
          const speedMultiplier = Math.max(1, travelSpeed / 100);
          
          if (travelSpeed > 130) {
            // Player executes dynamic ram attack!
            const damageToEnemy = Math.floor(15 * speedMultiplier * ramMultiplier);
            enemy.health -= damageToEnemy;
            enemy.isRedFlashing = 0.25;

            // Bounce back enemy violently
            enemy.x -= Math.cos(enemy.angle) * 35;
            enemy.y -= Math.sin(enemy.angle) * 35;

            // Recoil player a tiny bit
            state.playerVx *= -0.2;
            state.playerVy *= -0.2;

            audioEngine.playCrash();
            spawnParticles(enemy.x, enemy.y, '#f97316', 12);
            spawnParticles(enemy.x, enemy.y, '#facc15', 6);
            addFloatingText(enemy.x, enemy.y, `RAM! -${damageToEnemy}`, '#facc15');

            // Take minor damage back
            const damageToPlayer = Math.floor(enemy.damage / (3 + currentCar.upgrades.health));
            dealPlayerDamage(damageToPlayer);
          } else {
            // Normal enemy biting/collision damage
            dealPlayerDamage(enemy.damage * dt);
            // push player slightly to avoid instant overlapping traps
            state.playerX += Math.cos(enemy.angle + Math.PI) * 1.5;
            state.playerY += Math.sin(enemy.angle + Math.PI) * 1.5;
            
            if (Math.random() < 0.10) {
              audioEngine.playCrash();
              spawnParticles(state.playerX, state.playerY, '#ef4444', 4);
            }
          }
        }

        // Check if enemy died
        if (enemy.health <= 0) {
          state.enemies.splice(i, 1);
          // Splendid explosion!
          audioEngine.playCrash();
          spawnParticles(enemy.x, enemy.y, '#ef4444', 15);
          spawnParticles(enemy.x, enemy.y, '#f59e0b', 10);
          
          // Reward money for destroying them
          const killReward = enemy.type === 'police_truck' ? 250 : (enemy.type === 'policeman' ? 150 : 80);
          state.earnedRunMoney += killReward;
          addFloatingText(enemy.x, enemy.y, `SINDIRILDI! +$${killReward}`, '#22c55e');
          
          // Spawn coin on death spot
          state.coins.push({
            id: Math.random().toString(),
            x: enemy.x,
            y: enemy.y,
            isMega: Math.random() < 0.25,
            value: 100,
            size: 9,
          });
          continue;
        }
      }

      // Update Coins and Magnet Attraction Physics
      for (let i = state.coins.length - 1; i >= 0; i--) {
        const coin = state.coins[i];
        const cdx = state.playerX - coin.x;
        const cdy = state.playerY - coin.y;
        const cdist = Math.hypot(cdx, cdy);

        // Is coin in Magnet upgrade radius?
        if (cdist < carStats.magnetRadius) {
          // Attract coin with speeds inversely proportional to distance
          const magnSpeed = 480 * (1 - cdist / carStats.magnetRadius);
          coin.x += (cdx / cdist) * magnSpeed * dt;
          coin.y += (cdy / cdist) * magnSpeed * dt;
        }

        // Collect trigger
        if (cdist < coin.size + 15) {
          if (coin.isMega) {
            state.megaCoinsCollected += 1;
            state.earnedRunMoney += 300;
            audioEngine.playMegaCoin();
            spawnParticles(coin.x, coin.y, '#facc15', 18);
            addFloatingText(coin.x, coin.y, 'MEGA TANGA! +$300', '#facc15');
          } else {
            state.coinsCollected += 1;
            state.earnedRunMoney += 100;
            audioEngine.playCoin();
            spawnParticles(coin.x, coin.y, '#3b82f6', 6);
            addFloatingText(coin.x, coin.y, '+$100', '#22c55e');
          }
          state.coins.splice(i, 1);
        }
      }

      // Update Health Packs
      for (let i = state.healthPacks.length - 1; i >= 0; i--) {
        const pack = state.healthPacks[i];
        const hdx = state.playerX - pack.x;
        const hdy = state.playerY - pack.y;
        const hdist = Math.hypot(hdx, hdy);

        if (hdist < pack.size + 16) {
          state.playerHealth = Math.min(state.playerMaxHealth, state.playerHealth + pack.healAmount);
          audioEngine.playHeal();
          spawnParticles(pack.x, pack.y, '#22c55e', 14);
          addFloatingText(pack.x, pack.y, `Repair +${pack.healAmount} HP`, '#22c55e');
          state.healthPacks.splice(i, 1);
        }
      }

      // Update Smoke/Gold particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt;
        if (p.life <= 0) {
          state.particles.splice(i, 1);
        }
      }

      // Update floating score tags
      for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        const ft = state.floatingTexts[i];
        ft.y -= dt * 45; // float upward
        ft.life -= dt * 1.5; // fade out
        if (ft.life <= 0) {
          state.floatingTexts.splice(i, 1);
        }
      }

      // Sync refs to dynamic HUD state hook setters occasionally (not every render but smooth)
      setHudHealth(Math.max(0, Math.ceil(state.playerHealth)));
      setHudMaxHealth(state.playerMaxHealth);
      setHudCoins(state.coinsCollected);
      setHudMegaCoins(state.megaCoinsCollected);
      setHudEarnedMoney(state.earnedRunMoney);
      setHudTime(Math.floor(state.timeElapsed));

      // Draw everything
      drawScene();

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isPaused, currentCar]);

  // Deal Player Damage
  const dealPlayerDamage = (amount: number) => {
    const state = gameStateRef.current;
    state.playerHealth = Math.max(0, state.playerHealth - amount);

    // If dead, perform GameOver transition
    if (state.playerHealth <= 0) {
      handleGameOver();
    }
  };

  // Perform Game Over
  const handleGameOver = () => {
    setIsPlaying(false);
    audioEngine.stopEngineSound();
    audioEngine.playGameOver();

    // Fire callback
    const s = gameStateRef.current;
    
    // Total score is a function of survived time + coins + mega coins
    const totalScore = Math.floor(s.timeElapsed * 10) + s.coinsCollected * 100 + s.megaCoinsCollected * 300;
    
    onGameOver(s.earnedRunMoney, {
      score: totalScore,
      coinsCollected: s.coinsCollected,
      megaCoinsCollected: s.megaCoinsCollected,
      earnedInRun: s.earnedRunMoney,
      timeSurvived: Math.floor(s.timeElapsed),
    });
  };

  // Canvas Drawing
  const drawScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;
    const width = canvas.width;
    const height = canvas.height;

    // Viewport camera system - smoothly trace position of player's car
    const camX = state.playerX - width / 2;
    const camY = state.playerY - height / 2;

    ctx.clearRect(0, 0, width, height);

    // Context Translation
    ctx.save();
    ctx.translate(-camX, -camY);

    // 1. Draw Ground Base (Night Desert dark sand color)
    ctx.fillStyle = '#11100f';
    ctx.fillRect(0, 0, arenaWidth, arenaHeight);

    // Draw grid tiles for a sense of movement speed
    ctx.strokeStyle = '#1b1a18';
    ctx.lineWidth = 1;
    const gridSize = 120;
    for (let x = 0; x < arenaWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, arenaHeight);
      ctx.stroke();
    }
    for (let y = 0; y < arenaHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(arenaWidth, y);
      ctx.stroke();
    }

    // Draw some stylized desert canyon plants (cactus)
    ctx.fillStyle = '#0f1710';
    const cactuses = [
      { x: 300, y: 400, r: 18 }, { x: 700, y: 1500, r: 24 }, { x: 1800, y: 600, r: 20 },
      { x: 2200, y: 1900, r: 26 }, { x: 1000, y: 900, r: 16 }, { x: 1200, y: 2200, r: 22 },
      { x: 400, y: 1800, r: 25 }, { x: 1600, y: 1200, r: 19 }
    ];
    cactuses.forEach(c => {
      // Cactus main stem
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
      // Cactus arms
      ctx.fillRect(c.x - c.r - 8, c.y - 4, (c.r + 8) * 2, 8);
      ctx.fillRect(c.x - c.r - 8, c.y - 15, 6, 12);
      ctx.fillRect(c.x + c.r + 2, c.y - 15, 6, 12);
    });

    // 2. Draw Sand Barricades (Laser Neon Border)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 12;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 12;
    ctx.strokeRect(55, 55, arenaWidth - 110, arenaHeight - 110);
    ctx.shadowBlur = 0; // reset shadow for performance

    // Barricade warning lights
    ctx.fillStyle = (Math.floor(Date.now() / 300) % 2 === 0) ? '#f87171' : '#7f1d1d';
    for (let x = 100; x < arenaWidth; x += 300) {
      ctx.beginPath();
      ctx.arc(x, 55, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, arenaHeight - 55, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let y = 100; y < arenaHeight; y += 300) {
      ctx.beginPath();
      ctx.arc(55, y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(arenaWidth - 55, y, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Draw Coins
    state.coins.forEach((coin) => {
      ctx.save();
      ctx.translate(coin.x, coin.y);

      // Spin effect based on timestamp
      const angle = (Date.now() / 250) % (Math.PI * 2);
      ctx.rotate(angle);

      if (coin.isMega) {
        // Mega coin drawing - large golden star configuration
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * coin.size, Math.sin((18 + i * 72) * Math.PI / 180) * coin.size);
          ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (coin.size / 2.2), Math.sin((54 + i * 72) * Math.PI / 180) * (coin.size / 2.2));
        }
        ctx.closePath();
        ctx.fill();

        // Inner core
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, coin.size / 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Standard Coin - glowing gold circle with a dynamic dollar sign
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, coin.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#78350f';
        ctx.font = '7px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0.5);
      }
      ctx.restore();
    });

    // 4. Draw Health Packs
    state.healthPacks.forEach((pack) => {
      ctx.save();
      ctx.translate(pack.x, pack.y);

      // Pulsing scaling effect
      const scale = 1 + Math.sin(Date.now() / 150) * 0.12;
      ctx.scale(scale, scale);

      // Heart box background
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, pack.size, 0, Math.PI * 2);
      ctx.fill();

      // Green cross or Red heart outline
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(-pack.size / 1.5, -2, (pack.size / 1.5) * 2, 4);
      ctx.fillRect(-2, -pack.size / 1.5, 4, (pack.size / 1.5) * 2);

      ctx.restore();
    });

    // 5. Draw Enemies (Jackals & Police)
    state.enemies.forEach((enemy) => {
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      ctx.rotate(enemy.angle);

      // Hit feedback
      if (enemy.isRedFlashing > 0) {
        ctx.fillStyle = '#ef4444';
      } else {
        ctx.fillStyle = enemy.color;
      }

      if (enemy.type === 'jackal_fast') {
        // Render predator desert jackal
        // Tail
        ctx.fillStyle = '#7c2d12';
        ctx.fillRect(-20, -2, 10, 4);

        // Body
        ctx.fillStyle = enemy.isRedFlashing > 0 ? '#ef4444' : '#c2410c';
        ctx.beginPath();
        ctx.ellipse(-1, 0, 11, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Moving legs animation
        const runCycle = Math.sin(Date.now() / 60) * 5;
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 3;
        // Front legs
        ctx.beginPath();
        ctx.moveTo(6, 4);
        ctx.lineTo(8 + runCycle, 10);
        ctx.moveTo(6, -4);
        ctx.lineTo(8 - runCycle, -10);
        // Back legs
        ctx.beginPath();
        ctx.moveTo(-6, 4);
        ctx.lineTo(-4 - runCycle, 10);
        ctx.moveTo(-6, -4);
        ctx.lineTo(-4 + runCycle, -10);
        ctx.stroke();

        // Head and Snout
        ctx.fillStyle = '#9a3412';
        ctx.beginPath();
        ctx.arc(10, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(10, -2.5, 7, 5);

        // Ears
        ctx.beginPath();
        ctx.moveTo(8, -4);
        ctx.lineTo(6, -11);
        ctx.lineTo(11, -5);
        ctx.fill();

        // Glowing predator eyes
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(12, -2, 1.5, 0, Math.PI * 2);
        ctx.arc(12, 2, 1.5, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // Draw police vehicles
        const isTruck = enemy.type === 'police_truck';
        const w = isTruck ? 38 : 32;
        const h = isTruck ? 20 : 16;

        // Shadow/wheels
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-w/2 + 3, -h/2 - 2, 6, 2);
        ctx.fillRect(w/2 - 10, -h/2 - 2, 6, 2);
        ctx.fillRect(-w/2 + 3, h/2, 6, 2);
        ctx.fillRect(w/2 - 10, h/2, 6, 2);

        // Main chassis (Sturdy vehicle structure)
        ctx.fillStyle = enemy.isRedFlashing > 0 ? '#ef4444' : (isTruck ? '#0f172a' : '#1e3a8a');
        ctx.fillRect(-w/2, -h/2, w, h);

        // Police branding stripes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, -h/2, 12, h);

        // Cabin windshield
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(2, -h/2 + 2, 6, h - 4);

        // Headlights
        ctx.fillStyle = '#fffbeb';
        ctx.fillRect(w/2 - 1.5, -h/2 + 2, 2, 3);
        ctx.fillRect(w/2 - 1.5, h/2 - 5, 2, 3);

        // Active Red & Blue LED sirens on top
        const flash = Math.floor(Date.now() / 150) % 2 === 0;
        ctx.fillStyle = flash ? '#ef4444' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(-w/4, 0, isTruck ? 5 : 4, 0, Math.PI * 2);
        ctx.fill();

        // Auxiliary warning text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 7px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('902', -w/10, 3);
      }

      ctx.restore();
    });

    // 6. Draw Player's car (Dynamically styled, procedurally detailed)
    ctx.save();
    ctx.translate(state.playerX, state.playerY);
    ctx.rotate(state.playerAngle);

    const pw = currentCar.size.width; 
    const ph = currentCar.size.height;

    // Headlight visual proj light rays in dark desert
    ctx.save();
    ctx.rotate(0);
    const grad = ctx.createRadialGradient(pw / 2, 0, 10, pw / 2 + 180, 0, 120);
    grad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
    grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = grad;
    
    // Left headlight projection
    ctx.beginPath();
    ctx.moveTo(pw / 2 - 3, -ph / 4);
    ctx.lineTo(pw / 2 + 220, -ph / 1.2);
    ctx.lineTo(pw / 2 + 220, ph / 5);
    ctx.closePath();
    ctx.fill();

    // Right headlight projection
    ctx.beginPath();
    ctx.moveTo(pw / 2 - 3, ph / 4);
    ctx.lineTo(pw / 2 + 220, -ph / 5);
    ctx.lineTo(pw / 2 + 220, ph / 1.2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Wheels
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-pw/2 + 5, -ph/2 - 3, 9, 3);
    ctx.fillRect(pw/2 - 14, -ph/2 - 3, 9, 3);
    ctx.fillRect(-pw/2 + 5, ph/2, 9, 3);
    ctx.fillRect(pw/2 - 14, ph/2, 9, 3);

    // Car base body with dynamic colors based on selection
    ctx.fillStyle = currentCar.color;
    
    // Draw rounded rectangular chassis
    const rad = 5;
    ctx.beginPath();
    ctx.moveTo(-pw/2 + rad, -ph/2);
    ctx.lineTo(pw/2 - rad, -ph/2);
    ctx.quadraticCurveTo(pw/2, -ph/2, pw/2, -ph/2 + rad);
    ctx.lineTo(pw/2, ph/2 - rad);
    ctx.quadraticCurveTo(pw/2, ph/2, pw/2 - rad, ph/2);
    ctx.lineTo(-pw/2 + rad, ph/2);
    ctx.quadraticCurveTo(-pw/2, ph/2, -pw/2, ph/2 - rad);
    ctx.lineTo(-pw/2, -ph/2 + rad);
    ctx.quadraticCurveTo(-pw/2, -ph/2, -pw/2 + rad, -ph/2);
    ctx.closePath();
    ctx.fill();

    // Side metal highlights
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Sunroof or black roof overlay
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-pw/4, -ph/3, pw/1.6, ph/1.5);

    // Glass windshield (Front pointing right in positive rotational heading)
    ctx.fillStyle = '#64748b';
    ctx.fillRect(pw/7, -ph/3.5, pw/5, ph/1.8);

    // Rear window
    ctx.fillStyle = '#475569';
    ctx.fillRect(-pw/3, -ph/3.5, pw/7, ph/1.8);

    // Headlights (glow spots on body)
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(pw/2 - 2, -ph/3.2, 2.5, 4);
    ctx.fillRect(pw/2 - 2, ph/3.2 - 4, 2.5, 4);

    // Tail light bars
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-pw/2, -ph/3, 2, 4);
    ctx.fillRect(-pw/2, ph/3 - 4, 2, 4);

    // Dynamic brand acronym indicator (Damas, Cobalt, BYD...)
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.rotate(0);
    ctx.fillText(currentCar.name.split(' ')[0], -2, 0);
    ctx.restore();

    ctx.restore();

    // 7. Draw Sparks/Smoke Particles
    state.particles.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    });

    // 8. Draw Floating Reward & Damage labels
    state.floatingTexts.forEach((ft) => {
      ctx.fillStyle = ft.color;
      ctx.font = `bold ${ft.size}px sans-serif`;
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.shadowBlur = 0;
    });

    // Active Police Ambient Siren Overlay (red/blue flashes over screen edge for drama!)
    if (state.activeSirenVolume > 0) {
      const isRed = state.sirenPitchToggle;
      ctx.fillStyle = isRed ? `rgba(239, 68, 68, ${state.activeSirenVolume * 0.08})` : `rgba(59, 130, 246, ${state.activeSirenVolume * 0.08})`;
      ctx.fillRect(-1000, -1000, arenaWidth + 2000, arenaHeight + 2000);
    }

    ctx.restore();
  };

  // Keep Canvas aspect ratio full screen inside container
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.clientWidth;
      canvas.height = Math.min(600, window.innerHeight - 250);
      drawScene();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isPlaying]);

  return (
    <div id="game-container" ref={containerRef} className="w-full relative flex flex-col items-center select-none bg-neutral-950 rounded-2xl border border-neutral-800 p-2 overflow-hidden shadow-2xl">
      
      {/* Title & Static Top Controls Panel */}
      <div className="w-full flex justify-between items-center px-4 py-2 border-b border-neutral-800 bg-neutral-900/60 rounded-t-xl z-20">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <h2 className="text-white font-mono text-sm uppercase tracking-wider font-semibold">
            {currentCar.name} quvlagichi
          </h2>
        </div>

        {/* Buttons Panel */}
        <div className="flex items-center gap-2">
          {/* Volume toggle */}
          <button 
            onClick={handleToggleVolume} 
            className="p-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-400 hover:text-white transition duration-250 cursor-pointer"
            title="Ovozlarni yoqish/o'chirish"
          >
            {isVolumeMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Controls instructions toggle */}
          <button 
            onClick={() => setShowControlsHint(prev => !prev)}
            className={`font-mono text-xs px-2.5 py-1 rounded-lg border transition ${showControlsHint ? 'border-amber-500/50 bg-amber-500/10 text-amber-300' : 'border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white'} cursor-pointer`}
          >
            Boshqaruv {showControlsHint ? "O'chirish" : "Ko'rish"}
          </button>
        </div>
      </div>

      {/* Main Field (Menu or Canvas) */}
      <div className="w-full relative flex items-center justify-center bg-neutral-900/40">
        {!isPlaying ? (
          /* Start Screen */
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-neutral-950/90 p-6 text-center rounded-b-xl min-h-[450px]">
            <div className="max-w-md flex flex-col items-center">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg mb-4 animate-pulse"
                style={{ backgroundColor: currentCar.color }}
              >
                <span className="text-white text-3xl font-mono font-bold">
                  {currentCar.name.charAt(0)}
                </span>
              </div>

              <h1 className="text-yellow-500 font-extrabold text-2xl uppercase tracking-tight mb-2">
                Chiyabori va Politsiyadan escapes!
              </h1>
              
              <p className="text-neutral-400 text-xs mb-6 px-4">
                Sizning <span className="text-white font-semibold">{currentCar.name}</span> mashinangiz tayyor. Politsiyachilar va Chiyaborilar quvlaydi, tangalarni yig'ib uzoqroq yashang!
              </p>

              <div className="grid grid-cols-2 gap-3 text-left w-full max-w-sm mb-6 bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-xl font-mono text-xs">
                <div className="text-neutral-500">Maksimal Tezlik:</div>
                <div className="text-white font-semibold text-right">
                  {Math.round(getCarStats().maxSpeed)} km/s
                </div>
                <div className="text-neutral-500">Zarba Bardoshi (HP):</div>
                <div className="text-white font-semibold text-right">
                  {Math.round(getCarStats().maxHealth)} HP
                </div>
                <div className="text-neutral-500">Boshqaruv Chegarasi:</div>
                <div className="text-white font-semibold text-right">
                  {Math.round(getCarStats().handling * 100)}%
                </div>
                <div className="text-neutral-500">Tanga Tortgich (Magnet):</div>
                <div className="text-white font-semibold text-right text-yellow-400 animate-pulse">
                  {Math.round(getCarStats().magnetRadius)} metr
                </div>
              </div>

              {/* Strict explicit Inverted instruction in Uzbek */}
              <div className="w-full max-w-sm border border-neutral-800 bg-neutral-950/80 p-3 rounded-lg text-left font-mono text-xs mb-6 select-none">
                <div className="text-amber-500 text-center font-bold mb-1.5 uppercase">
                  ⚠️ Maxsus Boshqaruv (Inverted)
                </div>
                <div className="grid grid-cols-2 gap-1 text-neutral-300">
                  <div>⬆️ W: <span className="text-white font-semibold">OLDINGA</span></div>
                  <div>⬇️ S: <span className="text-white font-semibold">ORQAGA</span></div>
                  <div>⬅️ D: <span className="text-white font-semibold">CHAPGA (Left)</span></div>
                  <div>➡️ A: <span className="text-white font-semibold">O'NGGA (Right)</span></div>
                </div>
              </div>

              <button
                onClick={handleStartGame}
                className="w-full max-w-sm py-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-350 hover:to-amber-450 active:scale-95 text-neutral-950 font-extrabold uppercase rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.25)] hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] transition-all duration-155 cursor-pointer text-sm font-sans tracking-wide glow-yellow"
              >
                Gazni Bos! (Start Game)
              </button>
            </div>
          </div>
        ) : (
          /* Active Gameplay Canvas HUD Overlay */
          <>
            {isPaused && (
              <div className="absolute inset-0 z-30 bg-slate-950/85 flex flex-col items-center justify-center p-4">
                <h3 className="text-white font-sans uppercase tracking-widest text-lg font-bold glow-yellow">O'yin To'xtatildi</h3>
                <p className="text-slate-400 text-xs mt-1 mb-4 font-mono">Davom etish uchun 'P' tugmasini bosing</p>
                <button 
                  onClick={() => setIsPaused(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-350 hover:to-amber-450 text-neutral-950 font-mono text-xs font-bold rounded-lg transition-all scale-102 shadow-md cursor-pointer"
                >
                  Davom etish
                </button>
              </div>
            )}

            {/* In-Game Heads-Up-Display */}
            <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none select-none">
              
              {/* Left Column: Health and Score */}
              <div className="flex flex-col gap-2.5 max-w-xs md:max-w-sm">
                
                {/* Health Bar */}
                <div className="flex flex-col gap-1.5 px-4 py-2.5 rounded-xl glass-highlight border border-slate-800/85 backdrop-blur-md shadow-lg">
                  <div className="flex justify-between items-center w-full font-mono text-[10px] text-slate-300 gap-6">
                    <span className="flex items-center gap-1">
                      <Shield size={10} className="text-emerald-400 fill-emerald-400" />
                      Mashina Sohuti:
                    </span>
                    <span className="text-white font-extrabold">{hudHealth} / {hudMaxHealth} HP</span>
                  </div>
                  <div className="w-36 h-2 bg-slate-900 border border-slate-800/40 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-100 ${hudHealth < hudMaxHealth * 0.35 ? 'bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`}
                      style={{ width: `${Math.min(100, (hudHealth / hudMaxHealth) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Score Stats / Survived time */}
                <div className="px-4 py-2 rounded-xl glass border border-slate-800/80 backdrop-blur-md shadow-lg font-mono text-[10px] text-slate-300 flex items-center gap-2">
                  <span className="text-white font-semibold">Tirik qoldingiz:</span>
                  <span className="text-emerald-400 font-bold text-xs">{hudTime} soniya</span>
                </div>
              </div>

              {/* Right Column: Coin count and active run balance */}
              <div className="flex flex-col items-end gap-2.5">
                {/* Cash Counter */}
                <div className="px-4 py-2.5 rounded-xl glass-highlight border border-yellow-400/30 backdrop-blur-md shadow-lg text-right">
                  <div className="font-mono text-[9px] text-yellow-400 tracking-widest font-bold">DAROMAD (RUN)</div>
                  <div className="text-yellow-400 text-xl font-mono font-black animate-pulse glow-yellow mt-0.5">
                    ${hudEarnedMoney}
                  </div>
                </div>

                {/* Tangalar Breakdown */}
                <div className="flex gap-2 font-mono text-[10px] text-slate-300 bg-slate-950/80 border border-slate-800/80 px-3.5 py-1.5 rounded-xl shadow-md">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full border border-yellow-500 shadow-[0_0_4px_rgba(250,204,21,0.6)]" />
                    Tanga: <span className="text-white font-bold">{hudCoins}</span>
                  </div>
                  <div className="w-px bg-slate-800 h-3" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full border border-amber-500 animate-bounce shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                    Mega: <span className="text-yellow-400 font-bold">{hudMegaCoins}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Inverted Control Banner helper overlay inside the screen */}
            {showControlsHint && (
              <div className="absolute bottom-4 left-4 right-4 pointer-events-none select-none z-20 flex justify-center">
                <div className="px-4 py-2.5 glass border border-slate-800/90 rounded-xl max-w-md w-full backdrop-blur-md flex justify-between gap-1 font-mono text-[10px] text-slate-200 shadow-xl">
                  <div>🟢 <span className="text-white font-extrabold bg-slate-900 border border-slate-700 px-1 rounded">W:</span> Oldinga</div>
                  <div>🔴 <span className="text-white font-extrabold bg-slate-900 border border-slate-700 px-1 rounded">S:</span> Orqaga</div>
                  <div>🔵 <span className="text-white font-extrabold bg-slate-900 border border-slate-700 px-1 rounded">D:</span> Chapga</div>
                  <div>🟡 <span className="text-white font-extrabold bg-slate-900 border border-slate-700 px-1 rounded">A:</span> O'ngga</div>
                  <div className="text-yellow-400 font-bold animate-pulse">Ram qilganda $ yuting!</div>
                </div>
              </div>
            )}
          </>
        )}

        <canvas 
          ref={canvasRef} 
          className="w-full h-full bg-slate-950 cursor-crosshair rounded-b-xl min-h-[450px]"
        />
      </div>

      {/* Sub header statistics */}
      <div className="w-full flex justify-between p-3 border-t border-slate-900/80 bg-slate-950/70 font-mono text-[11px] text-slate-400">
        <div>Xaritada: 2400m x 2400m cho'l hududi</div>
        <div className="flex items-center gap-1">
          <AlertTriangle size={12} className="text-amber-500" />
          <span>Politsiyachini Ram qilish qo'shimcha bonus pul beradi!</span>
        </div>
      </div>
    </div>
  );
}
