import React, { useState } from 'react';
import { Header, TabType } from './components/Header';
import { GuidedTour } from './components/GuidedTour';
import { SingleNeuronVisualizer } from './components/SingleNeuronVisualizer';
import { NetworkArchitectureVisualizer } from './components/NetworkArchitectureVisualizer';
import { TrainingPlayground } from './components/TrainingPlayground';
import { WordEmbeddingsVisualizer } from './components/WordEmbeddingsVisualizer';
import { MiniChallenges } from './components/MiniChallenges';
import { ConceptGlossaryModal } from './components/ConceptGlossaryModal';
import { sound } from './utils/sound';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('guided');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#FEFCE8] text-[#1E293B] font-sans antialiased flex flex-col selection:bg-[#818CF8] selection:text-white">
      
      {/* Top Application Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
      />

      {/* Main Interactive Playground Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'guided' && <GuidedTour onNavigateTab={setActiveTab} />}
        {activeTab === 'single' && <SingleNeuronVisualizer />}
        {activeTab === 'network' && <NetworkArchitectureVisualizer />}
        {activeTab === 'sandbox' && <TrainingPlayground />}
        {activeTab === 'embeddings' && <WordEmbeddingsVisualizer />}
        {activeTab === 'challenges' && <MiniChallenges />}
      </main>

      {/* Plain English Glossary Modal */}
      <ConceptGlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      {/* Footer Branding & Quick Credits */}
      <footer className="border-t-4 border-slate-900 bg-white py-6 mt-12 text-center text-xs font-bold text-slate-700">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4 uppercase tracking-wider">
          <span className="font-black text-slate-900">AI Inside Out — Pure Client Neural Network Visualizer</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setIsGlossaryOpen(true); sound.playPulse(500, 0.05); }}
              className="hover:text-[#818CF8] underline decoration-2 decoration-[#FDE047] font-black transition-colors"
            >
              Glossary of Terms
            </button>
            <span>•</span>
            <span className="text-slate-500">Zero Backend Server Needed</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
