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
  keyConcepts: string[];
  experimentGoal: string;
  quizQuestion: string;
  quizOptions: string[];
  correctOptionIndex: number;
  quizExplanation: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Lesson 1: The Artificial Neuron (Perceptron)',
    badge: 'Step 1 of 4',
    subtitle: 'Understand how a single artificial neuron receives input signals, multiplies them by importance weights, adds a baseline bias, and determines whether to trigger an output decision.',
    keyConcepts: [
      'Inputs (x): Raw data features (e.g. 1 = Sunny, 0 = Rainy).',
      'Weights (w): Importance knobs that scale the influence of each input.',
      'Bias (b): Baseline threshold shifting the decision boundary up or down.',
      'Activation (σ): Gate function squashing raw weighted sums into normalized scores.',
    ],
    experimentGoal: '🧪 Interactive Goal: Try selecting the "Email Spam Filter" scenario below and toggle Input 1 to NO (0.0) to observe how the total weighted sum changes in real-time!',
    quizQuestion: 'If an input feature x₁ = 1.0 has a weight w₁ = -4.0, what does this negative weight do to the decision?',
    quizOptions: [
      'It strongly penalizes the decision score, making the neuron far LESS likely to fire.',
      'It speeds up the computer processor.',
      'It multiplies the input by zero, ignoring it completely.',
    ],
    correctOptionIndex: 0,
    quizExplanation: 'Correct! Negative weights act as penalties or suppressors. When a positive feature is multiplied by a negative weight, it lowers the weighted sum!',
  },
  {
    id: 2,
    title: 'Lesson 2: Multi-Layer Deep Neural Networks',
    badge: 'Step 2 of 4',
    subtitle: 'Connecting individual neurons into stacked Hidden Layers creates Deep Learning networks capable of feature extraction and complex pattern recognition.',
    keyConcepts: [
      'Layer 0 (Input): Converts raw pixels, text, or audio into numbers.',
      'Hidden Layer 1: Detects primitive low-level shapes, edges, or pitch shifts.',
      'Hidden Layer 2: Combines primitive edges into eyes, wheels, or sound phonemes.',
      'Non-Linear Activation (ReLU/Tanh): Essential gate functions that allow networks to draw curved decision boundaries.',
    ],
    experimentGoal: '🧪 Interactive Goal: Click "Send Signal Pulse" below to watch data signals propagate through the synaptic wires from inputs to output!',
    quizQuestion: 'Why are non-linear Activation Functions (like ReLU or Tanh) mandatory in deep networks?',
    quizOptions: [
      'Without them, combining 100 hidden layers would just collapse into a single straight-line equation.',
      'They prevent the internet connection from dropping.',
      'They make the graphics card display brighter colors.',
    ],
    correctOptionIndex: 0,
    quizExplanation: 'Spot on! Without non-linear activations, any stack of linear layers collapses mathematically into a simple linear equation that can only draw straight lines!',
  },
  {
    id: 3,
    title: 'Lesson 3: How AI Learns (Backpropagation & Gradient Descent)',
    badge: 'Step 3 of 4',
    subtitle: 'Neural networks are not born smart. They learn by making mistakes, computing a Loss score, and calculating exact weight adjustments backwards!',
    keyConcepts: [
      'Epoch: One complete pass evaluating all training examples.',
      'Loss Function: Quantifies total prediction mistakes (Target = 0.0000).',
      'Gradient Descent: The mathematical compass calculating which direction reduces loss fastest.',
      'Learning Rate: Step size along the error slope (too high = wild overshooting; too low = super slow).',
    ],
    experimentGoal: '🧪 Interactive Goal: Click "🔴 Underfitting Demo" below to see why a 0-hidden-layer network fails on non-linear XOR data, then click "🟢 Optimal Learning Demo"!',
    quizQuestion: 'What happens if you set the "Learning Rate" hyperparameter too high (e.g., 0.50)?',
    quizOptions: [
      'The AI learns instantly with 100% perfection.',
      'The weight steps become too large, overshooting the optimal minimum loss and causing error to bounce out of control.',
      'The network converts into an audio synthesizer.',
    ],
    correctOptionIndex: 1,
    quizExplanation: 'Exactly! A learning rate that is too high causes the model to jump back and forth over the optimal solution valley without ever settling!',
  },
  {
    id: 4,
    title: 'Lesson 4: How LLMs Understand Context (Embeddings & Attention)',
    badge: 'Step 4 of 4',
    subtitle: 'Modern Large Language Models (like ChatGPT and Gemini) process language by mapping words into vector coordinate spaces and paying attention to context words.',
    keyConcepts: [
      'Tokenization: Breaking text into subwords and mapping them to integer IDs.',
      'Vector Embedding: Placing words in coordinate space so "King" and "Queen" sit close together.',
      'Self-Attention: Dynamic weighting matrix that links "river" to "bank" in "river bank".',
      'Next-Token Prediction: Softmax probability distribution selecting the next word.',
    ],
    experimentGoal: '🧪 Interactive Goal: Hover over different words in the Self-Attention sentence visualizer below to see how context words light up in real-time!',
    quizQuestion: 'How does a Transformer model distinguish between "bank" (financial institution) and "bank" (river side)?',
    quizOptions: [
      'It looks up every word in an Oxford dictionary before answering.',
      'Self-Attention computes contextual weight vectors between "bank" and surrounding words like "river" or "loan".',
      'It picks a random definition every time.',
    ],
    correctOptionIndex: 1,
    quizExplanation: 'Bravo! Self-Attention dynamically re-weighs the word embedding based on the surrounding context tokens in the sentence!',
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

            {/* Key Concepts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t-2 border-slate-200 text-xs">
              {activeStep.keyConcepts.map((concept, cIdx) => (
                <div key={cIdx} className="bg-[#FEFCE8] p-2.5 rounded-xl border border-slate-900 font-bold text-slate-900 flex items-start gap-2 shadow-[2px_2px_0px_0px_#1E293B]">
                  <span className="text-[#818CF8] font-black">•</span>
                  <span>{concept}</span>
                </div>
              ))}
            </div>

            {/* Experiment Goal Callout */}
            <div className="bg-[#4ADE80] text-slate-900 p-3 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#166534] text-xs font-black mt-3">
              {activeStep.experimentGoal}
            </div>
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
