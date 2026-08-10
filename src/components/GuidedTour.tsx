import React, { useState } from 'react';
import { TabType } from './Header';
import { sound } from '../utils/sound';
import { SingleNeuronVisualizer } from './SingleNeuronVisualizer';
import { NetworkArchitectureVisualizer } from './NetworkArchitectureVisualizer';
import { TrainingPlayground } from './TrainingPlayground';
import { WordEmbeddingsVisualizer } from './WordEmbeddingsVisualizer';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, HelpCircle, Cpu, Zap, Sliders, Type, Trophy } from 'lucide-react';

interface GuidedTourProps {
  onNavigateTab: (tab: TabType) => void;
}

interface Step {
  id: number;
  title: string;
  badge: string;
  subtitle: string;
  quizQuestion: string;
  quizOptions: string[];
  correctOptionIndex: number;
  quizExplanation: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Lesson 1: The Artificial Neuron',
    badge: 'Step 1 of 4',
    subtitle: 'Learn how a single artificial neuron receives input signals, multiplies them by weight dials, adds a bias, and decides whether to fire.',
    quizQuestion: 'What is the main purpose of a "Weight" in a neuron?',
    quizOptions: [
      'It controls the speed of electricity in the wire.',
      'It determines how important or influential an input signal is.',
      'It clears the memory of the neural network.',
    ],
    correctOptionIndex: 1,
    quizExplanation: 'Correct! Weights act like importance knobs. A large positive weight amplifies an input, while a zero weight ignores it completely.',
  },
  {
    id: 2,
    title: 'Lesson 2: Multi-Layer Deep Networks',
    badge: 'Step 2 of 4',
    subtitle: 'Connecting individual neurons into hidden layers allows the network to combine simple features into complex recognition engines.',
    quizQuestion: 'Why do we need "Activation Functions" between layers?',
    quizOptions: [
      'They transform simple straight lines into curved, non-linear decision boundaries.',
      'They prevent the computer monitor from flickering.',
      'They automatically save the file to hard drive.',
    ],
    correctOptionIndex: 0,
    quizExplanation: 'Spot on! Without non-linear activation functions (like ReLU or Tanh), a neural network could only solve straight-line problems!',
  },
  {
    id: 3,
    title: 'Lesson 3: How AI Learns (Backpropagation)',
    badge: 'Step 3 of 4',
    subtitle: 'Neural networks do not start out smart—they learn by making mistakes, calculating loss, and adjusting weights backwards!',
    quizQuestion: 'What happens when you increase the "Learning Rate" too high?',
    quizOptions: [
      'The AI learns 100x faster without any errors.',
      'The AI might take steps too large, overshooting the best weights and failing to learn.',
      'The computer automatically shuts down.',
    ],
    correctOptionIndex: 1,
    quizExplanation: 'Exactly! A balanced learning rate ensures steady weight tweaks without bouncing wildly out of control.',
  },
  {
    id: 4,
    title: 'Lesson 4: Embeddings & Attention in Today\'s AI',
    badge: 'Step 4 of 4',
    subtitle: 'See how modern AI systems like ChatGPT and Gemini convert language into vector maps and pay attention to context words.',
    quizQuestion: 'How does an AI calculate that "King" is related to "Queen"?',
    quizOptions: [
      'It looks up the words in an English dictionary.',
      'It maps words to numerical coordinates (embeddings) where related concepts sit close together.',
      'It guesses randomly every time.',
    ],
    correctOptionIndex: 1,
    quizExplanation: 'Bravo! Word embeddings represent semantic concepts as points in a vector space!',
  },
];

