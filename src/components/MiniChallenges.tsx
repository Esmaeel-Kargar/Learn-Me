import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { MINI_CHALLENGES } from '../data/challenges';
import { Challenge } from '../types';
import { TrainingPlayground } from './TrainingPlayground';
import { sound } from '../utils/sound';
import { Trophy, CheckCircle2, HelpCircle, Award, Sparkles, ArrowRight } from 'lucide-react';

export const MiniChallenges: React.FC = () => {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('manual_logic');
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [showHint, setShowHint] = useState<boolean>(false);

  const activeChallenge = MINI_CHALLENGES.find((c) => c.id === selectedChallengeId) || MINI_CHALLENGES[0];
  const isCompleted = completedIds.includes(activeChallenge.id);

  const triggerVictoryConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleTargetReached = (accuracy: number) => {
    if (accuracy >= activeChallenge.targetAccuracy && !completedIds.includes(activeChallenge.id)) {
      setCompletedIds((prev) => [...prev, activeChallenge.id]);
      sound.playSuccess();
      triggerVictoryConfetti();
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Title Header */}
      <div className="bg-[#FB923C] rounded-3xl p-6 sm:p-8 text-slate-900 border-4 border-slate-900 shadow-[8px_8px_0px_0px_#1E293B] relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDE047] text-slate-900 text-xs font-black uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
            <span>Module 5</span>
            <span>•</span>
            <span>Test Your Neural Skill</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">
            AI Mini-Challenges & Puzzles
          </h1>
          <p className="text-slate-900 font-extrabold text-sm sm:text-base leading-relaxed">
            Put your new neural network knowledge to the test! Can you configure, adjust, and train AI models to solve all four puzzles?
          </p>
        </div>
      </div>

      {/* Challenge Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MINI_CHALLENGES.map((ch) => {
          const isSelected = ch.id === selectedChallengeId;
          const isDone = completedIds.includes(ch.id);

          return (
            <button
              key={ch.id}
              onClick={() => {
                setSelectedChallengeId(ch.id);
                setShowHint(false);
                sound.playPulse(500, 0.05);
              }}
              className={`p-5 rounded-3xl text-left border-4 border-slate-900 transition-all relative overflow-hidden select-none ${
                isSelected
                  ? 'bg-[#FDE047] text-slate-900 shadow-[6px_6px_0px_0px_#1E293B] scale-102'
                  : 'bg-white text-slate-900 shadow-[4px_4px_0px_0px_#1E293B] hover:bg-slate-50 hover:translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white text-slate-900 px-2.5 py-1 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
                  {ch.badge}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-6 h-6 text-[#166534] stroke-[3]" />
                ) : (
                  <Award className="w-6 h-6 text-slate-400 stroke-[2.5]" />
                )}
              </div>

              <h3 className="font-black uppercase text-sm text-slate-900 mb-1">{ch.title}</h3>
              <p className="text-xs font-semibold text-slate-700 line-clamp-2">{ch.description}</p>
            </button>
          );
        })}
      </div>

      {/* Active Challenge Playground Box */}
      <div className="bg-white rounded-3xl p-6 border-4 border-slate-900 shadow-[8px_8px_0px_0px_#1E293B] space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#FB923C]" />
              <h2 className="font-black text-xl uppercase text-slate-900 tracking-tight">{activeChallenge.title}</h2>
              {isCompleted && (
                <span className="px-3 py-1 bg-[#4ADE80] text-slate-900 text-xs font-black uppercase rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#166534]">
                  Solved! 🎉
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-700 mt-1">{activeChallenge.description}</p>
          </div>

          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FDE047] hover:bg-yellow-300 text-slate-900 font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1E293B] hover:translate-y-0.5 transition-all"
          >
            <HelpCircle className="w-4 h-4 text-slate-900" />
            <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
          </button>
        </div>

        {/* Hint Callout Box */}
        {showHint && (
          <div className="p-4 bg-[#FEFCE8] rounded-2xl border-2 border-slate-900 text-xs text-slate-900 font-extrabold shadow-[3px_3px_0px_0px_#1E293B] space-y-1">
            <span className="font-black flex items-center gap-1 text-slate-900 uppercase">
              <Sparkles className="w-4 h-4 text-[#FB923C]" /> Pro Hint:
            </span>
            <p>{activeChallenge.hint}</p>
          </div>
        )}

        {/* Embedded Interactive Training Playground for the Challenge */}
        <TrainingPlayground
          key={activeChallenge.id}
          initialPreset={activeChallenge.preset}
          initialTopology={activeChallenge.initialTopology}
          initialLR={activeChallenge.initialLR}
          initialActivation={activeChallenge.initialActivation}
          onTargetReached={handleTargetReached}
        />

      </div>

    </div>
  );
};
