import React, { useState } from 'react';
import { GLOSSARY_ITEMS } from '../data/glossary';
import { sound } from '../utils/sound';
import { X, Search, BookOpen, Lightbulb, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConceptGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConceptGlossaryModal: React.FC<ConceptGlossaryModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredItems = GLOSSARY_ITEMS.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.simpleDefinition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#FEFCE8] rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-[12px_12px_0px_0px_#1E293B] border-4 border-slate-900 overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 bg-[#818CF8] text-white flex items-center justify-between border-b-4 border-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FDE047] text-slate-900 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-slate-900 stroke-[3]" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-white">AI & Neural Networks Glossary</h2>
                <p className="text-xs font-bold text-indigo-100">Simple plain-English analogies for beginners</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B] transition-all"
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="p-4 bg-white border-b-4 border-slate-900 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-900 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[3]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search terms (e.g. Bias, Weight, Overfitting)..."
                className="w-full bg-[#FEFCE8] border-2 border-slate-900 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-900 font-extrabold focus:outline-none shadow-[2px_2px_0px_0px_#1E293B]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
              {(['all', 'basics', 'architecture', 'training', 'advanced'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-black uppercase tracking-wider whitespace-nowrap transition-all border-2 border-slate-900 ${
                    selectedCategory === cat
                      ? 'bg-[#FDE047] text-slate-900 shadow-[2px_2px_0px_0px_#1E293B]'
                      : 'bg-white text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Content Scroll Area */}
          <div className="p-6 overflow-y-auto space-y-4 divide-y-2 divide-slate-200">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isExpanded = expandedTerm === item.term;

                return (
                  <div
                    key={item.term}
                    onClick={() => {
                      setExpandedTerm(isExpanded ? null : item.term);
                      sound.playPulse(500, 0.03);
                    }}
                    className="pt-4 first:pt-0 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight group-hover:text-[#818CF8] transition-colors">
                        {item.term}
                      </h3>
                      <ChevronRight
                        className={`w-5 h-5 text-slate-900 stroke-[3] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </div>

                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">{item.simpleDefinition}</p>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 space-y-2 pt-2 border-t-2 border-slate-200 text-xs"
                      >
                        <div className="p-3.5 bg-white rounded-2xl border-2 border-slate-900 text-slate-900 font-medium shadow-[3px_3px_0px_0px_#1E293B] space-y-1">
                          <span className="font-black uppercase flex items-center gap-1 text-slate-900">
                            <Lightbulb className="w-4 h-4 text-[#FB923C]" /> Everyday Analogy:
                          </span>
                          <p>{item.analogy}</p>
                        </div>

                        <div className="p-3.5 bg-[#4ADE80] rounded-2xl border-2 border-slate-900 text-slate-900 font-extrabold shadow-[3px_3px_0px_0px_#166534] space-y-1">
                          <span className="font-black uppercase flex items-center gap-1 text-slate-900">
                            <CheckCircle2 className="w-4 h-4 text-slate-900 stroke-[3]" /> Key Takeaway:
                          </span>
                          <p>{item.keyTakeaway}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-700 text-xs font-black uppercase">
                No matching terms found. Try a different search!
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
