import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ActivationType, DatasetPreset, Point2D, NetworkTopology } from '../types';
import { NeuralNetwork, generateDataset } from '../utils/nnEngine';
import { sound } from '../utils/sound';
import { Play, Pause, RotateCcw, FastForward, Sliders, Layers, Sparkles, PlusCircle, HelpCircle } from 'lucide-react';

interface TrainingPlaygroundProps {
  initialPreset?: DatasetPreset;
  initialTopology?: NetworkTopology;
  initialLR?: number;
  initialActivation?: ActivationType;
  onTargetReached?: (accuracy: number) => void;
}

export const TrainingPlayground: React.FC<TrainingPlaygroundProps> = ({
  initialPreset = 'xor',
  initialTopology = { inputSize: 2, hiddenLayers: [4, 2], outputSize: 1 },
  initialLR = 0.08,
  initialActivation = 'tanh',
  onTargetReached,
}) => {
  // Dataset state
  const [preset, setPreset] = useState<DatasetPreset>(initialPreset as DatasetPreset);
  const [points, setPoints] = useState<Point2D[]>(() => generateDataset(initialPreset as DatasetPreset));
  const [selectedClassForDraw, setSelectedClassForDraw] = useState<number>(1);

  // Network topology & hyper-parameters
  const [hiddenLayers, setHiddenLayers] = useState<number[]>(initialTopology.hiddenLayers);
  const [activation, setActivation] = useState<ActivationType>(initialActivation as ActivationType);
  const [learningRate, setLearningRate] = useState<number>(initialLR);

  // Training state
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [epoch, setEpoch] = useState<number>(0);
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [accuracyHistory, setAccuracyHistory] = useState<number[]>([]);
  const [currentLoss, setCurrentLoss] = useState<number>(0.5);
  const [currentAccuracy, setCurrentAccuracy] = useState<number>(50);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Create Neural Network instance
  const [net, setNet] = useState<NeuralNetwork>(() => {
    return new NeuralNetwork({ inputSize: 2, hiddenLayers: initialTopology.hiddenLayers, outputSize: 1 }, initialActivation as ActivationType);
  });

  // Reset network & dataset
  const resetNetwork = useCallback((newPreset?: DatasetPreset) => {
    setIsTraining(false);
    setEpoch(0);
    setLossHistory([]);
    setAccuracyHistory([]);
    setCurrentLoss(0.5);
    setCurrentAccuracy(50);

    const activePreset = newPreset || preset;
    if (newPreset) setPreset(newPreset);
    if (activePreset !== 'custom') {
      setPoints(generateDataset(activePreset));
    }

    const newNet = new NeuralNetwork(
      { inputSize: 2, hiddenLayers, outputSize: 1 },
      activation
    );
    setNet(newNet);
    sound.playSuccess();
  }, [preset, hiddenLayers, activation]);

  // Re-initialize network when topology or activation changes
  useEffect(() => {
    resetNetwork();
  }, [hiddenLayers, activation]);

  // Handle step of training
  const stepTraining = useCallback(() => {
    if (points.length === 0) return;

    const result = net.trainStep(points, learningRate);
    setEpoch((prev) => prev + 1);
    setCurrentLoss(result.loss);
    setCurrentAccuracy(result.accuracy);

    setLossHistory((prev) => [...prev.slice(-49), result.loss]);
    setAccuracyHistory((prev) => [...prev.slice(-49), result.accuracy]);

    if (onTargetReached) {
      onTargetReached(result.accuracy);
    }
  }, [net, points, learningRate, onTargetReached]);

  // Training Loop Effect
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = 0;

    const loop = (time: number) => {
      if (isTraining) {
        if (time - lastTime > 40) { // ~25 steps/sec
          stepTraining();
          lastTime = time;
        }
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    if (isTraining) {
      animationFrameId = requestAnimationFrame(loop);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isTraining, stepTraining]);

  // Render 2D Decision Boundary Heatmap on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const resolution = 50; // 50x50 grid pixels for smooth performance

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    const cellW = width / resolution;
    const cellH = height / resolution;

    for (let r = 0; r < resolution; r++) {
      for (let c = 0; c < resolution; c++) {
        // Map grid cell to normalized 2D space [-1, 1]
        const nx = (c / resolution) * 2 - 1;
        const ny = 1 - (r / resolution) * 2; // invert y for canvas coordinate system

        const output = net.forward([nx, ny])[0]; // output between 0 and 1

        // Interpolate color: Class 0 (Blue) <-> Class 1 (Red/Orange)
        // Blue RGB: (59, 130, 246)
        // Red RGB: (239, 68, 68)
        const red = Math.round(59 + output * (239 - 59));
        const green = Math.round(130 + output * (68 - 130));
        const blue = Math.round(246 + output * (68 - 246));
        const alpha = 200;

        // Fill bounding box pixels
        const startX = Math.floor(c * cellW);
        const startY = Math.floor(r * cellH);
        const endX = Math.floor((c + 1) * cellW);
        const endY = Math.floor((r + 1) * cellH);

        for (let py = startY; py < endY; py++) {
          for (let px = startX; px < endX; px++) {
            const index = (py * width + px) * 4;
            data[index] = red;
            data[index + 1] = green;
            data[index + 2] = blue;
            data[index + 3] = alpha;
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Draw coordinate axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Draw Dataset Points
    points.forEach((pt) => {
      // Map [-1, 1] to canvas coords [0, width]
      const cx = ((pt.x + 1) / 2) * width;
      const cy = ((1 - pt.y) / 2) * height;

      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = pt.label === 1 ? '#ef4444' : '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

  }, [net, points, epoch]);

  // Add custom point on canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert pixel coords to [-1, 1]
    const nx = (clickX / rect.width) * 2 - 1;
    const ny = 1 - (clickY / rect.height) * 2;

    const newPt: Point2D = {
      id: `custom_${Date.now()}`,
      x: nx,
      y: ny,
      label: selectedClassForDraw,
    };

    setPoints((prev) => [...prev, newPt]);
    sound.playPulse(selectedClassForDraw === 1 ? 700 : 350, 0.05);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Title Header */}
      <div className="bg-[#818CF8] rounded-3xl p-6 sm:p-8 text-white border-4 border-[#4338CA] shadow-[8px_8px_0px_0px_#4338CA] relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDE047] text-slate-900 text-xs font-black uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
            <span>Module 3 & Sandbox</span>
            <span>•</span>
            <span>How AI Learns in Real-Time</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            2D Decision Boundary & Training Playground
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base font-medium leading-relaxed">
            Watch the neural network learn in real-time as backpropagation adjusts weights to carve out decision boundaries (Blue Region vs Red Region)!
          </p>
        </div>
      </div>

      {/* Control Toolbar Bar */}
      <div className="bg-white rounded-3xl p-6 border-4 border-slate-900 shadow-[8px_8px_0px_0px_#1E293B] space-y-5">
        
        {/* Main Training Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsTraining(!isTraining);
                sound.playPulse(isTraining ? 400 : 700, 0.08);
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-black text-sm uppercase tracking-wider border-2 border-slate-900 transition-all ${
                isTraining 
                  ? 'bg-rose-500 text-white shadow-[4px_4px_0px_0px_#9f1239]' 
                  : 'bg-[#4ADE80] text-slate-900 shadow-[4px_4px_0px_0px_#166534] hover:translate-y-0.5'
              }`}
            >
              {isTraining ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isTraining ? 'Pause Training' : 'Start Training'}</span>
            </button>

            <button
              onClick={() => {
                stepTraining();
                sound.playPulse(550, 0.05);
              }}
              disabled={isTraining}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs uppercase tracking-wider bg-[#818CF8] text-white hover:bg-[#6366f1] disabled:opacity-40 transition-all border-2 border-[#4338CA] shadow-[3px_3px_0px_0px_#4338CA]"
            >
              <FastForward className="w-4 h-4" />
              <span>Step 1 Epoch</span>
            </button>

            <button
              onClick={() => resetNetwork()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs uppercase tracking-wider bg-white hover:bg-slate-100 text-slate-900 transition-all border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1E293B]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Weights</span>
            </button>
          </div>

          {/* Dataset Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Dataset:</span>
            <div className="flex items-center gap-1 bg-[#FEFCE8] p-1.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
              {(['xor', 'circle', 'linear', 'spiral', 'custom'] as DatasetPreset[]).map((p) => (
                <button
                  key={p}
                  onClick={() => resetNetwork(p)}
                  className={`px-3 py-1 rounded-xl text-xs font-black uppercase transition-all ${
                    preset === p
                      ? 'bg-[#FDE047] text-slate-900 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]'
                      : 'text-slate-800 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Hyper-Parameters Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t-2 border-slate-200 text-xs">
          
          {/* Learning Rate */}
          <div className="space-y-1.5 bg-[#FFF7ED] p-3.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
            <div className="flex justify-between font-black text-slate-900 uppercase">
              <span>Learning Rate (Step Size)</span>
              <span className="font-mono text-[#166534] bg-[#4ADE80] px-2 py-0.5 rounded-md border border-slate-900">{learningRate.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="0.005"
              max="0.4"
              step="0.005"
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#166534] border border-slate-900"
            />
          </div>

          {/* Network Architecture Quick Topology */}
          <div className="space-y-1.5 bg-[#FEFCE8] p-3.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
            <span className="font-black text-slate-900 uppercase">Network Complexity</span>
            <select
              value={JSON.stringify(hiddenLayers)}
              onChange={(e) => setHiddenLayers(JSON.parse(e.target.value))}
              className="w-full bg-white border-2 border-slate-900 text-slate-900 font-black rounded-xl px-2.5 py-1"
            >
              <option value="[]">Linear Perceptron (No Hidden Layers)</option>
              <option value="[4]">Simple (1 Hidden Layer: 4 Neurons)</option>
              <option value="[6, 4]">Medium (2 Hidden Layers: 6 Neurons)</option>
              <option value="[8, 6]">Deep Non-Linear (2 Hidden Layers: 8 Neurons)</option>
            </select>
          </div>

          {/* Activation Function */}
          <div className="space-y-1.5 bg-[#FEFCE8] p-3.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
            <span className="font-black text-slate-900 uppercase">Activation Function</span>
            <select
              value={activation}
              onChange={(e) => setActivation(e.target.value as ActivationType)}
              className="w-full bg-white border-2 border-slate-900 text-slate-900 font-black rounded-xl px-2.5 py-1"
            >
              <option value="tanh">Tanh (Smooth -1 to +1)</option>
              <option value="relu">ReLU (Non-linear Rectified)</option>
              <option value="sigmoid">Sigmoid (0 to 1)</option>
            </select>
          </div>

        </div>

      </div>

      {/* Main Grid: Decision Boundary Canvas (Left) & Metrics/Graphs (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 2D Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border-4 border-[#FB923C] shadow-[8px_8px_0px_0px_#FB923C] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FB923C]" />
              <span className="font-black text-slate-900 uppercase tracking-tight">2D Decision Space Heatmap</span>
            </div>
            
            {/* Draw Dot Controls */}
            <div className="flex items-center gap-1.5 bg-[#FEFCE8] p-1.5 rounded-xl border-2 border-slate-900">
              <span className="text-[10px] text-slate-800 font-black uppercase px-1">Click canvas:</span>
              <button
                onClick={() => setSelectedClassForDraw(0)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border border-slate-900 ${
                  selectedClassForDraw === 0 ? 'bg-[#818CF8] text-white shadow-[1px_1px_0px_0px_#4338CA]' : 'bg-white text-slate-800'
                }`}
              >
                Blue Dot
              </button>
              <button
                onClick={() => setSelectedClassForDraw(1)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border border-slate-900 ${
                  selectedClassForDraw === 1 ? 'bg-rose-500 text-white shadow-[1px_1px_0px_0px_#9f1239]' : 'bg-white text-slate-800'
                }`}
              >
                Red Dot
              </button>
            </div>
          </div>

          {/* Interactive Canvas Container */}
          <div className="relative flex justify-center bg-slate-900 rounded-2xl p-2 overflow-hidden shadow-inner border-2 border-slate-900">
            <canvas
              ref={canvasRef}
              width={360}
              height={360}
              onClick={handleCanvasClick}
              className="rounded-xl cursor-crosshair max-w-full h-auto"
            />
          </div>

          <p className="text-center text-xs font-bold text-slate-800">
            <span className="font-black text-[#818CF8] uppercase">Blue Region</span> = Class 0 • <span className="font-black text-rose-600 uppercase">Red Region</span> = Class 1
          </p>
        </div>

        {/* Right Column: Metrics & Loss Graph (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-3xl border-4 border-slate-900 shadow-[6px_6px_0px_0px_#1E293B] space-y-1">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Epoch (Passes)</span>
              <p className="text-2xl font-black text-slate-900 font-mono">{epoch}</p>
            </div>

            <div className="bg-white p-4 rounded-3xl border-4 border-slate-900 shadow-[6px_6px_0px_0px_#1E293B] space-y-1">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Accuracy</span>
              <p className={`text-2xl font-black font-mono ${currentAccuracy >= 90 ? 'text-[#166534]' : 'text-[#818CF8]'}`}>
                {currentAccuracy.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Loss Curve Graph */}
          <div className="bg-white rounded-3xl p-6 border-4 border-[#FDE047] shadow-[8px_8px_0px_0px_#1E293B] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-slate-900 uppercase tracking-tight">Training Loss (Error Score)</span>
              <span className="font-mono text-rose-700 font-black text-sm">{currentLoss.toFixed(4)}</span>
            </div>

            <p className="text-[11px] font-medium text-slate-700">
              As the neural network learns, the loss score drops toward zero, indicating fewer classification mistakes.
            </p>

            {/* SVG Loss Sparkline Graph */}
            <div className="bg-slate-900 rounded-2xl p-3 h-36 flex items-end border-2 border-slate-900">
              {lossHistory.length > 1 ? (
                <svg className="w-full h-full overflow-visible">
                  <polyline
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="3"
                    points={lossHistory
                      .map((val, idx) => {
                        const x = (idx / (lossHistory.length - 1)) * 260;
                        const y = Math.max(10, Math.min(120, (val / 1.0) * 120));
                        return `${x},${120 - y}`;
                      })
                      .join(' ')}
                  />
                </svg>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-mono font-bold">
                  Press "Start Training" to record loss graph
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
