import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, RefreshCw, Grid, CheckCircle2, AlertTriangle, Layers, Info, Award, Edit2, Type, Plus, Trash2 } from 'lucide-react';
import { sound } from '../utils/sound';

export const PixelRecognizer: React.FC = () => {
  // Grid dimensions: 7x7 = 49 pixels for crisp letter recognition (A, B, C, X, O...)
  const GRID_SIZE = 7;
  const TOTAL_PIXELS = GRID_SIZE * GRID_SIZE;

  // 49-pixel array
  const [pixels, setPixels] = useState<number[]>(() => {
    // Default letter 'A'
    const aPattern = new Array(49).fill(0);
    // Draw 'A'
    [
      2, 3, 4,
      8, 12,
      14, 20,
      21, 22, 23, 24, 25, 26, 27,
      28, 34,
      35, 41,
      42, 48
    ].forEach((idx) => { if (idx < 49) aPattern[idx] = 1; });
    return aPattern;
  });

  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Alphabet character classes and their weight vectors
  const [targetCharInput, setTargetCharInput] = useState<string>('A');
  const [charClasses, setCharClasses] = useState<string[]>(['A', 'B', 'C', 'X', 'O']);
  
  // Weights dictionary: char -> number[] of length 49
  const [weightsMap, setWeightsMap] = useState<{ [char: string]: number[] }>(() => {
    const map: { [char: string]: number[] } = {};
    ['A', 'B', 'C', 'X', 'O'].forEach((ch) => {
      map[ch] = new Array(TOTAL_PIXELS).fill(0).map(() => (Math.random() - 0.5) * 0.4);
    });

    // Seed 'A' with positive weights matching 'A' shape
    [2, 3, 4, 8, 12, 14, 20, 21, 22, 23, 24, 25, 26, 27, 28, 34, 35, 41, 42, 48].forEach((i) => {
      if (map['A'][i] !== undefined) map['A'][i] += 1.2;
    });

    return map;
  });

  const [biasMap, setBiasMap] = useState<{ [char: string]: number }>({
    A: -0.5,
    B: -0.5,
    C: -0.5,
    X: -0.5,
    O: -0.5,
  });

  const [learningRate, setLearningRate] = useState<number>(0.25);
  const [trainingEpochs, setTrainingEpochs] = useState<number>(12);
  const [selectedHeatmapChar, setSelectedHeatmapChar] = useState<string>('A');

  // Toggle or set pixel
  const handlePixelAction = (index: number, state?: number) => {
    setPixels((prev) => {
      const next = [...prev];
      next[index] = state !== undefined ? state : next[index] === 1 ? 0 : 1;
      return next;
    });
    sound.playPulse(250 + (index % 7) * 40, 0.03);
  };

  // Preset alphabet shapes
  const applyAlphabetPreset = (char: string) => {
    const pattern = new Array(TOTAL_PIXELS).fill(0);
    const upper = char.toUpperCase();

    if (upper === 'A') {
      [2, 3, 4, 8, 12, 14, 20, 21, 22, 23, 24, 25, 26, 27, 28, 34, 35, 41, 42, 48].forEach((i) => pattern[i] = 1);
    } else if (upper === 'B') {
      [0, 1, 2, 3, 4, 7, 11, 14, 15, 16, 17, 18, 21, 26, 28, 29, 30, 31, 32, 35, 40, 42, 43, 44, 45, 46].forEach((i) => pattern[i] = 1);
    } else if (upper === 'C') {
      [1, 2, 3, 4, 5, 7, 14, 21, 28, 35, 43, 44, 45, 46, 47].forEach((i) => pattern[i] = 1);
    } else if (upper === 'X') {
      [0, 6, 8, 12, 16, 18, 24, 30, 32, 36, 40, 42, 48].forEach((i) => pattern[i] = 1);
    } else if (upper === 'O') {
      [1, 2, 3, 4, 5, 7, 13, 14, 20, 21, 27, 28, 34, 35, 41, 43, 44, 45, 46, 47].forEach((i) => pattern[i] = 1);
    }

    setPixels(pattern);
    setTargetCharInput(upper);
    setSelectedHeatmapChar(upper);
    sound.playPulse(500, 0.05);
  };

  // Compute soft-max or sigmoid logits for all characters
  const scores: { char: string; raw: number; prob: number }[] = charClasses.map((ch) => {
    const w = weightsMap[ch] || new Array(TOTAL_PIXELS).fill(0);
    const b = biasMap[ch] || 0;
    let dot = b;
    pixels.forEach((p, i) => {
      dot += p * (w[i] || 0);
    });
    // Sigmoid probability for each class
    const prob = 1 / (1 + Math.exp(-dot));
    return { char: ch, raw: dot, prob };
  });

  // Sort by probability highest first
  const sortedPredictions = [...scores].sort((a, b) => b.prob - a.prob);
  const topPrediction = sortedPredictions[0] || { char: '?', prob: 0 };
  const topConfidence = Math.round(topPrediction.prob * 100);

  // Teach the model: Supervised classification update for target character
  const trainModelOnDrawing = (correctChar: string) => {
    const upper = correctChar.trim().toUpperCase();
    if (!upper) return;

    // Ensure character exists in classes
    if (!charClasses.includes(upper)) {
      setCharClasses((prev) => [...prev, upper]);
      setWeightsMap((prev) => ({
        ...prev,
        [upper]: new Array(TOTAL_PIXELS).fill(0).map(() => (Math.random() - 0.5) * 0.2),
      }));
      setBiasMap((prev) => ({ ...prev, [upper]: -0.5 }));
    }

    // Update weights for all character classes (One-vs-Rest Perceptron)
    const newWeightsMap = { ...weightsMap };
    const newBiasMap = { ...biasMap };

    charClasses.concat(charClasses.includes(upper) ? [] : [upper]).forEach((ch) => {
      const isTarget = ch === upper;
      const targetVal = isTarget ? 1.0 : 0.0;
      
      const w = newWeightsMap[ch] || new Array(TOTAL_PIXELS).fill(0);
      const b = newBiasMap[ch] || 0;

      let dot = b;
      pixels.forEach((p, i) => { dot += p * (w[i] || 0); });
      const currentProb = 1 / (1 + Math.exp(-dot));
      const error = targetVal - currentProb;

      // Update weights
      const updatedW = w.map((weightVal, i) => weightVal + learningRate * error * pixels[i]);
      const updatedB = b + learningRate * error;

      newWeightsMap[ch] = updatedW;
      newBiasMap[ch] = updatedB;
    });

    setWeightsMap(newWeightsMap);
    setBiasMap(newBiasMap);
    setTrainingEpochs((prev) => prev + 1);
    setSelectedHeatmapChar(upper);
    sound.playSuccess();
  };

  const resetAllWeights = () => {
    const newMap: { [ch: string]: number[] } = {};
    const newB: { [ch: string]: number } = {};
    charClasses.forEach((ch) => {
      newMap[ch] = new Array(TOTAL_PIXELS).fill(0);
      newB[ch] = 0;
    });
    setWeightsMap(newMap);
    setBiasMap(newB);
    setTrainingEpochs(0);
    sound.playPulse(300, 0.05);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-300 text-slate-900 text-xs font-black uppercase tracking-wider">
            <Grid className="w-3.5 h-3.5" />
            <span>Lesson 2: Computer Vision & Handwriting AI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            High-Resolution Pixel AI: Teach Any Alphabet Character
          </h1>
          <p className="text-purple-100 text-sm sm:text-base font-medium leading-relaxed">
            Computer vision models learn by mapping pixels onto feature weights. Draw any letter or custom symbol on the expanded <strong>7x7 Pixel Canvas (49 Inputs)</strong>, enter its alphabet label, and teach the AI in real time!
          </p>
        </div>
      </div>

      {/* Main Grid Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive 7x7 Pixel Drawing Matrix (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-black text-slate-900 text-base uppercase flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-violet-600" />
                1. Draw Alphabet Character (7x7 Grid)
              </h2>
              <p className="text-xs text-slate-500 font-medium">Click or drag mouse across pixels to draw letters (A, B, C, X, O...).</p>
            </div>
            
            <button
              onClick={() => setPixels(new Array(TOTAL_PIXELS).fill(0))}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Clear Grid
            </button>
          </div>

          {/* Quick Alphabet Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase text-slate-600">Sample Letters:</span>
            {['A', 'B', 'C', 'X', 'O'].map((ch) => (
              <button
                key={ch}
                onClick={() => applyAlphabetPreset(ch)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  targetCharInput.toUpperCase() === ch
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          {/* 7x7 Grid Canvas */}
          <div className="flex justify-center py-2 select-none">
            <div
              className="grid grid-cols-7 gap-1.5 bg-slate-950 p-4 rounded-3xl border border-slate-800 shadow-inner"
              onMouseDown={() => setIsDrawing(true)}
              onMouseUp={() => setIsDrawing(false)}
              onMouseLeave={() => setIsDrawing(false)}
            >
              {pixels.map((val, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePixelAction(idx)}
                  onMouseEnter={() => {
                    if (isDrawing) handlePixelAction(idx, 1);
                  }}
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl font-mono text-[10px] font-black flex items-center justify-center transition-all cursor-pointer ${
                    val === 1
                      ? 'bg-violet-500 text-white shadow-md scale-105 ring-2 ring-violet-300'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-600'
                  }`}
                >
                  {val === 1 ? '1' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Target Character Training Input */}
          <div className="p-4 rounded-2xl bg-violet-50 border border-violet-200 space-y-3">
            <span className="text-xs font-black text-slate-900 uppercase flex items-center gap-2">
              <Type className="w-4 h-4 text-violet-600" />
              Teach Model What You Drew:
            </span>

            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={2}
                value={targetCharInput}
                onChange={(e) => setTargetCharInput(e.target.value.toUpperCase())}
                placeholder="Letter (e.g. A, B, K)"
                className="w-24 font-black text-center text-lg uppercase bg-white text-slate-900 border border-violet-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-violet-500 outline-hidden"
              />

              <button
                onClick={() => trainModelOnDrawing(targetCharInput)}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs uppercase tracking-wider py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Train Model: "This Drawing = '{targetCharInput.toUpperCase() || '?'}'"
              </button>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              Clicking <strong>Train Model</strong> adjusts the 49 weight vectors so the AI remembers this drawing pattern!
            </p>
          </div>
        </div>

        {/* Right Column: AI Live Predictions & Weight Heatmap (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Live Character Recognition Log */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Real-Time AI Character Detection</span>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full">
                {trainingEpochs} Training Iterations
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-900 text-white p-5 rounded-2xl border border-slate-800">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Detected Alphabet Letter</p>
                <h3 className="text-3xl font-black text-amber-300 tracking-tight">
                  Character '{topPrediction.char}'
                </h3>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-emerald-400">{topConfidence}%</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Match Probability</p>
              </div>
            </div>

            {/* Probability breakdown for all learned characters */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-900 uppercase block">Character Probability Breakdown:</span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {sortedPredictions.map((pred) => (
                  <div key={pred.char} className="flex items-center justify-between gap-2">
                    <span className="font-bold font-mono text-slate-800 w-8">
                      '{pred.char}'
                    </span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full border border-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-violet-600 transition-all duration-300"
                        style={{ width: `${Math.round(pred.prob * 100)}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-slate-600 text-[11px] w-10 text-right">
                      {Math.round(pred.prob * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic 49-Pixel Weight Matrix Heatmap */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm uppercase">3. Learned Weight Matrix Heatmap</h3>
                <p className="text-xs text-slate-500 font-medium">Shows which pixels the AI looks for when detecting '{selectedHeatmapChar}'.</p>
              </div>

              <select
                value={selectedHeatmapChar}
                onChange={(e) => setSelectedHeatmapChar(e.target.value)}
                className="font-bold text-xs bg-slate-100 text-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200"
              >
                {charClasses.map((ch) => (
                  <option key={ch} value={ch}>
                    Heatmap for '{ch}'
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center">
              <div className="grid grid-cols-7 gap-1 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                {(weightsMap[selectedHeatmapChar] || new Array(TOTAL_PIXELS).fill(0)).map((w, idx) => {
                  let bg = 'bg-slate-800 text-slate-400';
                  if (w > 0.2) bg = 'bg-emerald-500 text-slate-950';
                  else if (w < -0.2) bg = 'bg-rose-500 text-white';

                  return (
                    <div
                      key={idx}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-mono font-black text-[9px] flex items-center justify-center border border-slate-900 ${bg}`}
                      title={`Pixel ${idx}: Weight = ${w.toFixed(2)}`}
                    >
                      {w > 0 ? `+${w.toFixed(1)}` : w.toFixed(1)}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> Positive Weight</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-rose-500 rounded-sm"></span> Negative Penalty</span>
              </div>

              <button
                onClick={resetAllWeights}
                className="font-bold text-rose-600 hover:text-rose-800 text-xs cursor-pointer"
              >
                Reset All Weights
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

