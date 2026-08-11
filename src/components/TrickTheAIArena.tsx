import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ShieldCheck, Sparkles, RefreshCw, Zap, Eye, CheckCircle2, XCircle, Info, Bug } from 'lucide-react';
import { sound } from '../utils/sound';

type ExperimentType = 'bias' | 'adversarial' | 'hallucination';

export const TrickTheAIArena: React.FC = () => {
  const [activeExp, setActiveExp] = useState<ExperimentType>('bias');

  // Experiment 1: Bias State
  const [isDataBiased, setIsDataBiased] = useState<boolean>(true);

  // Experiment 2: Adversarial State
  const [isTrojanActive, setIsTrojanActive] = useState<boolean>(false);

  // Experiment 3: Hallucination State
  const [hasGroundingContext, setHasGroundingContext] = useState<boolean>(false);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-rose-300 text-xs font-black uppercase tracking-wider">
            <Bug className="w-3.5 h-3.5 text-rose-400" />
            <span>Lesson 4: AI Failure Modes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            "Break the AI!" — Adversarial Attacks & Edge Cases
          </h1>
          <p className="text-rose-100 text-sm sm:text-base font-medium leading-relaxed">
            The best way to understand AI is to explore where it fails! See how biased training datasets, single-pixel noise, and hallucination prompts fool neural networks.
          </p>
        </div>
      </div>

      {/* Experiment Selector Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        {[
          { id: 'bias', label: '1. Biased Training Trap', icon: <Bug className="w-4 h-4 text-rose-500" /> },
          { id: 'adversarial', label: '2. Trojan Pixel Attack', icon: <Zap className="w-4 h-4 text-amber-500" /> },
          { id: 'hallucination', label: '3. LLM Hallucinations', icon: <AlertTriangle className="w-4 h-4 text-indigo-500" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveExp(tab.id as ExperimentType);
              sound.playPulse(500, 0.05);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeExp === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* EXPERIMENT 1: BIASED DATASET */}
      {activeExp === 'bias' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase text-rose-600">Experiment 1</span>
              <h2 className="text-xl font-black text-slate-900 uppercase">The Biased Training Dataset Trap</h2>
              <p className="text-xs font-medium text-slate-500">When AI is trained on skewed data, it learns false correlations!</p>
            </div>

            <button
              onClick={() => {
                setIsDataBiased(!isDataBiased);
                sound.playPulse(600, 0.05);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition-all shadow-xs"
            >
              {isDataBiased ? '✨ Fix Dataset Bias (Add Black Cats)' : '⚠️ Reset to Biased Dataset'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase">
                1. What the AI was Trained On:
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <div className="bg-white p-3 rounded-xl border border-amber-200">
                  <span className="text-slate-900 block font-black">🐱 White Cats (10x)</span>
                  <p className="text-[10px] text-slate-500">Label: "CAT"</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-amber-200">
                  <span className="text-slate-900 block font-black">🐶 Black Dogs (10x)</span>
                  <p className="text-[10px] text-slate-500">Label: "DOG"</p>
                </div>
                {!isDataBiased && (
                  <div className="col-span-2 bg-emerald-100 p-3 rounded-xl border border-emerald-300 text-emerald-900 font-bold">
                    ✅ Added: 10x Black Cats & 10x White Dogs!
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                2. Test Subject: Black Cat 🐈‍⬛
              </h3>

              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">AI Prediction</p>
                  <h4 className="text-2xl font-black text-white">
                    {isDataBiased ? '🐶 98% DOG (FAIL!)' : '🐱 99% CAT (CORRECT!)'}
                  </h4>
                </div>
                {isDataBiased ? (
                  <XCircle className="w-8 h-8 text-rose-500" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                )}
              </div>

              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                {isDataBiased
                  ? '❌ Why did it fail? Because the biased dataset only contained White Cats and Black Dogs, the AI mistakenly concluded that "Black Fur = Dog"!'
                  : '✅ After adding Black Cats to the dataset, the AI learned to look at ears and whiskers instead of fur color!'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* EXPERIMENT 2: TROJAN PIXEL */}
      {activeExp === 'adversarial' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase text-amber-600">Experiment 2</span>
              <h2 className="text-xl font-black text-slate-900 uppercase">The Trojan Pixel Attack</h2>
              <p className="text-xs font-medium text-slate-500">Neural networks can be tricked by 1 single pixel of crafted noise!</p>
            </div>

            <button
              onClick={() => {
                setIsTrojanActive(!isTrojanActive);
                sound.playPulse(isTrojanActive ? 400 : 800, 0.05);
              }}
              className={`px-4 py-2 text-xs font-bold uppercase rounded-2xl transition-all shadow-xs ${
                isTrojanActive ? 'bg-rose-600 text-white' : 'bg-amber-400 text-slate-900'
              }`}
            >
              {isTrojanActive ? '🔴 Remove Trojan Pixel' : '⚡ Insert Sneaky Trojan Pixel'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-4">
              <div className="relative w-36 h-36 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center text-6xl">
                🐶
                {isTrojanActive && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-rose-500 rounded-full animate-ping border border-white" />
                )}
              </div>
              <p className="text-xs text-slate-400 font-bold uppercase">
                {isTrojanActive ? '⚠️ Trojan Noise Pixel Active at (x:12, y:4)' : 'Clean Image (No Trojan Noise)'}
              </p>
            </div>

            <div className="bg-amber-50/70 p-6 rounded-2xl border border-amber-200 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm uppercase">AI Classification Result:</h3>

              <div className="bg-white p-4 rounded-xl border border-amber-200">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-900 text-lg">
                    {isTrojanActive ? '✈️ AIRPLANE' : '🐶 DOG'}
                  </span>
                  <span className="text-indigo-600 text-lg">
                    {isTrojanActive ? '99.8%' : '98.2%'}
                  </span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full ${isTrojanActive ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: isTrojanActive ? '99.8%' : '98.2%' }}
                  />
                </div>
              </div>

              <p className="text-xs font-medium text-slate-700 leading-relaxed">
                <strong className="text-indigo-600 block mb-1">💡 Key Takeaway:</strong>
                Human eyes ignore 1 tiny pixel, but deep neural networks sum thousands of activations. A single crafted noise pixel can overload a specific internal neuron pathway!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* EXPERIMENT 3: HALLUCINATION */}
      {activeExp === 'hallucination' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase text-indigo-600">Experiment 3</span>
              <h2 className="text-xl font-black text-slate-900 uppercase">LLM Hallucinations vs RAG Grounding</h2>
              <p className="text-xs font-medium text-slate-500">Without factual grounding context, LLMs confidently invent fake information!</p>
            </div>

            <button
              onClick={() => {
                setHasGroundingContext(!hasGroundingContext);
                sound.playPulse(500, 0.05);
              }}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-2xl transition-all shadow-xs"
            >
              {hasGroundingContext ? '⚠️ Remove Grounding Knowledge' : '🛡️ Enable RAG Grounding Context'}
            </button>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 border border-slate-800">
            <div className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
              Prompt: "Who won the 2038 Lunar Marathon?"
            </div>

            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 text-sm font-medium leading-relaxed font-mono">
              {hasGroundingContext ? (
                <span className="text-emerald-400">
                  "Based on official space records, the Lunar Marathon has not been established yet as permanent settlements on the Moon are still in development."
                </span>
              ) : (
                <span className="text-rose-400">
                  "The 2038 Lunar Marathon was won by astronaut Dr. Sarah Jenkins with a record time of 2 hours and 14 minutes in low-gravity running gear..." <i>(100% Fake Hallucination!)</i>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 font-medium">
              {hasGroundingContext
                ? '✅ Grounding Knowledge (RAG) forces the LLM to verify factual sources before generating text!'
                : '❌ Without verified grounding facts, LLMs generate text purely based on probabilistic word guessing!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
