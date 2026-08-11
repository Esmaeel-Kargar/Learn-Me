import React, { useState } from 'react';
import { TabType } from './Header';
import { sound } from '../utils/sound';
import { SingleNeuronVisualizer } from './SingleNeuronVisualizer';
import { PixelRecognizer } from './PixelRecognizer';
import { LLMExplainer } from './LLMExplainer';
import { TrickTheAIArena } from './TrickTheAIArena';
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
      'Weights (w): Importance knobs scaling the influence of each input.',
      'Bias (b): Baseline threshold shifting decision boundaries.',
      'Activation (σ): Gate function squashing raw weighted sums.',
    ],
    experimentGoal: '🧪 Interactive Goal: Select the "Email Spam Filter" or create custom input features below to observe how weights scale score outputs in real-time!',
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
    title: 'Lesson 2: Pixel AI & Computer Vision',
    badge: 'Step 2 of 4',
    subtitle: 'Images are processed by AI models as 2D pixel matrices. Active pixels multiply by weight heatmaps to recognize shapes and objects.',
    keyConcepts: [
      'Pixel Matrix: Converting images into 0/1 grids or grayscale numbers.',
      'Weight Heatmap: Positive weights reward pixel patterns; negative weights penalize off-pixels.',
      'Supervised Learning: Teaching the AI by adjusting weights towards target shapes.',
    ],
    experimentGoal: '🧪 Interactive Goal: Click pixel boxes on the 5x5 canvas to draw custom shapes, then click "Teach: This is X" to update weights!',
    quizQuestion: 'How does an image recognition neural network represent a picture internally?',
    quizOptions: [
      'As a physical grid of colored numbers (matrices) fed into math weight layers.',
      'By looking at the picture through a physical camera glass.',
      'By searching Google Images in the background.',
    ],
    correctOptionIndex: 0,
    quizExplanation: 'Spot on! Computers represent images as multi-dimensional numerical matrices.',
  },
  {
    id: 3,
    title: 'Lesson 3: The LLM Transformer Architecture',
    badge: 'Step 3 of 4',
    subtitle: 'Large Language Models process text using Token Integer IDs, 2D Semantic Embeddings, Self-Attention matrices, and Softmax Probability wheels.',
    keyConcepts: [
      'Tokenization: Converting text chunks into integer IDs.',
      'Semantic Vectors: Mapping "King - Man + Woman = Queen" in coordinate space.',
      'Self-Attention: Dynamic context links between words in sentences.',
      'Temperature: Scaling probability distributions for creative text.',
    ],
    experimentGoal: '🧪 Interactive Goal: Try the 4 Transformer tabs below to inspect Token IDs, vector space distances, and Self-Attention context connections!',
    quizQuestion: 'How does Self-Attention help a Transformer understand the word "bank" in "river bank"?',
    quizOptions: [
      'It looks up every word in a dictionary.',
      'Self-Attention links "bank" with context words like "river" to adjust its semantic meaning vector.',
      'It picks a definition at random.',
    ],
    correctOptionIndex: 1,
    quizExplanation: 'Exactly! Self-Attention dynamically calculates contextual weights between words.',
  },
  {
    id: 4,
    title: 'Lesson 4: Adversarial AI & Failure Modes',
    badge: 'Step 4 of 4',
    subtitle: 'Explore how AI models can be tricked by biased datasets, single-pixel noise attacks, and ungrounded LLM hallucinations.',
    keyConcepts: [
      'Data Bias: Skewed training data leads to incorrect shortcuts.',
      'Trojan Pixels: Crafted noise overloading specific internal neuron paths.',
      'RAG Grounding: Verifying factual sources before text generation.',
    ],
    experimentGoal: '🧪 Interactive Goal: Toggle the Trojan Pixel and RAG Grounding controls to see how AI predictions flip!',
    quizQuestion: 'Why do LLMs hallucinate fake information when asked complex questions?',
    quizOptions: [
      'Because they generate text based on word probabilities rather than verifying factual data sources without RAG.',
      'Because the computer battery is low.',
      'Because they are trying to trick humans on purpose.',
    ],
    correctOptionIndex: 0,
    quizExplanation: 'Bravo! Without factual grounding context, LLMs generate text purely by guessing probabilistic next words.',
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
      
      {/* Tour Header Progress Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              {activeStep.badge}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 uppercase tracking-tight">{activeStep.title}</h1>
            <p className="text-xs sm:text-sm font-medium text-slate-600 max-w-2xl mt-1 leading-relaxed">{activeStep.subtitle}</p>

            {/* Key Concepts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
              {activeStep.keyConcepts.map((concept, cIdx) => (
                <div key={cIdx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-medium text-slate-700 flex items-start gap-2">
                  <span className="text-indigo-600 font-black">•</span>
                  <span>{concept}</span>
                </div>
              ))}
            </div>

            {/* Goal Banner */}
            <div className="bg-emerald-50 text-emerald-900 p-3 rounded-2xl border border-emerald-200 text-xs font-bold mt-3">
              {activeStep.experimentGoal}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevStep}
              disabled={currentStepIdx === 0}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 transition-all font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextStep}
              disabled={currentStepIdx === STEPS.length - 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all"
            >
              <span>Next Lesson</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Progress Dots */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          {STEPS.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => {
                setCurrentStepIdx(idx);
                setSelectedAnswerIdx(null);
                setQuizSubmitted(false);
              }}
              className={`h-2.5 rounded-full cursor-pointer transition-all ${
                idx === currentStepIdx
                  ? 'bg-indigo-600'
                  : idx < currentStepIdx
                  ? 'bg-emerald-500'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

      </div>

      {/* Render Active Lesson Component */}
      <div className="space-y-8">
        {currentStepIdx === 0 && <SingleNeuronVisualizer />}
        {currentStepIdx === 1 && <PixelRecognizer />}
        {currentStepIdx === 2 && <LLMExplainer />}
        {currentStepIdx === 3 && <TrickTheAIArena />}
      </div>

      {/* Quiz Checkpoint Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-black text-xs">
            01
          </div>
          <h3 className="font-black text-base text-slate-900 uppercase">Knowledge Checkpoint</h3>
        </div>

        <p className="text-sm font-bold text-slate-800">{activeStep.quizQuestion}</p>

        <div className="space-y-2.5">
          {activeStep.quizOptions.map((opt, oIdx) => {
            const isSelected = selectedAnswerIdx === oIdx;
            const isCorrect = oIdx === activeStep.correctOptionIndex;

            let btnStyle = 'bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100';
            if (quizSubmitted) {
              if (isCorrect) btnStyle = 'bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold';
              else if (isSelected) btnStyle = 'bg-rose-100 border border-rose-300 text-rose-900 font-bold';
            }

            return (
              <button
                key={oIdx}
                onClick={() => handleAnswerSelect(oIdx)}
                className={`w-full p-4 rounded-2xl text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${btnStyle}`}
              >
                <span>{opt}</span>
                {quizSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>

        {quizSubmitted && (
          <div className={`p-4 rounded-2xl text-xs sm:text-sm border space-y-1 ${
            selectedAnswerIdx === activeStep.correctOptionIndex
              ? 'bg-amber-50 border-amber-200 text-slate-800'
              : 'bg-rose-50 border-rose-200 text-slate-800'
          }`}>
            <span className="font-bold flex items-center gap-1 text-sm uppercase">
              {selectedAnswerIdx === activeStep.correctOptionIndex ? '🎉 Excellent Job!' : '💡 Not quite!'}
            </span>
            <p className="font-medium text-slate-700">{activeStep.quizExplanation}</p>
          </div>
        )}

      </div>

    </div>
  );
};
