import React, { useState } from 'react';
import { sound } from '../utils/sound';
import { Type, Sparkles, MapPin, ArrowRight, Layers, HelpCircle, Lightbulb, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface WordPoint {
  id: string;
  word: string;
  x: number; // 0 to 100
  y: number; // 0 to 100
  category: 'royalty' | 'animals' | 'food' | 'tech';
}

const INITIAL_WORDS: WordPoint[] = [
  { id: '1', word: 'King 👑', x: 25, y: 30, category: 'royalty' },
  { id: '2', word: 'Queen 👸', x: 28, y: 70, category: 'royalty' },
  { id: '3', word: 'Man 👨', x: 60, y: 32, category: 'royalty' },
  { id: '4', word: 'Woman 👩', x: 63, y: 72, category: 'royalty' },

  { id: '5', word: 'Dog 🐶', x: 15, y: 15, category: 'animals' },
  { id: '6', word: 'Cat 🐱', x: 20, y: 20, category: 'animals' },
  { id: '7', word: 'Puppy 🐾', x: 12, y: 22, category: 'animals' },

  { id: '8', word: 'Apple 🍎', x: 80, y: 15, category: 'food' },
  { id: '9', word: 'Banana 🍌', x: 85, y: 25, category: 'food' },
  { id: '10', word: 'Pizza 🍕', x: 75, y: 30, category: 'food' },

  { id: '11', word: 'Laptop 💻', x: 75, y: 80, category: 'tech' },
  { id: '12', word: 'Smartphone 📱', x: 82, y: 85, category: 'tech' },
];

export const WordEmbeddingsVisualizer: React.FC = () => {
  const [words, setWords] = useState<WordPoint[]>(INITIAL_WORDS);
  const [newWordInput, setNewWordInput] = useState<string>('');
  const [selectedWord, setSelectedWord] = useState<string | null>('King 👑');
  const [showVectorMath, setShowVectorMath] = useState<boolean>(false);

  // Sentence Attention state
  const [sentenceText, setSentenceText] = useState<string>('The cat sat on the mat because it was tired');
  const [hoveredWordIndex, setHoveredWordIndex] = useState<number | null>(6); // 'it'

  const sentenceWords = sentenceText.trim().split(/\s+/);

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWordInput.trim()) return;

    const newPt: WordPoint = {
      id: `w_${Date.now()}`,
      word: newWordInput.trim(),
      x: Math.floor(Math.random() * 70) + 15,
      y: Math.floor(Math.random() * 70) + 15,
      category: 'tech',
    };

    setWords([...words, newPt]);
    setNewWordInput('');
    sound.playSuccess();
  };

  // Mock attention score matrix between words in sentence
  const getAttentionScore = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return 1.0;
    const w1 = sentenceWords[fromIdx]?.toLowerCase();
    const w2 = sentenceWords[toIdx]?.toLowerCase();

    // High attention links
    if (w1 === 'it' && (w2 === 'cat' || w2 === 'mat')) return 0.95;
    if (w1 === 'tired' && w2 === 'cat') return 0.88;
    if (w1 === 'sat' && (w2 === 'cat' || w2 === 'mat')) return 0.85;

    return 0.15 + (Math.abs(fromIdx - toIdx) % 3) * 0.1;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Module Title Banner */}
      <div className="bg-[#818CF8] rounded-3xl p-6 sm:p-8 text-white border-4 border-[#4338CA] shadow-[8px_8px_0px_0px_#4338CA] relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDE047] text-slate-900 text-xs font-black uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
            <span>Module 4</span>
            <span>•</span>
            <span>Language, LLMs & Transformers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            How LLMs Understand Language: Embeddings & Attention
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base font-medium leading-relaxed">
            Large Language Models (like ChatGPT and Gemini) do not read English text like humans—they convert words into <strong>Vector Embeddings</strong> and use <strong>Self-Attention Mechanisms</strong> to connect context across entire documents!
          </p>
        </div>
      </div>

      {/* "What Does What in Modern LLMs?" Explainer Banner */}
      <div className="bg-[#FEFCE8] rounded-3xl p-6 border-4 border-slate-900 shadow-[8px_8px_0px_0px_#1E293B] space-y-4">
        <h3 className="font-black text-slate-900 text-sm sm:text-base uppercase tracking-tight flex items-center gap-2">
          <Info className="w-5 h-5 text-[#818CF8] stroke-[3]" />
          What Does What? (The LLM Pipeline)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
            <span className="font-black text-[#818CF8] uppercase block mb-1">1. Tokenization</span>
            <p className="text-slate-700 font-semibold">
              Splits text into subword chunks and converts each chunk into a unique integer ID (e.g., "Cat" → 4821).
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
            <span className="font-black text-[#166534] uppercase block mb-1">2. Vector Embeddings</span>
            <p className="text-slate-700 font-semibold">
              Maps Token IDs into a multi-dimensional map where related concepts sit physically close together.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
            <span className="font-black text-[#FB923C] uppercase block mb-1">3. Self-Attention</span>
            <p className="text-slate-700 font-semibold">
              Allows words to look at surrounding words to figure out exact context (e.g., river bank vs money bank).
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
            <span className="font-black text-[#4338CA] uppercase block mb-1">4. Softmax Prediction</span>
            <p className="text-slate-700 font-semibold">
              Generates probability scores across all words in memory to choose the single best next token.
            </p>
          </div>
        </div>
      </div>

      {/* Part 1: Word Vector Embeddings Canvas */}
      <div className="bg-white rounded-3xl p-6 border-4 border-slate-900 shadow-[8px_8px_0px_0px_#1E293B] space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b-2 border-slate-200">
          <div>
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2 uppercase tracking-tight">
              <MapPin className="w-5 h-5 text-[#818CF8]" />
              1. Semantic Embedding Vector Map
            </h3>
            <p className="text-xs font-medium text-slate-700">Notice how "King" and "Queen" cluster close together, far away from "Apple"!</p>
          </div>

          <button
            onClick={() => {
              setShowVectorMath(!showVectorMath);
              sound.playPulse(600, 0.08);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FDE047] hover:bg-yellow-300 text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1E293B] hover:translate-y-0.5 transition-all"
          >
            <Sparkles className="w-4 h-4 text-slate-900" />
            <span>{showVectorMath ? 'Hide Vector Math' : 'Show Vector Math: King - Man + Woman'}</span>
          </button>
        </div>

        {/* Interactive Vector Space Canvas */}
        <div className="relative w-full h-[360px] bg-slate-900 rounded-3xl p-4 border-4 border-slate-900 shadow-[6px_6px_0px_0px_#818CF8] overflow-hidden">
          
          {/* Category Background Clusters */}
          <div className="absolute top-4 left-4 text-[11px] font-mono font-bold text-[#FDE047] space-y-1">
            <p>X-Axis: Royalty & Concepts</p>
            <p>Y-Axis: Gender Vector</p>
          </div>

          {/* Draw Vector Arrow Line if Math Mode is Active */}
          {showVectorMath && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {/* Arrow from King to Queen */}
              <line
                x1="25%"
                y1="30%"
                x2="28%"
                y2="70%"
                stroke="#FDE047"
                strokeWidth="4"
                strokeDasharray="6"
                className="animate-pulse"
              />
              <text x="32%" y="50%" fill="#FDE047" fontSize="13" fontWeight="900" className="uppercase">
                + Gender Vector
              </text>
            </svg>
          )}

          {/* Render Word Nodes */}
          {words.map((w) => {
            const isSelected = selectedWord === w.word;
            return (
              <motion.div
                key={w.id}
                style={{ left: `${w.x}%`, top: `${w.y}%` }}
                onClick={() => {
                  setSelectedWord(w.word);
                  sound.playPulse(500, 0.05);
                }}
                whileHover={{ scale: 1.15 }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-2xl text-xs font-black uppercase tracking-wider border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1E293B] cursor-pointer transition-all select-none ${
                  isSelected
                    ? 'bg-[#FDE047] text-slate-900 z-20 scale-110'
                    : 'bg-white text-slate-900 hover:bg-slate-100'
                }`}
              >
                {w.word}
              </motion.div>
            );
          })}
        </div>

        {/* Add Word Form */}
        <form onSubmit={handleAddWord} className="flex gap-2">
          <input
            type="text"
            value={newWordInput}
            onChange={(e) => setNewWordInput(e.target.value)}
            placeholder="Type a new word (e.g. Robot, Princess, Dragon)..."
            className="flex-1 bg-[#FEFCE8] border-2 border-slate-900 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-extrabold focus:outline-none shadow-[2px_2px_0px_0px_#1E293B]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#4ADE80] hover:bg-[#22c55e] text-slate-900 font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#166534] hover:translate-y-0.5 transition-all"
          >
            Add To Space
          </button>
        </form>

      </div>

      {/* Part 2: Self-Attention Visualizer */}
      <div className="bg-white rounded-3xl p-6 border-4 border-[#FB923C] shadow-[8px_8px_0px_0px_#FB923C] space-y-6">
        
        <div>
          <h3 className="font-black text-slate-900 text-base flex items-center gap-2 uppercase tracking-tight">
            <Layers className="w-5 h-5 text-[#FB923C]" />
            2. The Self-Attention Mechanism (How LLMs Understand Context)
          </h3>
          <p className="text-xs font-medium text-slate-700 mt-1">
            Hover over any word in the sentence below to see which other words the AI connects it to!
          </p>
        </div>

        {/* Input Sentence Box */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-900 uppercase">Sentence Sample:</label>
          <input
            type="text"
            value={sentenceText}
            onChange={(e) => setSentenceText(e.target.value)}
            className="w-full bg-[#FEFCE8] border-2 border-slate-900 rounded-2xl px-4 py-2.5 text-sm font-extrabold text-slate-900 shadow-[2px_2px_0px_0px_#1E293B]"
          />
        </div>

        {/* Interactive Sentence Tokens */}
        <div className="p-6 bg-slate-900 rounded-3xl border-4 border-slate-900 shadow-[6px_6px_0px_0px_#1E293B] space-y-6">
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            {sentenceWords.map((word, idx) => {
              const isHovered = hoveredWordIndex === idx;
              const attention = hoveredWordIndex !== null ? getAttentionScore(hoveredWordIndex, idx) : 0;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => {
                    setHoveredWordIndex(idx);
                    sound.playPulse(400 + idx * 30, 0.03);
                  }}
                  className={`px-3.5 py-2.5 rounded-2xl text-xs font-black border-2 border-slate-900 cursor-pointer transition-all ${
                    isHovered
                      ? 'bg-[#818CF8] text-white scale-110 shadow-[4px_4px_0px_0px_#4338CA]'
                      : attention > 0.6
                      ? 'bg-[#FDE047] text-slate-900 scale-105 shadow-[3px_3px_0px_0px_#1E293B]'
                      : 'bg-white text-slate-900 hover:bg-slate-100 shadow-[2px_2px_0px_0px_#1E293B]'
                  }`}
                >
                  <span className="block text-[9px] text-slate-600 font-mono mb-0.5">[{idx}]</span>
                  <span>{word}</span>
                </div>
              );
            })}
          </div>

          {hoveredWordIndex !== null && (
            <div className="text-center text-xs text-slate-900 font-black uppercase bg-[#FDE047] p-3 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1E293B]">
              Word <span className="underline">"{sentenceWords[hoveredWordIndex]}"</span> is paying high attention to related context tokens!
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
