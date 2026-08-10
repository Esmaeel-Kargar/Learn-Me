import React, { useState, useEffect, useMemo } from 'react';
import { ActivationType, NetworkTopology } from '../types';
import { NeuralNetwork } from '../utils/nnEngine';
import { sound } from '../utils/sound';
import { Layers, Plus, Minus, Shuffle, Play, Info, Sparkles, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

export const NetworkArchitectureVisualizer: React.FC = () => {
  const [topology, setTopology] = useState<NetworkTopology>({
    inputSize: 2,
    hiddenLayers: [4, 3],
    outputSize: 1,
  });

  const [activationType, setActivationType] = useState<ActivationType>('tanh');
  const [inputVal1, setInputVal1] = useState<number>(0.7);
  const [inputVal2, setInputVal2] = useState<number>(-0.4);
  const [selectedNeuron, setSelectedNeuron] = useState<{ layer: number; index: number } | null>(null);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);

  // Instantiated Neural Network
  const net = useMemo(() => {
    return new NeuralNetwork(topology, activationType);
  }, [topology, activationType]);

  // Run forward pass whenever inputs change
  const outputs = useMemo(() => {
    return net.forward([inputVal1, inputVal2]);
  }, [net, inputVal1, inputVal2]);

  const handleRandomizeWeights = () => {
    setTopology({ ...topology }); // Re-instantiates network with new random weights
    sound.playSuccess();
  };

  const handlePulseSignal = () => {
    setIsPulsing(true);
    sound.playNeuronFire();
    setTimeout(() => setIsPulsing(false), 1200);
  };

  // Add a hidden layer
  const handleAddLayer = () => {
    if (topology.hiddenLayers.length >= 3) return;
    setTopology({
      ...topology,
      hiddenLayers: [...topology.hiddenLayers, 3],
    });
    sound.playPulse(650, 0.08);
  };

  // Remove a hidden layer
  const handleRemoveLayer = () => {
    if (topology.hiddenLayers.length === 0) return;
    const next = [...topology.hiddenLayers];
    next.pop();
    setTopology({
      ...topology,
      hiddenLayers: next,
    });
    sound.playPulse(400, 0.08);
  };

  // Modify neuron count in a hidden layer
  const handleUpdateNeuronCount = (layerIdx: number, delta: number) => {
    const next = [...topology.hiddenLayers];
    const current = next[layerIdx];
    const updated = Math.max(1, Math.min(6, current + delta));
    next[layerIdx] = updated;
    setTopology({
      ...topology,
      hiddenLayers: next,
    });
    sound.playPulse(500 + delta * 50, 0.05);
  };

  // Layer rendering geometry setup
  const totalLayers = net.layers.length;
  const svgWidth = 800;
  const svgHeight = 400;

  // Calculate coordinates for every neuron in the network
  const neuronCoords = useMemo(() => {
    const coords: { layer: number; index: number; x: number; y: number; id: string }[] = [];
    const layerSpacing = svgWidth / (totalLayers + 1);

    for (let l = 0; l < totalLayers; l++) {
      const count = net.layers[l];
      const x = layerSpacing * (l + 1);
      const verticalSpacing = svgHeight / (count + 1);

      for (let i = 0; i < count; i++) {
        const y = verticalSpacing * (i + 1);
        coords.push({
          layer: l,
          index: i,
          x,
          y,
          id: `node_${l}_${i}`,
        });
      }
    }
    return coords;
  }, [totalLayers, net.layers]);

  // Find selected neuron info
  const selectedInfo = useMemo(() => {
    if (!selectedNeuron) return null;
    const { layer, index } = selectedNeuron;
    const act = net.activations[layer]?.[index] ?? 0;
    const pre = net.preActivations[layer]?.[index] ?? 0;
    const bias = layer > 0 ? net.biases[layer - 1]?.[index] : 0;
    return { layer, index, act, pre, bias };
  }, [selectedNeuron, net]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Title Header */}
      <div className="bg-[#818CF8] rounded-3xl p-6 sm:p-8 text-white border-4 border-[#4338CA] shadow-[8px_8px_0px_0px_#4338CA] relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDE047] text-slate-900 text-xs font-black uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
            <span>Module 2</span>
            <span>•</span>
            <span>Connecting Billions of Neurons</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Multi-Layer Deep Neural Networks
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base font-medium leading-relaxed">
            A single neuron can only make simple linear decisions. By stacking neurons into <strong>Hidden Layers</strong>, deep neural networks learn to break complex problems into simple hierarchical features!
          </p>
        </div>
      </div>

      {/* "What Does What in Deep AI?" Explainer Banner */}
      <div className="bg-[#FEFCE8] rounded-3xl p-6 border-4 border-slate-900 shadow-[8px_8px_0px_0px_#1E293B] space-y-4">
        <h3 className="font-black text-slate-900 text-sm sm:text-base uppercase tracking-tight flex items-center gap-2">
          <Info className="w-5 h-5 text-[#818CF8] stroke-[3]" />
          What Does What? (Feature Extraction Hierarchy)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
            <span className="font-black text-[#818CF8] uppercase block mb-1">Layer 0: Input Layer</span>
            <p className="text-slate-700 font-semibold">
              Raw sensory data fed into the network (e.g., individual image pixel brightness values or sensor readings).
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
            <span className="font-black text-[#FB923C] uppercase block mb-1">Layer 1: Low-Level Detector</span>
            <p className="text-slate-700 font-semibold">
              First hidden layer detects basic primitive edges, horizontal lines, color gradients, or pitch changes.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
            <span className="font-black text-[#166534] uppercase block mb-1">Layer 2: Mid-Level Concepts</span>
            <p className="text-slate-700 font-semibold">
              Second hidden layer combines basic edges into shapes, textures, curves, eyes, wheels, or sound phonemes.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
            <span className="font-black text-[#4338CA] uppercase block mb-1">Output Layer: Final Decision</span>
            <p className="text-slate-700 font-semibold">
              Aggregates all high-level concepts into probability predictions (e.g., 98% Cat, 2% Dog).
            </p>
          </div>
        </div>
      </div>

      {/* Network Configuration Toolbar */}
      <div className="bg-white rounded-3xl p-6 border-4 border-slate-900 shadow-[8px_8px_0px_0px_#1E293B] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Layer Management */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#818CF8]" />
              Hidden Layers ({topology.hiddenLayers.length})
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRemoveLayer}
                disabled={topology.hiddenLayers.length === 0}
                className="p-1.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-40 transition-all border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B] font-black"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={handleAddLayer}
                disabled={topology.hiddenLayers.length >= 3}
                className="p-1.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-40 transition-all border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B] font-black"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Activation Selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900 uppercase">Activation:</span>
            <select
              value={activationType}
              onChange={(e) => {
                setActivationType(e.target.value as ActivationType);
                sound.playPulse(500, 0.05);
              }}
              className="bg-[#FEFCE8] border-2 border-slate-900 text-slate-900 text-xs font-black rounded-xl px-3 py-1.5 shadow-[2px_2px_0px_0px_#1E293B]"
            >
              <option value="tanh">Tanh (-1 to +1)</option>
              <option value="relu">ReLU (0 to ∞)</option>
              <option value="sigmoid">Sigmoid (0 to 1)</option>
              <option value="linear">Linear</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomizeWeights}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-black border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1E293B] hover:translate-y-0.5 transition-all uppercase"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#818CF8]" />
              Randomize Weights
            </button>
            <button
              onClick={handlePulseSignal}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#4ADE80] hover:bg-[#22c55e] text-slate-900 rounded-xl text-xs font-black border-2 border-slate-900 shadow-[3px_3px_0px_0px_#166534] hover:translate-y-0.5 active:translate-y-1 transition-all uppercase"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Send Signal Pulse
            </button>
          </div>

        </div>

        {/* Hidden Layer Neuron Controllers */}
        {topology.hiddenLayers.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-3 border-t-2 border-slate-200 text-xs">
            {topology.hiddenLayers.map((count, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-[#FFF7ED] px-3 py-1.5 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
                <span className="font-extrabold text-slate-900">Hidden Layer {idx + 1}:</span>
                <span className="font-black text-[#818CF8]">{count} Neurons</span>
                <div className="flex items-center gap-1 ml-1">
                  <button
                    onClick={() => handleUpdateNeuronCount(idx, -1)}
                    className="p-0.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 border border-slate-900 font-bold"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleUpdateNeuronCount(idx, 1)}
                    className="p-0.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 border border-slate-900 font-bold"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Interactive SVG Network Diagram */}
      <div className="bg-slate-900 rounded-[36px] p-6 border-4 border-slate-900 shadow-[8px_8px_0px_0px_#818CF8] space-y-4">
        
        {/* Top Info Header */}
        <div className="flex items-center justify-between text-xs text-slate-300 border-b-2 border-slate-800 pb-3 font-bold">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FDE047]" />
            <span>Click any neuron node to inspect its internal activation formula!</span>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-3 h-1.5 bg-[#4ADE80] rounded" /> + Positive Weight
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-1.5 bg-rose-500 rounded" /> - Negative Weight
            </span>
          </div>
        </div>

        {/* Interactive SVG Diagram Canvas */}
        <div className="relative overflow-x-auto">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto max-h-[460px] select-none">
            
            {/* Draw Synaptic Connection Wires */}
            {net.weights.map((layerWeights, l) => {
              const fromLayer = l;
              const toLayer = l + 1;

              return layerWeights.map((neuronWeights, toIdx) => {
                const toNode = neuronCoords.find((n) => n.layer === toLayer && n.index === toIdx);
                if (!toNode) return null;

                return neuronWeights.map((w, fromIdx) => {
                  const fromNode = neuronCoords.find((n) => n.layer === fromLayer && n.index === fromIdx);
                  if (!fromNode) return null;

                  const strokeWidth = Math.min(6, Math.max(1, Math.abs(w) * 2.5));
                  const strokeColor = w >= 0 ? '#4ADE80' : '#f43f5e'; // Vibrant green vs Rose
                  const opacity = Math.min(0.9, Math.max(0.15, Math.abs(w) * 0.4));

                  return (
                    <g key={`wire_${l}_${fromIdx}_${toIdx}`}>
                      {/* Connection Line */}
                      <line
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeOpacity={opacity}
                        className="transition-all duration-300"
                      />

                      {/* Animated Signal Pulse Particle */}
                      {isPulsing && (
                        <circle r="4" fill={strokeColor}>
                          <animate
                            attributeName="cx"
                            from={fromNode.x}
                            to={toNode.x}
                            dur="0.8s"
                            repeatCount="1"
                          />
                          <animate
                            attributeName="cy"
                            from={fromNode.y}
                            to={toNode.y}
                            dur="0.8s"
                            repeatCount="1"
                          />
                        </circle>
                      )}
                    </g>
                  );
                });
              });
            })}

            {/* Draw Neuron Nodes */}
            {neuronCoords.map((node) => {
              const act = net.activations[node.layer]?.[node.index] ?? 0;
              const isSelected = selectedNeuron?.layer === node.layer && selectedNeuron?.index === node.index;
              const isInputLayer = node.layer === 0;
              const isOutputLayer = node.layer === totalLayers - 1;

              // Node color based on activation intensity
              const normalizedAct = Math.max(0, Math.min(1, (act + 1) / 2));
              const nodeFill = isInputLayer
                ? '#818CF8' // Indigo for inputs
                : isOutputLayer
                ? (act >= 0.5 ? '#4ADE80' : '#f43f5e') // Emerald vs Rose for binary output
                : `rgba(129, 140, 248, ${0.3 + normalizedAct * 0.7})`;

              return (
                <g
                  key={node.id}
                  onClick={() => {
                    setSelectedNeuron({ layer: node.layer, index: node.index });
                    sound.playPulse(450 + node.layer * 100, 0.05);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Outer Glow Halo if selected */}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="26"
                      fill="none"
                      stroke="#FDE047"
                      strokeWidth="3"
                      className="animate-pulse"
                    />
                  )}

                  {/* Neuron Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="20"
                    fill={nodeFill}
                    stroke={isSelected ? '#FDE047' : '#0F172A'}
                    strokeWidth="3"
                    className="transition-transform group-hover:scale-110"
                  />

                  {/* Text inside node */}
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                    className="pointer-events-none font-mono"
                  >
                    {act.toFixed(2)}
                  </text>

                  {/* Label above or below node */}
                  <text
                    x={node.x}
                    y={node.y - 28}
                    textAnchor="middle"
                    fill="#FDE047"
                    fontSize="9"
                    fontWeight="800"
                    className="pointer-events-none uppercase tracking-wider"
                  >
                    {isInputLayer
                      ? `x${node.index + 1}`
                      : isOutputLayer
                      ? 'Output'
                      : `H${node.layer}_${node.index + 1}`}
                  </text>
                </g>
              );
            })}

          </svg>
        </div>

        {/* Bottom Interactive Inputs & Output Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-2xl border-2 border-slate-800 text-xs">
          
          {/* Input 1 Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-slate-200 font-bold">
              <span>Input Signal x₁</span>
              <span className="font-mono text-[#818CF8] font-black">{inputVal1.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={inputVal1}
              onChange={(e) => setInputVal1(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-[#818CF8]"
            />
          </div>

          {/* Input 2 Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-slate-200 font-bold">
              <span>Input Signal x₂</span>
              <span className="font-mono text-[#818CF8] font-black">{inputVal2.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={inputVal2}
              onChange={(e) => setInputVal2(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-[#818CF8]"
            />
          </div>

          {/* Network Output Result */}
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300 font-bold">Final Output (y):</span>
            <span className={`font-mono text-xs font-black ${outputs[0] >= 0.5 ? 'text-[#4ADE80]' : 'text-rose-400'}`}>
              {outputs[0]?.toFixed(4)} ({outputs[0] >= 0.5 ? 'CLASS 1' : 'CLASS 0'})
            </span>
          </div>

        </div>

      </div>

      {/* Selected Node Inspector Drawer */}
      {selectedInfo && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 border-4 border-[#FB923C] shadow-[8px_8px_0px_0px_#FB923C] space-y-4"
        >
          <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2">
            <span className="font-black text-slate-900 text-sm flex items-center gap-2 uppercase tracking-tight">
              <Cpu className="w-4 h-4 text-[#FB923C]" />
              Inspecting Node: Layer {selectedInfo.layer}, Neuron #{selectedInfo.index + 1}
            </span>
            <button
              onClick={() => setSelectedNeuron(null)}
              className="text-xs text-slate-900 bg-[#FDE047] px-2.5 py-1 rounded-xl font-black border border-slate-900 shadow-[1px_1px_0px_0px_#1E293B]"
            >
              Close Inspector
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#FEFCE8] p-3 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
              <span className="text-slate-700 font-extrabold uppercase text-[10px]">Layer Position</span>
              <p className="font-black text-slate-900 font-mono mt-0.5">
                {selectedInfo.layer === 0
                  ? 'Input Layer'
                  : selectedInfo.layer === totalLayers - 1
                  ? 'Output Layer'
                  : `Hidden Layer ${selectedInfo.layer}`}
              </p>
            </div>

            <div className="bg-[#FEFCE8] p-3 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
              <span className="text-slate-700 font-extrabold uppercase text-[10px]">Neuron Bias (b)</span>
              <p className="font-black text-slate-900 font-mono mt-0.5">
                {selectedInfo.bias.toFixed(3)}
              </p>
            </div>

            <div className="bg-[#FEFCE8] p-3 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
              <span className="text-slate-700 font-extrabold uppercase text-[10px]">Pre-Activation Sum (z)</span>
              <p className="font-black text-[#818CF8] font-mono mt-0.5">
                {selectedInfo.pre.toFixed(3)}
              </p>
            </div>

            <div className="bg-[#FEFCE8] p-3 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
              <span className="text-slate-700 font-extrabold uppercase text-[10px]">Final Output (a)</span>
              <p className="font-black text-[#166534] font-mono text-sm mt-0.5">
                {selectedInfo.act.toFixed(4)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
};
