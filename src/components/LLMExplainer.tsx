import React, { useState } from 'react';
import { Sparkles, Flame, Type, Compass, Network, ArrowRight, Cpu, Layers, Plus, RefreshCw, BookOpen, Sliders } from 'lucide-react';
import { sound } from '../utils/sound';

type LLMStage = 'architecture' | 'tokenizer' | 'embeddings' | 'attention' | 'generation' | 'trainer';

interface CustomTrainingPair {
  id: string;
  prompt: string;
  expectedNextWord: string;
}

export const LLMExplainer: React.FC = () => {
  const [activeStage, setActiveStage] = useState<LLMStage>('architecture');

  // Stage 0: Architecture View Active Layer Highlight
  const [highlightedLayer, setHighlightedLayer] = useState<string>('attention');

  // Stage 1: Tokenizer State
  const [inputText, setInputText] = useState<string>('Artificial intelligence is transforming the world.');
  
  // Stage 2: Embedding Explorer State
  const [selectedWord, setSelectedWord] = useState<string>('King');
  
  // Stage 3: Self-Attention State
  const [attentionSentence, setAttentionSentence] = useState<string>('The river bank was flooded with muddy water.');
  const [hoveredTokenIndex, setHoveredTokenIndex] = useState<number | null>(1); // 'river' or 'bank'

  // Stage 4: Next-Token Predictor State
  const [temperature, setTemperature] = useState<number>(0.7);
  const [promptText, setPromptText] = useState<string>('The astronaut landed on the');
  const [generatedTokens, setGeneratedTokens] = useState<string[]>([]);

  // Stage 5: Custom Fine-Tuning & Model Training State
  const [customWordInput, setCustomWordInput] = useState<string>('quantum');
  const [customDataset, setCustomDataset] = useState<CustomTrainingPair[]>([
    { id: '1', prompt: 'The capital of France is', expectedNextWord: 'Paris' },
    { id: '2', prompt: 'Python is a popular programming', expectedNextWord: 'language' },
    { id: '3', prompt: 'In quantum physics, particles can be in', expectedNextWord: 'superposition' },
  ]);
  const [newPromptInput, setNewPromptInput] = useState<string>('');
  const [newCompletionInput, setNewCompletionInput] = useState<string>('');
  const [trainingLoss, setTrainingLoss] = useState<number>(1.85);
  const [trainingEpoch, setTrainingEpoch] = useState<number>(0);

  // Tokenization breakdown helper
  const tokens = inputText.trim().split(/\s+/).filter(Boolean).map((word, idx) => ({
    id: idx * 4821 + 1024,
    text: word,
    subtokens: word.length > 7 ? [word.slice(0, 4), word.slice(4)] : [word],
  }));

  // Embedding vectors mock data (3D space coordinates)
  const embeddingSpace = [
    { word: 'King', category: 'Royalty', x: 80, y: 30, z: 90, traits: ['+Male', '+Royal', '+Human'] },
    { word: 'Queen', category: 'Royalty', x: 82, y: 88, z: 92, traits: ['+Female', '+Royal', '+Human'] },
    { word: 'Man', category: 'Gender', x: 20, y: 25, z: 30, traits: ['+Male', '-Royal', '+Human'] },
    { word: 'Woman', category: 'Gender', x: 22, y: 85, z: 32, traits: ['+Female', '-Royal', '+Human'] },
    { word: 'Apple', category: 'Food', x: -70, y: -40, z: -10, traits: ['+Fruit', '+Edible', '-Human'] },
    { word: 'Banana', category: 'Food', x: -65, y: -45, z: -12, traits: ['+Fruit', '+Edible', '-Human'] },
  ];

  const activeEmbedding = embeddingSpace.find((e) => e.word.toLowerCase() === selectedWord.toLowerCase()) || embeddingSpace[0];

  // Self-attention tokens and attention weights
  const attentionWords = attentionSentence.split(' ');
  const getAttentionWeights = (idx: number | null) => {
    if (idx === null) return new Array(attentionWords.length).fill(0.1);
    
    // If hovering on 'bank' or 'river'
    const targetWord = attentionWords[idx]?.toLowerCase().replace(/[^a-z]/g, '');
    
    return attentionWords.map((w, i) => {
      const cleanW = w.toLowerCase().replace(/[^a-z]/g, '');
      if (i === idx) return 1.0;
      if (targetWord === 'bank' && (cleanW === 'river' || cleanW === 'water' || cleanW === 'flooded')) return 0.85;
      if (targetWord === 'river' && (cleanW === 'flooded' || cleanW === 'water' || cleanW === 'bank')) return 0.75;
      if (cleanW === 'the' || cleanW === 'was' || cleanW === 'with') return 0.15;
      return 0.35;
    });
  };

  const currentAttentionWeights = getAttentionWeights(hoveredTokenIndex);

  // Next Token candidates
  const nextTokenCandidates = [
    { word: 'moon', baseProb: 0.62 },
    { word: 'surface', baseProb: 0.22 },
    { word: 'planet', baseProb: 0.11 },
    { word: 'rocket', baseProb: 0.04 },
    { word: 'pizza', baseProb: 0.008 },
    { word: 'banana', baseProb: 0.002 },
  ];

  // Calculate temperature scaled probabilities
  const T = Math.max(0.05, temperature);
  const logits = nextTokenCandidates.map((c) => Math.log(c.baseProb + 1e-6));
  const expScaled = logits.map((l) => Math.exp(l / T));
  const sumExp = expScaled.reduce((a, b) => a + b, 0);
  const scaledCandidates = nextTokenCandidates.map((c, i) => ({
    ...c,
    prob: expScaled[i] / sumExp,
  }));

  const handleGenerateWord = () => {
    const rand = Math.random();
    let cum = 0;
    let chosen = scaledCandidates[0].word;
    for (const cand of scaledCandidates) {
      cum += cand.prob;
      if (rand <= cum) {
        chosen = cand.word;
        break;
      }
    }
    setGeneratedTokens((prev) => [...prev, chosen]);
    setPromptText((prev) => `${prev} ${chosen}`);
    sound.playPulse(500 + Math.random() * 200, 0.05);
  };

  // Add Custom Training Sentence
  const handleAddTrainingPair = () => {
    if (!newPromptInput.trim() || !newCompletionInput.trim()) return;
    const newPair: CustomTrainingPair = {
      id: `custom-${Date.now()}`,
      prompt: newPromptInput.trim(),
      expectedNextWord: newCompletionInput.trim(),
    };
    setCustomDataset((prev) => [...prev, newPair]);
    setNewPromptInput('');
    setNewCompletionInput('');
    sound.playPulse(600, 0.05);
  };

  // Run Custom Model Training Epoch
  const handleRunTrainingEpoch = () => {
    setTrainingEpoch((prev) => prev + 1);
    setTrainingLoss((prev) => Math.max(0.08, prev * 0.72));
    sound.playSuccess();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-300 text-slate-900 text-xs font-black uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-amber-900" />
            <span>Lesson 3: The LLM Mind</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Inside an LLM: Full Architecture & Custom Model Trainer
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base font-medium leading-relaxed">
            Unpack how Large Language Models work from the ground up: explore the <strong>Transformer Block Architecture</strong>, tokenize words, navigate <strong>Embedding Spaces</strong>, analyze <strong>Self-Attention Layers</strong>, and train the model on custom word datasets!
          </p>
        </div>
      </div>

      {/* Interactive LLM Pipeline Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        {[
          { id: 'architecture', label: '1. Architecture', desc: 'Transformer Layers', icon: <Cpu className="w-4 h-4 text-amber-500" /> },
          { id: 'tokenizer', label: '2. Tokenizer', desc: 'Text → Numbers', icon: <Type className="w-4 h-4 text-indigo-600" /> },
          { id: 'embeddings', label: '3. Embeddings', desc: 'Vector Space Map', icon: <Compass className="w-4 h-4 text-purple-600" /> },
          { id: 'attention', label: '4. Self-Attention', desc: 'Context Linker', icon: <Network className="w-4 h-4 text-pink-600" /> },
          { id: 'generation', label: '5. Generator', desc: 'Temperature Softmax', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
          { id: 'trainer', label: '6. Model Trainer', desc: 'Train New Words', icon: <Sliders className="w-4 h-4 text-emerald-600" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveStage(tab.id as LLMStage);
              sound.playPulse(500, 0.05);
            }}
            className={`p-3 rounded-xl text-left transition-all cursor-pointer ${
              activeStage === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50/70 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs mb-0.5">
              {tab.icon}
              <span className={activeStage === tab.id ? 'text-white' : 'text-slate-900'}>{tab.label}</span>
            </div>
            <p className={`text-[10px] ${activeStage === tab.id ? 'text-indigo-100' : 'text-slate-500'}`}>
              {tab.desc}
            </p>
          </button>
        ))}
      </div>

      {/* STAGE 0: TRANSFORMER ARCHITECTURE DIAGRAM */}
      {activeStage === 'architecture' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              Full Transformer Neural Architecture (GPT / Gemini Model)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Click any architectural layer to highlight how data flows from input prompt to generated token output.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Transformer Neural Layer Stack Diagram */}
            <div className="lg:col-span-6 space-y-3">
              {[
                { id: 'softmax', name: '7. Softmax & Output Head', desc: 'Converts final vectors into word probabilities (0-100%)', color: 'bg-amber-500' },
                { id: 'norm2', name: '6. Layer Normalization & Residuals', desc: 'Stabilizes gradient signals through deep network layers', color: 'bg-emerald-600' },
                { id: 'ffn', name: '5. Feed-Forward Neural Net (FFN)', desc: 'Processes token features through multi-layer perceptron weights', color: 'bg-blue-600' },
                { id: 'attention', name: '4. Multi-Head Self-Attention', desc: 'Allows tokens to communicate context across entire prompt', color: 'bg-pink-600' },
                { id: 'pos', name: '3. Positional Encodings', desc: 'Injects sequence order (Word 1, Word 2, Word 3)', color: 'bg-purple-600' },
                { id: 'embedding', name: '2. Token Embeddings', desc: 'Maps token integer IDs into 4096-dimensional vector space', color: 'bg-indigo-600' },
                { id: 'tokenizer', name: '1. Byte-Pair Tokenizer', desc: 'Slices string text into vocabulary token IDs', color: 'bg-slate-800' },
              ].map((layer) => {
                const isSelected = highlightedLayer === layer.id;
                return (
                  <button
                    key={layer.id}
                    onClick={() => {
                      setHighlightedLayer(layer.id);
                      sound.playPulse(400, 0.04);
                    }}
                    className={`w-full p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                      isSelected
                        ? `${layer.color} text-white ring-2 ring-indigo-400 shadow-md`
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="font-black text-xs">{layer.name}</div>
                    <div className={`text-[11px] ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {layer.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Layer Deep Dive Explanation Card */}
            <div className="lg:col-span-6 bg-slate-900 text-white rounded-3xl p-6 space-y-4 border border-slate-800">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                Layer Functional Explanation
              </span>

              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
                <h3 className="text-lg font-black text-indigo-300 capitalize">
                  {highlightedLayer.toUpperCase()} Layer
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {highlightedLayer === 'softmax' && 'The Softmax layer takes raw output scores (logits) from the neural network and normalizes them into a probability distribution summing to 1.0 (100%).'}
                  {highlightedLayer === 'norm2' && 'Layer Normalization prevents numbers inside the model from becoming too large or small, allowing neural networks to stack 96+ layers without exploding or vanishing gradients.'}
                  {highlightedLayer === 'ffn' && 'The Feed-Forward Neural Network consists of dense linear layers with GELU activations. It stores world knowledge and facts learned during pre-training.'}
                  {highlightedLayer === 'attention' && 'Multi-Head Attention runs multiple self-attention mechanisms in parallel, allowing the model to focus on grammar, syntax, and long-range topic context simultaneously.'}
                  {highlightedLayer === 'pos' && 'Since transformers process all tokens simultaneously (parallel computation), Positional Encodings add sine/cosine wave signals so the model knows word order.'}
                  {highlightedLayer === 'embedding' && 'Token Embeddings project sparse token IDs into dense numerical vector arrays (e.g. 4096 numbers per word), capturing semantic relationships.'}
                  {highlightedLayer === 'tokenizer' && 'The Tokenizer breaks incoming natural language text into standardized token chunks (words, subwords, or punctuation) mapped to integers.'}
                </p>
              </div>

              <div className="p-4 bg-indigo-950/60 rounded-2xl border border-indigo-800/60 text-xs text-indigo-200 space-y-1">
                <span className="font-bold block text-amber-300">💡 Deep Learning Architecture Fact:</span>
                <p>
                  Modern models like Gemini 1.5 Pro and GPT-4 repeat the Attention + FFN block dozens of times in sequence to solve complex reasoning problems!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 1: TOKENIZER */}
      {activeStage === 'tokenizer' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Type className="w-5 h-5 text-indigo-600" />
              Step 2: Tokenization (Converting Words to Numbers)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Computers cannot read letters. The LLM splits your text into <strong>Tokens</strong> (word parts) and converts each token into a unique <strong>Integer ID</strong> in its vocabulary index.
            </p>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-700 uppercase">Type Any Custom Sentence to Tokenize:</label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full text-sm font-semibold p-3.5 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
              placeholder="Type something..."
            />

            {/* Tokenized Breakdown Output */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Vocabulary Token IDs:</span>
              <div className="flex flex-wrap gap-2">
                {tokens.map((tok, idx) => (
                  <div key={idx} className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-2xl text-center space-y-1">
                    <span className="text-xs font-bold text-indigo-900 block font-mono">"{tok.text}"</span>
                    <span className="text-[10px] font-mono font-black text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-md block">
                      ID: {tok.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1 font-medium">
              <span className="font-bold block">💡 Did You Know?</span>
              <p>
                1 Token is roughly 4 characters or 0.75 words. Long words like "transformation" get sliced into subword chunks like "transform" + "ation" so the AI can handle words it has never seen before!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: VECTOR EMBEDDINGS */}
      {activeStage === 'embeddings' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-600" />
              Step 3: Vector Embeddings (Mapping Meaning into Space)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Token IDs are converted into high-dimensional numerical coordinates called <strong>Embeddings</strong>. Similar concepts (like "King" and "Queen") sit right next to each other in vector space!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Word Selector & Vector Trait Explorer */}
            <div className="lg:col-span-5 space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase">Select a Word Vector to Inspect:</label>
              <div className="grid grid-cols-2 gap-2">
                {embeddingSpace.map((item) => (
                  <button
                    key={item.word}
                    onClick={() => {
                      setSelectedWord(item.word);
                      sound.playPulse(450, 0.05);
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      selectedWord.toLowerCase() === item.word.toLowerCase()
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-bold text-xs block">{item.word}</span>
                    <span className={`text-[10px] ${selectedWord.toLowerCase() === item.word.toLowerCase() ? 'text-purple-200' : 'text-slate-500'}`}>
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>

              {/* Vector Arithmetic Example Box */}
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-2 text-xs">
                <span className="font-bold text-purple-900 block uppercase">✨ Famous Vector Math Formula:</span>
                <p className="font-mono font-black text-purple-800 bg-purple-100 p-2.5 rounded-xl border border-purple-300 text-center">
                  Vector("King") - Vector("Man") + Vector("Woman") ≈ Vector("Queen")
                </p>
                <p className="text-slate-600 font-medium text-[11px]">
                  By subtracting male traits from "King" and adding female traits, the vector moves directly to the coordinates for "Queen"!
                </p>
              </div>
            </div>

            {/* Vector Coordinate Visualizer Box */}
            <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-6 text-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-purple-300 uppercase">3D Vector Coordinate Space</span>
                <span className="text-xs font-mono text-slate-400">Word: "{activeEmbedding.word}"</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold block">X Axis (Gender)</span>
                  <span className="text-lg font-black text-indigo-400 font-mono">{activeEmbedding.x}</span>
                </div>
                <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold block">Y Axis (Royalty)</span>
                  <span className="text-lg font-black text-purple-400 font-mono">{activeEmbedding.y}</span>
                </div>
                <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold block">Z Axis (Humanity)</span>
                  <span className="text-lg font-black text-pink-400 font-mono">{activeEmbedding.z}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">High-Dimensional Feature Traits:</span>
                <div className="flex flex-wrap gap-2">
                  {activeEmbedding.traits.map((trait, tIdx) => (
                    <span key={tIdx} className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-emerald-400">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: SELF-ATTENTION */}
      {activeStage === 'attention' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Network className="w-5 h-5 text-pink-600" />
              Step 4: Self-Attention (Connecting Context Words)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Hover over any word below to see how <strong>Self-Attention</strong> connects it to other context words in the sentence (e.g. figuring out if "bank" means a river bank or a money bank!).
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Sample Sentence:</span>
              <button
                onClick={() => {
                  setAttentionSentence(
                    attentionSentence.includes('river')
                      ? 'The bank approved the loan for the new house.'
                      : 'The river bank was flooded with muddy water.'
                  );
                  setHoveredTokenIndex(1);
                  sound.playPulse(500, 0.05);
                }}
                className="text-xs font-bold text-pink-600 underline hover:text-pink-700 font-mono"
              >
                Switch Sentence Context
              </button>
            </div>

            {/* Sentence Tokens with Attention Highlights */}
            <div className="p-6 bg-slate-900 rounded-3xl text-white flex flex-wrap gap-3 items-center justify-center min-h-[120px]">
              {attentionWords.map((word, idx) => {
                const weight = currentAttentionWeights[idx] || 0.1;
                const isHovered = hoveredTokenIndex === idx;

                return (
                  <button
                    key={idx}
                    onMouseEnter={() => setHoveredTokenIndex(idx)}
                    className={`px-3.5 py-2 rounded-2xl font-black text-sm transition-all transform ${
                      isHovered
                        ? 'bg-pink-500 text-white scale-110 ring-4 ring-pink-400/30'
                        : weight > 0.6
                        ? 'bg-pink-600/80 text-white scale-105'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {word}
                    <span className="block text-[9px] font-mono opacity-80">
                      {Math.round(weight * 100)}%
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-200 text-xs text-pink-900 font-medium">
              <span className="font-bold block">💡 How Attention Solves Ambiguity:</span>
              <p>
                When looking at the word <strong>"bank"</strong>, the self-attention layer assigns an 85% attention weight to <strong>"river"</strong> and <strong>"flooded"</strong>, telling the model that "bank" here means a river bank!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 4: NEXT-TOKEN PREDICTOR & TEMPERATURE */}
      {activeStage === 'generation' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Step 5: Next-Token Predictor & Temperature Engine
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              The LLM evaluates all words in its vocabulary, assigns probabilities via <strong>Softmax</strong>, and selects the next token. Adjust the <strong>Temperature Dial</strong> to see how randomness changes!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Prompt Output & Controls */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Input Prompt:</label>
                <input
                  type="text"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="w-full text-sm font-semibold p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              {/* Temperature Control Dial */}
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">Temperature Dial ($T = {temperature.toFixed(2)}$)</span>
                  <span className="font-black text-xs px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    {temperature < 0.3 ? '🤖 Strict & Predictable' : temperature < 1.0 ? '💬 Natural Human' : '🎨 Creative & Random'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="2.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>0.05 (Deterministic)</span>
                  <span>0.70 (Natural)</span>
                  <span>2.00 (High Randomness)</span>
                </div>
              </div>

              <button
                onClick={handleGenerateWord}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Generate Next Word
              </button>
            </div>

            {/* Right: Softmax Token Probabilities Bar Charts */}
            <div className="lg:col-span-5 bg-slate-900 rounded-3xl p-5 text-white space-y-3">
              <span className="text-xs font-bold text-amber-300 uppercase block">
                Softmax Token Probabilities
              </span>

              <div className="space-y-2.5">
                {scaledCandidates.map((cand, idx) => {
                  const pct = Math.round(cand.prob * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-200 font-bold">"{cand.word}"</span>
                        <span className="text-amber-400 font-black">{pct}%</span>
                      </div>
                      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <div
                          className="h-full bg-amber-400 transition-all duration-200"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 5: CUSTOM MODEL TRAINING & FINE-TUNING SANDBOX */}
      {activeStage === 'trainer' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600" />
                Step 6: Train & Fine-Tune the LLM on Custom Sentences
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Add new training sentence pairs to teach the LLM custom domain knowledge and reduce Cross-Entropy Loss!
              </p>
            </div>

            <button
              onClick={handleRunTrainingEpoch}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Run Training Epoch
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Custom Dataset Builder */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-slate-900 uppercase block">1. Add Custom Prompt & Completion Pair:</span>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-600">Prompt Context:</span>
                  <input
                    type="text"
                    value={newPromptInput}
                    onChange={(e) => setNewPromptInput(e.target.value)}
                    placeholder="e.g. 'The capital of Japan is'"
                    className="w-full text-xs font-bold p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-600">Expected Next Word:</span>
                  <input
                    type="text"
                    value={newCompletionInput}
                    onChange={(e) => setNewCompletionInput(e.target.value)}
                    placeholder="e.g. 'Tokyo'"
                    className="w-full text-xs font-bold p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  onClick={handleAddTrainingPair}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add to Training Dataset
                </button>
              </div>

              {/* Active Training Dataset List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 uppercase">Current Fine-Tuning Dataset ({customDataset.length} items):</span>
                <div className="space-y-2">
                  {customDataset.map((item) => (
                    <div key={item.id} className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-medium text-slate-800">
                      <div>
                        <span className="font-bold text-slate-900 font-mono">"{item.prompt}"</span> → <strong className="text-emerald-700">"{item.expectedNextWord}"</strong>
                      </div>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md font-bold uppercase">
                        Learned
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Model Training Loss & Weights Monitor */}
            <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-5 space-y-4 border border-slate-800">
              <span className="text-xs font-bold text-amber-300 uppercase block">
                Model Loss & Gradient Metrics
              </span>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold block">Training Epoch</span>
                  <span className="text-2xl font-black text-amber-300 font-mono">{trainingEpoch}</span>
                </div>

                <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold block">Cross-Entropy Loss</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">{trainingLoss.toFixed(3)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-300 block">Training Progress (Loss Reduction):</span>
                <div className="h-3 w-full bg-slate-800 rounded-full border border-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, (1 - trainingLoss / 2.0) * 100))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Lower loss = Higher accuracy predicting custom words!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

