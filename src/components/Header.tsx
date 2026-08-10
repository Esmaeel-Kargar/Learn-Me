import React from 'react';
import { Cpu, Zap, Sliders, BookOpen, Volume2, VolumeX, Sparkles, Trophy, Type } from 'lucide-react';
import { sound } from '../utils/sound';

export type TabType = 'guided' | 'single' | 'network' | 'sandbox' | 'embeddings' | 'challenges';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onOpenGlossary: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  soundEnabled,
  setSoundEnabled,
  onOpenGlossary,
}) => {
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playPulse(600, 0.1);
  };

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'guided', label: 'Guided Tour', icon: <Sparkles className="w-4 h-4" />, badge: 'Start Here' },
    { id: 'single', label: '1. The Neuron', icon: <Cpu className="w-4 h-4" /> },
    { id: 'network', label: '2. Multi-Layer Net', icon: <Zap className="w-4 h-4" /> },
    { id: 'sandbox', label: '3. Training Playground', icon: <Sliders className="w-4 h-4" /> },
    { id: 'embeddings', label: '4. AI & Embeddings', icon: <Type className="w-4 h-4" /> },
    { id: 'challenges', label: 'Mini-Challenges', icon: <Trophy className="w-4 h-4 text-amber-500" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b-4 border-[#FDE047] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2">
          
          {/* Brand / Logo */}
          <div 
            onClick={() => { setActiveTab('guided'); sound.playPulse(440, 0.08); }}
            className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-[#818CF8] border-2 border-[#4338CA] flex items-center justify-center text-white shadow-[4px_4px_0px_0px_#4338CA] group-hover:translate-y-0.5 transition-transform">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 text-xl tracking-tight uppercase">AI Inside Out <span className="text-[#818CF8]">v1.0</span></span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wider bg-[#FDE047] text-slate-900 rounded-full border-2 border-slate-900 uppercase shadow-[2px_2px_0px_0px_#1E293B]">
                  Interactive
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 hidden sm:block">Demystifying Neural Networks for Beginners</p>
            </div>
          </div>

          {/* Center Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-[#FEFCE8] p-1.5 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1E293B]">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    sound.playPulse(500, 0.05);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all relative select-none ${
                    isActive
                      ? 'bg-[#818CF8] text-white shadow-[2px_2px_0px_0px_#4338CA] border-2 border-[#4338CA]'
                      : 'text-slate-800 hover:text-slate-900 hover:bg-[#FDE047]/40'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 bg-[#FDE047] text-slate-900 text-[9px] font-black rounded-full border border-slate-900">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onOpenGlossary();
                sound.playPulse(520, 0.05);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-[#FB923C] hover:bg-[#f97316] border-2 border-[#c2410c] shadow-[3px_3px_0px_0px_#c2410c] hover:translate-y-0.5 active:translate-y-1 transition-all"
            >
              <BookOpen className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">AI Glossary</span>
            </button>

            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Disable Audio Effects' : 'Enable Audio Effects'}
              className="p-2 rounded-xl text-slate-900 bg-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1E293B] hover:translate-y-0.5 active:translate-y-1 transition-all"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#4ADE80]" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-3 scrollbar-none border-t-2 border-slate-200 pt-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  sound.playPulse(500, 0.05);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#818CF8] text-white border-2 border-[#4338CA] shadow-[2px_2px_0px_0px_#4338CA]'
                    : 'bg-white text-slate-800 border-2 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
