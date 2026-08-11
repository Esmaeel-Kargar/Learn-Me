import React from 'react';
import { Cpu, Zap, Sliders, BookOpen, Volume2, VolumeX, Sparkles, Trophy, Type, Grid, Flame, Bug, Navigation } from 'lucide-react';
import { sound } from '../utils/sound';

export type TabType = 'guided' | 'single' | 'draw' | 'llm' | 'trick' | 'driver' | 'challenges';

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
    { id: 'guided', label: 'Guided Tour', icon: <Sparkles className="w-4 h-4 text-amber-500" />, badge: 'Start' },
    { id: 'single', label: '1. Build AI', icon: <Cpu className="w-4 h-4 text-indigo-500" /> },
    { id: 'draw', label: '2. Pixel AI', icon: <Grid className="w-4 h-4 text-violet-500" /> },
    { id: 'llm', label: '3. LLM Mind', icon: <Flame className="w-4 h-4 text-amber-500" /> },
    { id: 'trick', label: '4. Break AI', icon: <Bug className="w-4 h-4 text-rose-500" /> },
    { id: 'driver', label: '5. AI Driver', icon: <Navigation className="w-4 h-4 text-emerald-500" /> },
    { id: 'challenges', label: 'Quizzes', icon: <Trophy className="w-4 h-4 text-amber-500" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Brand Logo */}
          <div 
            onClick={() => { setActiveTab('guided'); sound.playPulse(440, 0.08); }}
            className="flex items-center gap-2.5 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900 text-base tracking-tight uppercase">AI Inside Out</span>
                <span className="px-1.5 py-0.2 text-[9px] font-black bg-amber-300 text-slate-900 rounded-md uppercase">
                  Interactive
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">Hands-on AI & Neural Network Explorer</p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    sound.playPulse(500, 0.05);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative select-none ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-0.5 px-1.5 py-0.2 bg-amber-300 text-slate-900 text-[9px] font-black rounded-full">
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">AI Glossary</span>
            </button>

            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Disable Sound Effects' : 'Enable Sound Effects'}
              className="p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-2.5 scrollbar-none border-t border-slate-100 pt-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  sound.playPulse(500, 0.05);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