export const GuidedTour: React.FC<GuidedTourProps> = ({ onNavigateTab }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const activeStep = STEPS[currentStepIdx];

  const handleAnswerSelect = (optionIdx: number) => {
    setSelectedAnswerIdx(optionIdx);
    setQuizSubmitted(true);
    if (optionIdx === activeStep.correctOptionIndex) {
      sound.playSuccess();
    } else {
      sound.playPulse(300, 0.1);
    }
  };

  const nextStep = () => {
    if (currentStepIdx < STEPS.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
      setSelectedAnswerIdx(null);
      setQuizSubmitted(false);
      sound.playPulse(600, 0.05);
    }
  };

  const prevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
      setSelectedAnswerIdx(null);
      setQuizSubmitted(false);
      sound.playPulse(400, 0.05);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Tour Progress Header */}
      <div className="bg-white rounded-3xl p-6 border-4 border-[#818CF8] shadow-[8px_8px_0px_0px_#4338CA] space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-white bg-[#FB923C] px-3 py-1 rounded-full border border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
              {activeStep.badge}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 uppercase tracking-tight">{activeStep.title}</h1>
            <p className="text-xs sm:text-sm font-medium text-slate-700 max-w-2xl mt-1 leading-relaxed">{activeStep.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevStep}
              disabled={currentStepIdx === 0}
              className="p-2.5 rounded-2xl bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-900 transition-all border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1E293B] hover:translate-y-0.5 active:translate-y-1 font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextStep}
              disabled={currentStepIdx === STEPS.length - 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#818CF8] hover:bg-[#6366f1] disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#4338CA] border-2 border-[#4338CA] hover:translate-y-0.5 active:translate-y-1 transition-all"
            >
              <span>Next Lesson</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Progress Dots */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t-2 border-slate-200">
          {STEPS.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => {
                setCurrentStepIdx(idx);
                setSelectedAnswerIdx(null);
                setQuizSubmitted(false);
              }}
              className={`h-3 rounded-full cursor-pointer transition-all border border-slate-900 ${
                idx === currentStepIdx
                  ? 'bg-[#818CF8] shadow-[2px_2px_0px_0px_#4338CA]'
                  : idx < currentStepIdx
                  ? 'bg-[#4ADE80]'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

      </div>

      {/* Render Active Lesson Content */}
      <div className="space-y-8">
        {currentStepIdx === 0 && <SingleNeuronVisualizer />}
        {currentStepIdx === 1 && <NetworkArchitectureVisualizer />}
        {currentStepIdx === 2 && <TrainingPlayground />}
        {currentStepIdx === 3 && <WordEmbeddingsVisualizer />}
      </div>

      {/* Quiz Checkpoint Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-[#FB923C] shadow-[8px_8px_0px_0px_#FB923C] space-y-5">
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FB923C] text-white flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_#c2410c]">
            01
          </div>
          <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight">Knowledge Check: Test Your Understanding</h3>
        </div>

        <p className="text-sm font-extrabold text-slate-800">{activeStep.quizQuestion}</p>

        <div className="space-y-3">
          {activeStep.quizOptions.map((opt, oIdx) => {
            const isSelected = selectedAnswerIdx === oIdx;
            const isCorrect = oIdx === activeStep.correctOptionIndex;

            let btnStyle = 'bg-[#FFF7ED] border-2 border-slate-900 text-slate-900 shadow-[3px_3px_0px_0px_#1E293B] hover:bg-[#FDE047]/40';
            if (quizSubmitted) {
              if (isCorrect) btnStyle = 'bg-[#4ADE80] border-2 border-slate-900 text-slate-900 font-black shadow-[4px_4px_0px_0px_#166534]';
              else if (isSelected) btnStyle = 'bg-rose-100 border-2 border-slate-900 text-rose-950 font-bold shadow-[3px_3px_0px_0px_#9f1239]';
            }

            return (
              <button
                key={oIdx}
                onClick={() => handleAnswerSelect(oIdx)}
                className={`w-full p-4 rounded-2xl text-left text-xs sm:text-sm font-bold transition-all flex items-center justify-between ${btnStyle}`}
              >
                <span>{opt}</span>
                {quizSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>

        {quizSubmitted && (
          <div className={`p-4 rounded-2xl text-xs sm:text-sm border-2 border-slate-900 shadow-[4px_4px_0px_0px_#1E293B] space-y-1 ${
            selectedAnswerIdx === activeStep.correctOptionIndex
              ? 'bg-[#FEFCE8] text-slate-900'
              : 'bg-rose-50 text-slate-900'
          }`}>
            <span className="font-black flex items-center gap-1 text-sm uppercase">
              {selectedAnswerIdx === activeStep.correctOptionIndex ? '🎉 Excellent Job!' : '💡 Not quite!'}
            </span>
            <p className="font-medium text-slate-800">{activeStep.quizExplanation}</p>
          </div>
        )}

      </div>

    </div>
  );
};
