import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Sparkles, Navigation, Award, AlertTriangle, Cpu, Info, Sliders, Zap } from 'lucide-react';
import { sound } from '../utils/sound';

interface Car {
  x: number;
  y: number;
  angle: number; // in radians
  speed: number;
  alive: boolean;
  score: number;
  speedRewardAccum: number;
  directionRewardAccum: number;
  collisionPenaltyAccum: number;
  checkpointIdx: number;
  weights: number[][]; // Neural network weights: 5 inputs -> 4 hidden -> 2 outputs (steer, accel)
}

interface Checkpoint {
  x: number;
  y: number;
  dirX: number;
  dirY: number;
}

export const SelfDrivingSim: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [generation, setGeneration] = useState<number>(1);
  const [bestScore, setBestScore] = useState<number>(0);
  const [crashes, setCrashes] = useState<number>(0);

  // User-controlled Reward Function Weights
  const [speedWeight, setSpeedWeight] = useState<number>(2.0); // Reward for high speed
  const [directionWeight, setDirectionWeight] = useState<number>(3.0); // Positive = correct direction, Negative = wrong direction
  const [collisionPenalty, setCollisionPenalty] = useState<number>(50.0); // Penalty for wall hit
  const [trackType, setTrackType] = useState<'oval' | 'scurve' | 'figure8' | 'zigzag'>('oval');

  // Track Wall Definitions (Inner and Outer Polygons)
  const getTrackPolygon = (type: string) => {
    if (type === 'figure8') {
      return {
        outer: [
          { x: 50, y: 50 },
          { x: 280, y: 50 },
          { x: 320, y: 150 },
          { x: 550, y: 50 },
          { x: 550, y: 350 },
          { x: 320, y: 250 },
          { x: 280, y: 350 },
          { x: 50, y: 350 },
          { x: 50, y: 50 },
        ],
        inner: [
          { x: 130, y: 130 },
          { x: 220, y: 130 },
          { x: 220, y: 270 },
          { x: 130, y: 270 },
          { x: 130, y: 130 },
        ],
        checkpoints: [
          { x: 150, y: 90, dirX: 1, dirY: 0 },
          { x: 300, y: 100, dirX: 1, dirY: 0.5 },
          { x: 450, y: 90, dirX: 1, dirY: 0 },
          { x: 500, y: 200, dirX: 0, dirY: 1 },
          { x: 450, y: 310, dirX: -1, dirY: 0 },
          { x: 300, y: 300, dirX: -1, dirY: -0.5 },
          { x: 150, y: 310, dirX: -1, dirY: 0 },
          { x: 90, y: 200, dirX: 0, dirY: -1 },
        ],
      };
    }

    if (type === 'zigzag') {
      return {
        outer: [
          { x: 40, y: 40 },
          { x: 560, y: 40 },
          { x: 560, y: 130 },
          { x: 140, y: 170 },
          { x: 560, y: 230 },
          { x: 560, y: 360 },
          { x: 40, y: 360 },
          { x: 40, y: 40 },
        ],
        inner: [
          { x: 140, y: 90 },
          { x: 460, y: 90 },
          { x: 220, y: 200 },
          { x: 460, y: 300 },
          { x: 140, y: 300 },
          { x: 140, y: 90 },
        ],
        checkpoints: [
          { x: 200, y: 65, dirX: 1, dirY: 0 },
          { x: 450, y: 65, dirX: 1, dirY: 0 },
          { x: 350, y: 150, dirX: -1, dirY: 0.3 },
          { x: 150, y: 200, dirX: 1, dirY: 0.3 },
          { x: 350, y: 260, dirX: 1, dirY: 0.3 },
          { x: 450, y: 330, dirX: -1, dirY: 0 },
          { x: 200, y: 330, dirX: -1, dirY: 0 },
          { x: 80, y: 200, dirX: 0, dirY: -1 },
        ],
      };
    }

    if (type === 'scurve') {
      return {
        outer: [
          { x: 50, y: 50 },
          { x: 350, y: 50 },
          { x: 550, y: 150 },
          { x: 550, y: 350 },
          { x: 350, y: 350 },
          { x: 50, y: 350 },
          { x: 50, y: 50 },
        ],
        inner: [
          { x: 150, y: 130 },
          { x: 300, y: 130 },
          { x: 450, y: 200 },
          { x: 450, y: 270 },
          { x: 300, y: 270 },
          { x: 150, y: 270 },
          { x: 150, y: 130 },
        ],
        checkpoints: [
          { x: 100, y: 90, dirX: 1, dirY: 0 },
          { x: 250, y: 90, dirX: 1, dirY: 0 },
          { x: 400, y: 100, dirX: 1, dirY: 0.5 },
          { x: 500, y: 250, dirX: 0, dirY: 1 },
          { x: 380, y: 310, dirX: -1, dirY: 0 },
          { x: 200, y: 310, dirX: -1, dirY: 0 },
          { x: 100, y: 200, dirX: 0, dirY: -1 },
        ],
      };
    }

    // Default Oval
    return {
      outer: [
        { x: 60, y: 60 },
        { x: 540, y: 60 },
        { x: 540, y: 340 },
        { x: 60, y: 340 },
        { x: 60, y: 60 },
      ],
      inner: [
        { x: 180, y: 150 },
        { x: 420, y: 150 },
        { x: 420, y: 250 },
        { x: 180, y: 250 },
        { x: 180, y: 150 },
      ],
      checkpoints: [
        { x: 300, y: 105, dirX: 1, dirY: 0 },
        { x: 480, y: 105, dirX: 1, dirY: 0 },
        { x: 480, y: 200, dirX: 0, dirY: 1 },
        { x: 480, y: 295, dirX: -1, dirY: 0 },
        { x: 300, y: 295, dirX: -1, dirY: 0 },
        { x: 120, y: 295, dirX: -1, dirY: 0 },
        { x: 120, y: 200, dirX: 0, dirY: -1 },
        { x: 120, y: 105, dirX: 1, dirY: 0 },
      ],
    };
  };

  // Helper: Create random neural network weights
  const createRandomWeights = (): number[][] => {
    // Layer 1: 5 inputs (sensors) -> 6 hidden
    const w1 = Array.from({ length: 5 }, () =>
      Array.from({ length: 6 }, () => (Math.random() - 0.5) * 2)
    );
    // Layer 2: 6 hidden -> 2 outputs (steering, accel)
    const w2 = Array.from({ length: 6 }, () =>
      Array.from({ length: 2 }, () => (Math.random() - 0.5) * 2)
    );
    return [...w1, ...w2];
  };

  // Mutate weights for genetic evolution
  const mutateWeights = (parentWeights: number[][]): number[][] => {
    return parentWeights.map((row) =>
      row.map((w) => (Math.random() < 0.15 ? w + (Math.random() - 0.5) * 0.8 : w))
    );
  };

  // Population state (10 cars)
  const POP_SIZE = 10;
  const carsRef = useRef<Car[]>([]);

  // Initialize Population
  const initPopulation = () => {
    const track = getTrackPolygon(trackType);
    const startPoint = track.checkpoints[0];

    carsRef.current = Array.from({ length: POP_SIZE }, () => ({
      x: startPoint.x,
      y: startPoint.y,
      angle: 0,
      speed: 2,
      alive: true,
      score: 0,
      speedRewardAccum: 0,
      directionRewardAccum: 0,
      collisionPenaltyAccum: 0,
      checkpointIdx: 0,
      weights: createRandomWeights(),
    }));
  };

  useEffect(() => {
    initPopulation();
  }, [trackType]);

  // Line segment intersection for LIDAR Raycasts & Wall collision
  const getLineIntersection = (
    p0_x: number, p0_y: number, p1_x: number, p1_y: number,
    p2_x: number, p2_y: number, p3_x: number, p3_y: number
  ) => {
    const s1_x = p1_x - p0_x;
    const s1_y = p1_y - p0_y;
    const s2_x = p3_x - p2_x;
    const s2_y = p3_y - p2_y;

    const s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    const t = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
      return { x: p0_x + t * s1_x, y: p0_y + t * s1_y, dist: t };
    }
    return null;
  };

  // Main Physics & Neural Feedforward Loop
  const updateAndDraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const track = getTrackPolygon(trackType);

    // Draw Track Surface
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Outer Track Boundary
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    track.outer.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // Draw Inner Track Boundary
    ctx.strokeStyle = '#F43F5E';
    ctx.lineWidth = 4;
    ctx.beginPath();
    track.inner.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // Draw Checkpoint Vectors
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    track.checkpoints.forEach((cp) => {
      ctx.beginPath();
      ctx.moveTo(cp.x, cp.y);
      ctx.lineTo(cp.x + cp.dirX * 20, cp.y + cp.dirY * 20);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    let anyCarAlive = false;

    // Process each car in population
    carsRef.current.forEach((car) => {
      if (!car.alive) return;
      anyCarAlive = true;

      // 1. Cast 5 LIDAR Sensors (-60°, -30°, 0°, +30°, +60°)
      const sensorAngles = [-1.0, -0.5, 0, 0.5, 1.0];
      const sensorDistances: number[] = [];

      sensorAngles.forEach((sa) => {
        const rayAngle = car.angle + sa;
        const maxDist = 180;
        const rayEndX = car.x + Math.cos(rayAngle) * maxDist;
        const rayEndY = car.y + Math.sin(rayAngle) * maxDist;

        let closestDist = maxDist;

        // Check intersection with outer walls
        for (let i = 0; i < track.outer.length - 1; i++) {
          const hit = getLineIntersection(
            car.x, car.y, rayEndX, rayEndY,
            track.outer[i].x, track.outer[i].y, track.outer[i + 1].x, track.outer[i + 1].y
          );
          if (hit && hit.dist * maxDist < closestDist) closestDist = hit.dist * maxDist;
        }

        // Check intersection with inner walls
        for (let i = 0; i < track.inner.length - 1; i++) {
          const hit = getLineIntersection(
            car.x, car.y, rayEndX, rayEndY,
            track.inner[i].x, track.inner[i].y, track.inner[i + 1].x, track.inner[i + 1].y
          );
          if (hit && hit.dist * maxDist < closestDist) closestDist = hit.dist * maxDist;
        }

        sensorDistances.push(closestDist);

        // Draw Sensor Ray
        ctx.strokeStyle = closestDist < 30 ? 'rgba(244,63,94,0.6)' : 'rgba(16,185,129,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(car.x, car.y);
        ctx.lineTo(car.x + Math.cos(rayAngle) * closestDist, car.y + Math.sin(rayAngle) * closestDist);
        ctx.stroke();
      });

      // Wall Collision Check (Car radius ~10px)
      const minSensor = Math.min(...sensorDistances);
      if (minSensor < 12) {
        car.alive = false;
        car.score -= collisionPenalty;
        car.collisionPenaltyAccum += collisionPenalty;
        setCrashes((c) => c + 1);
        return;
      }

      // 2. Neural Feedforward Neural Net
      // Inputs: 5 sensor distances normalized to [0, 1]
      const inputs = sensorDistances.map((d) => d / 180);

      // Simple matrix mult: steering = sum(inputs * weights)
      let steerVal = 0;
      let accelVal = 0;
      for (let i = 0; i < 5; i++) {
        steerVal += inputs[i] * car.weights[i][0];
        accelVal += inputs[i] * car.weights[i][1];
      }

      // 3. Update Car Position
      const steerAngle = Math.tanh(steerVal) * 0.12; // [-0.12, +0.12] rad
      car.angle += steerAngle;

      const accel = Math.tanh(accelVal) * 0.2;
      car.speed = Math.max(0.8, Math.min(5.0, car.speed + accel));

      const velX = Math.cos(car.angle) * car.speed;
      const velY = Math.sin(car.angle) * car.speed;

      car.x += velX;
      car.y += velY;

      // 4. Calculate Rewards based on user parameters!
      // Direction Reward: Cosine of angle between velocity and checkpoint direction
      const currentCp = track.checkpoints[car.checkpointIdx % track.checkpoints.length];
      const normVelX = velX / car.speed;
      const normVelY = velY / car.speed;
      
      // Dot product = cos(theta) -> +1 if driving correct way, -1 if driving backwards!
      const dirAlignment = normVelX * currentCp.dirX + normVelY * currentCp.dirY;

      const frameSpeedReward = car.speed * speedWeight * 0.1;
      const frameDirReward = dirAlignment * directionWeight * 0.2; // Positive for correct direction, negative for wrong!

      car.speedRewardAccum += frameSpeedReward;
      car.directionRewardAccum += frameDirReward;
      car.score += frameSpeedReward + frameDirReward;

      // Checkpoint advance
      const distToCp = Math.hypot(car.x - currentCp.x, car.y - currentCp.y);
      if (distToCp < 50) {
        car.checkpointIdx += 1;
        car.score += 20; // Checkpoint bonus
      }

      // Draw Car
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.angle);
      ctx.fillStyle = '#6366F1';
      ctx.fillRect(-10, -6, 20, 12);
      ctx.fillStyle = '#F59E0B'; // Headlights
      ctx.fillRect(8, -5, 3, 3);
      ctx.fillRect(8, 2, 3, 3);
      ctx.restore();
    });

    // Check if generation ended (all cars dead)
    if (!anyCarAlive && isRunning) {
      evolveGeneration();
    }
  };

  // Evolve Genetic Algorithm to next Generation
  const evolveGeneration = () => {
    // Sort cars by score
    const sorted = [...carsRef.current].sort((a, b) => b.score - a.score);
    const topParent = sorted[0];

    if (topParent.score > bestScore) {
      setBestScore(Math.round(topParent.score));
    }

    const track = getTrackPolygon(trackType);
    const startPoint = track.checkpoints[0];

    // Create new mutated generation from top 2 parent weights
    carsRef.current = Array.from({ length: POP_SIZE }, (_, idx) => {
      const parent = sorted[idx % 2]; // Pick from top 2
      return {
        x: startPoint.x,
        y: startPoint.y,
        angle: 0,
        speed: 2,
        alive: true,
        score: 0,
        speedRewardAccum: 0,
        directionRewardAccum: 0,
        collisionPenaltyAccum: 0,
        checkpointIdx: 0,
        weights: idx === 0 ? parent.weights : mutateWeights(parent.weights), // Elite parent stays unchanged
      };
    });

    setGeneration((g) => g + 1);
    sound.playSuccess();
  };

  // Fast Train 5 Generations
  const handleFastTrain = () => {
    for (let i = 0; i < 5; i++) {
      evolveGeneration();
    }
  };

  // Canvas Animation Frame Loop
  useEffect(() => {
    let animId: number;
    const render = () => {
      if (isRunning) {
        updateAndDraw();
      }
      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [isRunning, speedWeight, directionWeight, collisionPenalty, trackType]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-300 text-slate-900 text-xs font-black uppercase tracking-wider">
            <Navigation className="w-3.5 h-3.5" />
            <span>Lesson 5: Autonomous Driving AI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Teach a Self-Driving AI with Reward Functions
          </h1>
          <p className="text-teal-100 text-sm sm:text-base font-medium leading-relaxed">
            Reinforcement Learning AI doesn't know how to drive at first. It learns by maximizing a <strong>Reward Function ($R$)</strong>. Tune the speed bonus, direction alignment reward, and collision penalties to guide the AI to drive around curves smoothly!
          </p>
        </div>
      </div>

      {/* Main Simulator & Parameter Tuning Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive 2D Canvas Track (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-black text-slate-900 text-base uppercase">2D Track LIDAR Simulation</h2>
              <p className="text-xs text-slate-500 font-medium">5 Sensor Distance Rays → Neural Net → Steering Angle</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={trackType}
                onChange={(e) => setTrackType(e.target.value as any)}
                className="text-xs font-bold bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 outline-hidden cursor-pointer"
              >
                <option value="oval">Oval Circuit</option>
                <option value="scurve">Hairpin S-Curve</option>
                <option value="figure8">Figure-8 Crossover</option>
                <option value="zigzag">Mountain Slalom</option>
              </select>

              <button
                onClick={() => {
                  initPopulation();
                  setGeneration(1);
                  setBestScore(0);
                  setCrashes(0);
                  sound.playPulse(440, 0.05);
                }}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                title="Reset Simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full h-auto block"
            />
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                setIsRunning(!isRunning);
                sound.playPulse(isRunning ? 300 : 600, 0.05);
              }}
              className={`flex-1 py-3 font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 text-white shadow-xs ${
                isRunning ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Pause Driving' : 'Start AI Driver Loop'}
            </button>

            <button
              onClick={handleFastTrain}
              className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              Evolve 5 Generations
            </button>
          </div>
        </div>

        {/* Right Column: Reward Function Tuning & Live Telemetry (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              Reward Function Parameters
            </h3>
            <p className="text-xs text-slate-500 font-medium">Control what the AI considers "good" vs "bad" driving behavior.</p>
          </div>

          {/* Slider 1: Speed Reward Weight */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900">1. Speed Bonus Weight (w_speed)</span>
              <span className="font-mono font-black text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded-md">
                +{speedWeight.toFixed(1)}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">Higher values encourage the AI to drive faster around the track.</p>
            <input
              type="range"
              min="0.0"
              max="10.0"
              step="0.5"
              value={speedWeight}
              onChange={(e) => setSpeedWeight(parseFloat(e.target.value))}
              className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Slider 2: Direction Alignment Weight */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900">2. Direction Bonus Weight (w_direction)</span>
              <span className="font-mono font-black text-indigo-800 bg-indigo-200 px-2 py-0.5 rounded-md">
                +{directionWeight.toFixed(1)}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Positive: Rewards driving forward along track direction (cos θ &gt; 0). Negative: Penalizes driving backwards!
            </p>
            <input
              type="range"
              min="-5.0"
              max="10.0"
              step="0.5"
              value={directionWeight}
              onChange={(e) => setDirectionWeight(parseFloat(e.target.value))}
              className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Slider 3: Wall Collision Penalty */}
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900">3. Collision Wall Penalty (w_collision)</span>
              <span className="font-mono font-black text-rose-800 bg-rose-200 px-2 py-0.5 rounded-md">
                -{collisionPenalty.toFixed(0)}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">Heavy score deduction when raycasts detect wall contact.</p>
            <input
              type="range"
              min="0"
              max="200"
              step="10"
              value={collisionPenalty}
              onChange={(e) => setCollisionPenalty(parseFloat(e.target.value))}
              className="w-full h-2 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
          </div>

          {/* Live Telemetry Scoreboard */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Generation Epoch:</span>
              <span className="text-amber-300 font-black">Gen {generation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Highest Fitness Score:</span>
              <span className="text-emerald-400 font-black">{bestScore} pts</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-1">
              <span className="text-slate-400">Total Crashes:</span>
              <span className="text-rose-400 font-black">{crashes}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
