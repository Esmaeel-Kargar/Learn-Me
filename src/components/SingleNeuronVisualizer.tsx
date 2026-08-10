import React, { useState } from 'react';
import { REAL_WORLD_ANALOGIES } from '../data/analogies';
import { ActivationType } from '../types';
import { activate } from '../utils/nnEngine';
import { sound } from '../utils/sound';
import { Sliders, HelpCircle, ArrowRight, Lightbulb, CheckCircle2, XCircle, Info, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SingleNeuronVisualizer: React.FC = () => {
  const [selectedAnalogyId, setSelectedAnalogyId] = useState<string>('beach');

  // Interactive neuron parameters
  const [input1, setInput1] = useState<number>(1.0);
  const [input2, setInput2] = useState<number>(1.0);
  const [weight1, setWeight1] = useState<number>(3.0);
  const [weight2, setWeight2] = useState<number>(2.0);
  const [bias, setBias] = useState<number>(-3.0);
  const [activationType, setActivationType] = useState<ActivationType>('sigmoid');

  const activeAnalogy = REAL_WORLD_ANALOGIES.find((a) => a.id === selectedAnalogyId) || REAL_WORLD_ANALOGIES[0];

  // Mathematical calculations
  const product1 = input1 * weight1;
  const product2 = input2 * weight2;
  const rawSum = product1 + product2 + bias;
  const output = activate(rawSum, activationType);
  const isFired = output >= 0.5;

  const loadAnalogyPresets = (analogyId: string) => {
    const analogy = REAL_WORLD_ANALOGIES.find((a) => a.id === analogyId);
    if (analogy) {
      setSelectedAnalogyId(analogyId);
      setInput1(1.0);
      setInput2(1.0);
      setWeight1(analogy.weight1Default);
      setWeight2(analogy.weight2Default);
      setBias(analogy.biasDefault);
      setActivationType('sigmoid');
      sound.playSuccess();
    }
  };

  const handleWeight1Change = (val: number) => {
    setWeight1(val);
    sound.playWeightChange(val);
  };

  const handleWeight2Change = (val: number) => {
    setWeight2(val);
    sound.playWeightChange(val);
  };

  const handleBiasChange = (val: number) => {
    setBias(val);
    sound.playWeightChange(val);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Module Title Banner */}
      <div className="bg-[#818CF8] rounded-3xl p-6 sm:p-8 text-white border-4 border-[#4338CA] shadow-[8px_8px_0px_0px_#4338CA] relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDE047] text-slate-900 text-xs font-black uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
            <span>Module 1</span>
            <span>•</span>
            <span>The Core Unit of Artificial Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            How a Single Neuron Works: Step-by-Step
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base font-medium leading-relaxed">
            Every AI model—from simple email spam detectors to ChatGPT—is made of billions of these math units called <strong>Neurons (Perceptrons)</strong>. A neuron takes incoming numbers, weights their importance, adds a baseline inclination (bias), and applies a gate function to output a result.
          </p>
        </div>
      </div>

      {/* "What Does What?" Quick Concepts Reference */}
      <div className="bg-[#FEFCE8] rounded-3xl p-6 border-4 border-slate-900 shadow-[8px_8px_0px_0px_#1E293B] space-y-4">
        <h3 className="font-black text-slate-900 text-sm sm:text-base uppercase tracking-tight flex items-center gap-2">
          <Info className="w-5 h-5 text-[#818CF8] stroke-[3]" />
          What Does What? (The Anatomy of a Neuron)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
            <span className="font-black text-slate-900 uppercase block mb-1">1. Inputs (x₁, x₂)</span>
            <p className="text-slate-700 font-semibold">
              The raw facts or feature signals fed into the neuron (e.g., 1 = Sunny, 0 = Rainy).
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
            <span className="font-black text-[#166534] uppercase block mb-1">2. Weights (w₁, w₂)</span>
            <p className="text-slate-700 font-semibold">
              Importance knobs. Positive weights boost a feature; negative weights penalize it; 0 ignores it.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
            <span className="font-black text-[#FB923C] uppercase block mb-1">3. Bias (b)</span>
            <p className="text-slate-700 font-semibold">
              Baseline threshold. A negative bias makes the neuron strict (needs strong positive evidence to fire).
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
            <span className="font-black text-[#818CF8] uppercase block mb-1">4. Activation Gate (σ)</span>
            <p className="text-slate-700 font-semibold">
              Squashes the weighted sum into a standard output score between 0.0 (NO) and 1.0 (YES).
            </p>
          </div>
        </div>

        {/* Quick Hands-On Experiments */}
        <div className="pt-3 border-t-2 border-slate-900 flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase text-slate-900 mr-1">🧪 Try Quick Experiments:</span>
          
          <button
            onClick={() => {
              setInput1(1.0);
              setInput2(1.0);
              setWeight1(0.0);
              setWeight2(3.0);
              setBias(-1.0);
              sound.playPulse(500, 0.05);
            }}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 text-xs font-extrabold uppercase rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B] hover:translate-y-0.5 transition-all"
          >
            1. Zero Weight (Ignore Input 1)
          </button>

          <button
            onClick={() => {
              setInput1(1.0);
              setInput2(1.0);
              setWeight1(-4.0);
              setWeight2(3.0);
              setBias(-0.5);
              sound.playPulse(400, 0.05);
            }}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 text-xs font-extrabold uppercase rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B] hover:translate-y-0.5 transition-all"
          >
            2. Negative Weight (Penalize)
          </button>

          <button
            onClick={() => {
              setInput1(1.0);
              setInput2(1.0);
              setWeight1(2.0);
              setWeight2(2.0);
              setBias(-6.0);
              sound.playPulse(300, 0.05);
            }}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 text-xs font-extrabold uppercase rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B] hover:translate-y-0.5 transition-all"
          >
            3. Strict Bias (-6.0)
          </button>
        </div>
      </div>

      {/* Preset Analogy Selector */}
      <div className="bg-white rounded-3xl p-6 border-4 border-[#FB923C] shadow-[8px_8px_0px_0px_#FB923C] space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <div className="w-7 h-7 bg-[#FB923C] text-white rounded-full flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_0px_#c2410c]">01</div>
            Pick a Real-World Scenario
          </span>
          <button
            onClick={() => loadAnalogyPresets(selectedAnalogyId)}
            className="flex items-center gap-1.5 text-xs text-slate-900 bg-[#FDE047] hover:bg-yellow-300 px-3 py-1.5 rounded-xl font-black border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B] hover:translate-y-0.5 transition-all uppercase"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REAL_WORLD_ANALOGIES.map((analogy) => {
            const isSelected = analogy.id === selectedAnalogyId;
            return (
              <button
                key={analogy.id}
                onClick={() => loadAnalogyPresets(analogy.id)}
                className={`p-4 rounded-2xl text-left border-2 transition-all relative overflow-hidden select-none ${
                  isSelected
                    ? 'border-slate-900 bg-[#FDE047] text-slate-900 shadow-[4px_4px_0px_0px_#1E293B]'
                    : 'border-slate-900 bg-[#FFF7ED] text-slate-900 shadow-[3px_3px_0px_0px_#1E293B] hover:bg-[#FDE047]/40'
                }`}
              >
                <div className="flex items-center justify-between font-extrabold text-sm text-slate-900 mb-1">
                  <span>{analogy.title}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-slate-900 flex-shrink-0" />}
                </div>
                <p className="text-xs font-medium text-slate-800 line-clamp-2">{analogy.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Diagram & Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input Signals & Weight Knobs (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border-4 border-slate-900 shadow-[8px_8px_0px_0px_#1E293B] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2 uppercase tracking-tight">
              <Sliders className="w-5 h-5 text-[#818CF8]" />
              Adjust Neuron Parameters
            </h3>
            <span className="text-[10px] bg-[#4ADE80] text-slate-900 px-2.5 py-0.5 rounded-full font-black border border-slate-900 shadow-[1px_1px_0px_0px_#166534] uppercase">
              Real-time
            </span>
          </div>

          {/* Input 1 Block */}
          <div className="space-y-3 bg-[#FEFCE8] p-4 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1E293B]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-slate-900 uppercase">{activeAnalogy.input1Label}</span>
              <span className="font-mono text-slate-900 bg-[#FDE047] px-2 py-0.5 rounded-lg border border-slate-900 font-black">
                x₁ = {input1.toFixed(2)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setInput1(0.0); sound.playPulse(300, 0.05); }}
                className={`py-1.5 px-3 rounded-xl text-xs font-black border-2 border-slate-900 transition-all ${
                  input1 === 0 ? 'bg-[#818CF8] text-white shadow-[2px_2px_0px_0px_#4338CA]' : 'bg-white text-slate-900 shadow-[2px_2px_0px_0px_#1E293B] hover:bg-slate-100'
                }`}
              >
                NO (0.0)
              </button>
              <button
                onClick={() => { setInput1(1.0); sound.playPulse(600, 0.05); }}
                className={`py-1.5 px-3 rounded-xl text-xs font-black border-2 border-slate-900 transition-all ${
                  input1 === 1 ? 'bg-[#818CF8] text-white shadow-[2px_2px_0px_0px_#4338CA]' : 'bg-white text-slate-900 shadow-[2px_2px_0px_0px_#1E293B] hover:bg-slate-100'
                }`}
              >
                YES (1.0)
              </button>
            </div>

            {/* Weight 1 Slider */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-800 font-extrabold">
                  Weight 1 (Importance Knob)
                </span>
                <span className={`font-mono font-black ${weight1 >= 0 ? 'text-[#166534]' : 'text-rose-700'}`}>
                  w₁ = {weight1 > 0 ? `+${weight1.toFixed(1)}` : weight1.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={weight1}
                onChange={(e) => handleWeight1Change(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#818CF8] border border-slate-900"
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-bold">
                <span>-5.0 (Negative)</span>
                <span>0.0 (Ignore)</span>
                <span>+5.0 (Strong Importance)</span>
              </div>
            </div>
          </div>

          {/* Input 2 Block */}
          <div className="space-y-3 bg-[#FEFCE8] p-4 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1E293B]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-slate-900 uppercase">{activeAnalogy.input2Label}</span>
              <span className="font-mono text-slate-900 bg-[#FDE047] px-2 py-0.5 rounded-lg border border-slate-900 font-black">
                x₂ = {input2.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setInput2(0.0); sound.playPulse(300, 0.05); }}
                className={`py-1.5 px-3 rounded-xl text-xs font-black border-2 border-slate-900 transition-all ${
                  input2 === 0 ? 'bg-[#818CF8] text-white shadow-[2px_2px_0px_0px_#4338CA]' : 'bg-white text-slate-900 shadow-[2px_2px_0px_0px_#1E293B] hover:bg-slate-100'
                }`}
              >
                NO (0.0)
              </button>
              <button
                onClick={() => { setInput2(1.0); sound.playPulse(600, 0.05); }}
                className={`py-1.5 px-3 rounded-xl text-xs font-black border-2 border-slate-900 transition-all ${
                  input2 === 1 ? 'bg-[#818CF8] text-white shadow-[2px_2px_0px_0px_#4338CA]' : 'bg-white text-slate-900 shadow-[2px_2px_0px_0px_#1E293B] hover:bg-slate-100'
                }`}
              >
                YES (1.0)
              </button>
            </div>

            {/* Weight 2 Slider */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-800 font-extrabold">Weight 2 (Importance Knob)</span>
                <span className={`font-mono font-black ${weight2 >= 0 ? 'text-[#166534]' : 'text-rose-700'}`}>
                  w₂ = {weight2 > 0 ? `+${weight2.toFixed(1)}` : weight2.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={weight2}
                onChange={(e) => handleWeight2Change(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#818CF8] border border-slate-900"
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-bold">
                <span>-5.0</span>
                <span>0.0</span>
                <span>+5.0</span>
              </div>
            </div>
          </div>

          {/* Bias Knob Slider */}
          <div className="space-y-2 bg-[#FFF7ED] p-4 rounded-2xl border-2 border-[#FB923C] shadow-[3px_3px_0px_0px_#FB923C]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-slate-900 uppercase flex items-center gap-1.5">
                Neuron Bias (Baseline Shift)
              </span>
              <span className="font-mono text-slate-900 font-black bg-[#FB923C] text-white px-2 py-0.5 rounded-lg border border-slate-900">
                b = {bias > 0 ? `+${bias.toFixed(1)}` : bias.toFixed(1)}
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-800">
              Bias shifts the total decision threshold up or down. A negative bias requires stronger positive inputs to fire.
            </p>
            <input
              type="range"
              min="-8"
              max="8"
              step="0.1"
              value={bias}
              onChange={(e) => handleBiasChange(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-[#FB923C] border border-slate-900"
            />
          </div>

          {/* Activation Function Choice */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-900 uppercase flex items-center justify-between">
              <span>Activation Function Gate</span>
              <span className="text-[10px] text-[#818CF8] font-mono uppercase font-black">{activationType}</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['sigmoid', 'relu', 'step', 'tanh'] as ActivationType[]).map((act) => (
                <button
                  key={act}
                  onClick={() => { setActivationType(act); sound.playPulse(500, 0.05); }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-black capitalize border-2 border-slate-900 transition-all ${
                    activationType === act
                      ? 'bg-[#818CF8] text-white shadow-[2px_2px_0px_0px_#4338CA]'
                      : 'bg-white text-slate-800 shadow-[2px_2px_0px_0px_#1E293B] hover:bg-slate-50'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Visual Neuron & Calculation Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Visual Neuron Cell Diagram */}
          <div className="bg-slate-900 rounded-[36px] p-6 text-white shadow-[8px_8px_0px_0px_#818CF8] border-4 border-slate-900 space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
              <span className="text-xs font-black tracking-wider uppercase text-[#FDE047]">
                Live Signal Propagation
              </span>
              <span className="text-xs text-slate-300 font-mono font-bold">
                z = (x₁·w₁) + (x₂·w₂) + b
              </span>
            </div>

            {/* Neural Wiring Visualizer */}
            <div className="relative py-8 flex items-center justify-between gap-4 px-2 sm:px-6">
              
              {/* Left Input Nodes */}
              <div className="space-y-8 z-10">
                {/* Input 1 Node */}
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl border-2 border-slate-900 flex flex-col items-center justify-center font-black text-xs shadow-[3px_3px_0px_0px_#1E293B] transition-transform ${
                    input1 > 0 ? 'bg-[#818CF8] text-white scale-105' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <span>x₁</span>
                    <span className="text-[10px] opacity-90">{input1}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 hidden sm:block">
                    <span className="text-slate-400 font-mono text-[10px] font-bold">Signal 1</span>
                    <p className="font-black text-[#FDE047]">{product1 > 0 ? `+${product1.toFixed(1)}` : product1.toFixed(1)}</p>
                  </div>
                </div>

                {/* Input 2 Node */}
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl border-2 border-slate-900 flex flex-col items-center justify-center font-black text-xs shadow-[3px_3px_0px_0px_#1E293B] transition-transform ${
                    input2 > 0 ? 'bg-[#818CF8] text-white scale-105' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <span>x₂</span>
                    <span className="text-[10px] opacity-90">{input2}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 hidden sm:block">
                    <span className="text-slate-400 font-mono text-[10px] font-bold">Signal 2</span>
                    <p className="font-black text-[#FDE047]">{product2 > 0 ? `+${product2.toFixed(1)}` : product2.toFixed(1)}</p>
                  </div>
                </div>
              </div>

              {/* Center Neuron Soma (Cell Body) */}
              <motion.div 
                animate={{
                  scale: isFired ? [1, 1.05, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
                className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center p-2 text-center z-10 transition-all ${
                  isFired 
                    ? 'border-[#4ADE80] bg-slate-800 shadow-[0px_0px_20px_0px_#4ADE80]' 
                    : 'border-slate-700 bg-slate-800'
                }`}
              >
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Weighted Sum</span>
                <span className={`text-xl font-black font-mono my-0.5 ${rawSum >= 0 ? 'text-[#4ADE80]' : 'text-rose-400'}`}>
                  {rawSum > 0 ? `+${rawSum.toFixed(2)}` : rawSum.toFixed(2)}
                </span>
                <span className="text-[9px] text-[#FDE047] font-black px-2 py-0.5 bg-slate-900 rounded-full border border-slate-700 uppercase">
                  Gate: {activationType}
                </span>
              </motion.div>

              {/* Right Output Glow Bulb */}
              <div className="flex flex-col items-center gap-2 z-10">
                <motion.div 
                  animate={{
                    scale: isFired ? 1.1 : 1,
                  }}
                  className={`w-16 h-16 rounded-2xl border-2 border-slate-900 flex items-center justify-center transition-all ${
                    isFired 
                      ? 'bg-[#4ADE80] text-slate-900 shadow-[4px_4px_0px_0px_#166534]' 
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <Lightbulb className={`w-8 h-8 ${isFired ? 'animate-bounce text-slate-900' : 'text-slate-600'}`} />
                </motion.div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Output Signal</span>
                  <p className="font-mono text-xs font-black text-slate-100">
                    y = {output.toFixed(3)}
                  </p>
                </div>
              </div>

            </div>

            {/* Decision Result Banner */}
            <div className={`p-4 rounded-2xl border-4 text-slate-900 flex items-center justify-between transition-all ${
              isFired 
                ? 'bg-[#4ADE80] border-slate-900 shadow-[6px_6px_0px_0px_#166534]' 
                : 'bg-rose-200 border-slate-900 shadow-[6px_6px_0px_0px_#9f1239]'
            }`}>
              <div className="flex items-center gap-3">
                {isFired ? (
                  <CheckCircle2 className="w-6 h-6 text-slate-900 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-slate-900 flex-shrink-0" />
                )}
                <div>
                  <span className="text-[10px] uppercase font-black text-slate-800 tracking-wider">
                    Neuron Decision:
                  </span>
                  <p className="text-base font-black tracking-tight uppercase">
                    {isFired ? activeAnalogy.outputYes : activeAnalogy.outputNo}
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-xs hidden sm:block">
                <p className="text-slate-800 font-extrabold uppercase">Firing Status</p>
                <p className="font-black text-slate-900">
                  {isFired ? 'ACTIVE (≥ 0.5)' : 'SILENT (< 0.5)'}
                </p>
              </div>
            </div>

          </div>

          {/* Mathematical Step-by-Step Step Box */}
          <div className="bg-white rounded-3xl p-6 border-4 border-[#FDE047] shadow-[6px_6px_0px_0px_#1E293B] space-y-4">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-2 uppercase tracking-tight">
              <Info className="w-4 h-4 text-[#818CF8]" />
              Inside the Math: Step-by-Step Calculation
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              
              <div className="p-3 bg-[#FEFCE8] rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B] space-y-1">
                <span className="font-black text-slate-900 uppercase">1. Inputs × Weights</span>
                <p className="font-mono text-slate-700">
                  ({input1} × {weight1.toFixed(1)}) = <span className="font-black">{product1.toFixed(1)}</span>
                </p>
                <p className="font-mono text-slate-700">
                  ({input2} × {weight2.toFixed(1)}) = <span className="font-black">{product2.toFixed(1)}</span>
                </p>
              </div>

              <div className="p-3 bg-[#FEFCE8] rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B] space-y-1">
                <span className="font-black text-slate-900 uppercase">2. Sum & Add Bias</span>
                <p className="font-mono text-slate-700">
                  Sum = {product1.toFixed(1)} + {product2.toFixed(1)}
                </p>
                <p className="font-mono text-slate-700">
                  Bias = {bias > 0 ? `+${bias.toFixed(1)}` : bias.toFixed(1)}
                </p>
                <p className="font-mono font-black text-[#818CF8] pt-1 border-t-2 border-slate-900">
                  z = {rawSum.toFixed(2)}
                </p>
              </div>

              <div className="p-3 bg-[#FEFCE8] rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B] space-y-1">
                <span className="font-black text-slate-900 uppercase">3. Activation Gate</span>
                <p className="text-slate-700 font-bold">
                  Gate: <span className="font-black uppercase text-[#818CF8]">{activationType}</span>
                </p>
                <p className="font-mono font-black text-[#166534] text-sm pt-1">
                  y = {output.toFixed(4)}
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
