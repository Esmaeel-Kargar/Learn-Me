import React, { useState } from 'react';
import { ActivationType } from '../types';
import { activate } from '../utils/nnEngine';
import { sound } from '../utils/sound';
import { Sliders, ArrowRight, Lightbulb, CheckCircle2, XCircle, Info, RefreshCw, Plus, Trash2, Sparkles, Cpu, Layers, Mail, FileText, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FeatureInput {
  id: string;
  name: string;
  value: number; // 0.0 to 1.0 or continuous
  weight: number;
}

interface ScenarioTestSample {
  id: string;
  title: string;
  subtitle: string;
  featureValues: { [featureName: string]: number };
  expectedVerdict?: string;
}

interface ScenarioPreset {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  outputYesLabel: string;
  outputNoLabel: string;
  features: { name: string; defaultValue: number; defaultWeight: number }[];
  defaultBias: number;
  defaultThreshold: number;
  testSamples: ScenarioTestSample[];
}

const PRESET_SCENARIOS: ScenarioPreset[] = [
  {
    id: 'spam',
    title: 'Email Spam Detector',
    category: 'Cybersecurity',
    icon: '📧',
    description: 'Determines if an incoming email should go to SPAM or INBOX.',
    outputYesLabel: '🚨 SPAM EMAIL',
    outputNoLabel: '📥 CLEAN INBOX',
    features: [
      { name: 'Contains "Free Money" phrase', defaultValue: 1.0, defaultWeight: 4.2 },
      { name: 'Unknown / Suspicious Sender', defaultValue: 1.0, defaultWeight: 3.0 },
      { name: 'Sender in Contact List', defaultValue: 0.0, defaultWeight: -4.5 },
      { name: 'Contains Urgency ("Act Now")', defaultValue: 0.5, defaultWeight: 2.1 },
    ],
    defaultBias: -2.0,
    defaultThreshold: 0.5,
    testSamples: [
      {
        id: 's1',
        title: 'Subject: "CLAIM YOUR $10,000 FREE PRIZE NOW!"',
        subtitle: 'From: prize-claim-rewards99@suspicious-domain.xyz',
        featureValues: {
          'Contains "Free Money" phrase': 1.0,
          'Unknown / Suspicious Sender': 1.0,
          'Sender in Contact List': 0.0,
          'Contains Urgency ("Act Now")': 1.0,
        },
        expectedVerdict: 'SPAM',
      },
      {
        id: 's2',
        title: 'Subject: "Weekly Team Standup Notes & Q3 Roadmap"',
        subtitle: 'From: sarah.jenkins@company.com (In Contacts)',
        featureValues: {
          'Contains "Free Money" phrase': 0.0,
          'Unknown / Suspicious Sender': 0.0,
          'Sender in Contact List': 1.0,
          'Contains Urgency ("Act Now")': 0.0,
        },
        expectedVerdict: 'INBOX',
      },
      {
        id: 's3',
        title: 'Subject: "Urgent Security Alert: Account Verification"',
        subtitle: 'From: verify-account-now@unverified-server.org',
        featureValues: {
          'Contains "Free Money" phrase': 0.0,
          'Unknown / Suspicious Sender': 1.0,
          'Sender in Contact List': 0.0,
          'Contains Urgency ("Act Now")': 1.0,
        },
        expectedVerdict: 'SPAM',
      },
    ],
  },
  {
    id: 'loan',
    title: 'Bank Loan Approval AI',
    category: 'Finance',
    icon: '🏦',
    description: 'Evaluates applicant risk before approving a mortgage or credit loan.',
    outputYesLabel: '✅ LOAN APPROVED',
    outputNoLabel: '❌ LOAN REJECTED',
    features: [
      { name: 'Credit Score > 720', defaultValue: 1.0, defaultWeight: 3.5 },
      { name: 'Annual Income > $75k', defaultValue: 1.0, defaultWeight: 2.8 },
      { name: 'Debt-to-Income Ratio > 50%', defaultValue: 0.0, defaultWeight: -4.0 },
      { name: 'Previous Bankruptcy', defaultValue: 0.0, defaultWeight: -5.0 },
    ],
    defaultBias: -1.5,
    defaultThreshold: 0.5,
    testSamples: [
      {
        id: 'l1',
        title: 'Applicant: High Credit, $110k Income, Low Debt',
        subtitle: 'Credit Score: 780 | Debt: 12% | No Bankruptcies',
        featureValues: {
          'Credit Score > 720': 1.0,
          'Annual Income > $75k': 1.0,
          'Debt-to-Income Ratio > 50%': 0.0,
          'Previous Bankruptcy': 0.0,
        },
        expectedVerdict: 'APPROVED',
      },
      {
        id: 'l2',
        title: 'Applicant: Low Credit Score, Debt > 60%',
        subtitle: 'Credit Score: 580 | Debt: 65% | Recent Bankruptcy',
        featureValues: {
          'Credit Score > 720': 0.0,
          'Annual Income > $75k': 0.0,
          'Debt-to-Income Ratio > 50%': 1.0,
          'Previous Bankruptcy': 1.0,
        },
        expectedVerdict: 'REJECTED',
      },
    ],
  },
  {
    id: 'tesla',
    title: 'Tesla Auto-Brake System',
    category: 'Autonomous Vehicles',
    icon: '🚗',
    description: 'Triggers emergency collision braking in self-driving cars.',
    outputYesLabel: '🛑 EMERGENCY BRAKE!',
    outputNoLabel: '🟢 CONTINUE DRIVING',
    features: [
      { name: 'Obstacle Distance < 10m', defaultValue: 1.0, defaultWeight: 5.0 },
      { name: 'High Vehicle Speed', defaultValue: 0.8, defaultWeight: 2.0 },
      { name: 'Wet / Slippery Road', defaultValue: 0.5, defaultWeight: 1.5 },
    ],
    defaultBias: -3.0,
    defaultThreshold: 0.5,
    testSamples: [
      {
        id: 't1',
        title: 'Scenario: Pedestrian Stepped Out at 8m ahead',
        subtitle: 'Distance: 6m | Speed: 45 mph | Road: Dry',
        featureValues: {
          'Obstacle Distance < 10m': 1.0,
          'High Vehicle Speed': 1.0,
          'Wet / Slippery Road': 0.0,
        },
        expectedVerdict: 'EMERGENCY BRAKE',
      },
      {
        id: 't2',
        title: 'Scenario: Clear Highway Cruise',
        subtitle: 'Distance: 120m | Speed: 65 mph | Road: Dry',
        featureValues: {
          'Obstacle Distance < 10m': 0.0,
          'High Vehicle Speed': 1.0,
          'Wet / Slippery Road': 0.0,
        },
        expectedVerdict: 'CONTINUE DRIVING',
      },
    ],
  },
  {
    id: 'er_triage',
    title: 'Hospital ER Triage AI',
    category: 'Healthcare',
    icon: '🏥',
    description: 'Prioritizes emergency room patients based on vital symptoms.',
    outputYesLabel: '🚨 IMMEDIATE ICU CARE',
    outputNoLabel: '📋 REGULAR WAITING ROOM',
    features: [
      { name: 'Severe Chest Pain', defaultValue: 1.0, defaultWeight: 4.8 },
      { name: 'High Fever (> 103°F)', defaultValue: 0.0, defaultWeight: 2.5 },
      { name: 'Oxygen Saturation < 90%', defaultValue: 1.0, defaultWeight: 4.5 },
      { name: 'Age > 70', defaultValue: 0.5, defaultWeight: 1.2 },
    ],
    defaultBias: -2.5,
    defaultThreshold: 0.5,
    testSamples: [
      {
        id: 'e1',
        title: 'Patient: Severe Chest Pain & Oxygen Saturation 86%',
        subtitle: 'Age: 74 | Pulse: 110 bpm | SpO2: 86%',
        featureValues: {
          'Severe Chest Pain': 1.0,
          'High Fever (> 103°F)': 0.0,
          'Oxygen Saturation < 90%': 1.0,
          'Age > 70': 1.0,
        },
        expectedVerdict: 'IMMEDIATE ICU CARE',
      },
      {
        id: 'e2',
        title: 'Patient: Mild Headache & SpO2 98%',
        subtitle: 'Age: 28 | Temp: 98.6°F | SpO2: 98%',
        featureValues: {
          'Severe Chest Pain': 0.0,
          'High Fever (> 103°F)': 0.0,
          'Oxygen Saturation < 90%': 0.0,
          'Age > 70': 0.0,
        },
        expectedVerdict: 'REGULAR WAITING ROOM',
      },
    ],
  },
];

export const SingleNeuronVisualizer: React.FC = () => {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('spam');
  
  // Dynamic features list
  const activePreset = PRESET_SCENARIOS.find((s) => s.id === activeScenarioId) || PRESET_SCENARIOS[0];

  const [features, setFeatures] = useState<FeatureInput[]>(
    activePreset.features.map((f, i) => ({
      id: `f-${i}`,
      name: f.name,
      value: f.defaultValue,
      weight: f.defaultWeight,
    }))
  );

  const [bias, setBias] = useState<number>(activePreset.defaultBias);
  const [activationType, setActivationType] = useState<ActivationType>('sigmoid');
  const [threshold, setThreshold] = useState<number>(activePreset.defaultThreshold);
  const [customYesLabel, setCustomYesLabel] = useState<string>(activePreset.outputYesLabel);
  const [customNoLabel, setCustomNoLabel] = useState<string>(activePreset.outputNoLabel);

  // Active Live Test Data Sample state
  const [activeSample, setActiveSample] = useState<ScenarioTestSample | null>(null);
  const [testResultLog, setTestResultLog] = useState<{ sample: ScenarioTestSample; fired: boolean; output: number } | null>(null);

  // Load preset scenario
  const handleLoadPreset = (scenarioId: string) => {
    const sc = PRESET_SCENARIOS.find((s) => s.id === scenarioId);
    if (!sc) return;

    setActiveScenarioId(scenarioId);
    setFeatures(
      sc.features.map((f, i) => ({
        id: `f-${i}-${Date.now()}`,
        name: f.name,
        value: f.defaultValue,
        weight: f.defaultWeight,
      }))
    );
    setBias(sc.defaultBias);
    setThreshold(sc.defaultThreshold);
    setCustomYesLabel(sc.outputYesLabel);
    setCustomNoLabel(sc.outputNoLabel);
    setActiveSample(null);
    setTestResultLog(null);
    sound.playSuccess();
  };

  // Run Test Sample through tuned model
  const handleRunTestSample = (sample: ScenarioTestSample) => {
    setActiveSample(sample);
    // Apply feature values to current inputs
    setFeatures((prev) =>
      prev.map((f) => {
        const val = sample.featureValues[f.name];
        return val !== undefined ? { ...f, value: val } : f;
      })
    );

    // Compute result
    const currentProducts = features.map((f) => {
      const v = sample.featureValues[f.name] !== undefined ? sample.featureValues[f.name] : f.value;
      return v * f.weight;
    });
    const currentSum = currentProducts.reduce((acc, curr) => acc + curr, 0) + bias;
    const currentOutput = activate(currentSum, activationType);
    const fired = currentOutput >= threshold;

    setTestResultLog({ sample, fired, output: currentOutput });
    sound.playPulse(fired ? 700 : 400, 0.06);
  };

  // Generate Random Custom Test Email / Scenario
  const handleGenerateRandomTest = () => {
    const isSpamScenario = activeScenarioId === 'spam';
    const isSpam = Math.random() > 0.5;

    const randomSample: ScenarioTestSample = {
      id: `random-${Date.now()}`,
      title: isSpamScenario
        ? isSpam
          ? 'Generated Email: "URGENT WIRE TRANSFER REQUIRED"'
          : 'Generated Email: "Project Meeting Notes & Action Items"'
        : `Generated Sample #${Math.floor(Math.random() * 900 + 100)}`,
      subtitle: isSpamScenario
        ? isSpam
          ? 'Sender: unknown-admin@crypto-giveaway-winner.info'
          : 'Sender: coworker@our-company.com'
        : 'Randomly synthesized feature values',
      featureValues: features.reduce((acc, f) => {
        acc[f.name] = isSpamScenario ? (isSpam ? (Math.random() > 0.3 ? 1.0 : 0.0) : (Math.random() > 0.7 ? 1.0 : 0.0)) : (Math.random() > 0.5 ? 1.0 : 0.0);
        return acc;
      }, {} as { [key: string]: number }),
      expectedVerdict: isSpamScenario ? (isSpam ? 'SPAM' : 'INBOX') : 'TEST DATA',
    };

    handleRunTestSample(randomSample);
  };

  // User control: Add new input feature
  const handleAddFeature = () => {
    if (features.length >= 6) return;
    const newId = `f-custom-${Date.now()}`;
    setFeatures((prev) => [
      ...prev,
      {
        id: newId,
        name: `New Feature ${prev.length + 1}`,
        value: 1.0,
        weight: 1.5,
      },
    ]);
    sound.playPulse(550, 0.05);
  };

  // User control: Remove feature
  const handleRemoveFeature = (id: string) => {
    if (features.length <= 1) return;
    setFeatures((prev) => prev.filter((f) => f.id !== id));
    sound.playPulse(350, 0.05);
  };

  // Update feature property
  const handleUpdateFeature = (id: string, key: 'name' | 'value' | 'weight', val: any) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: val } : f))
    );
    if (key === 'weight' || key === 'value') {
      sound.playWeightChange(typeof val === 'number' ? val : 1);
    }
  };

  // Calculate weighted sum
  const products = features.map((f) => f.value * f.weight);
  const weightedSum = products.reduce((acc, curr) => acc + curr, 0) + bias;
  const activatedOutput = activate(weightedSum, activationType);
  const isFired = activatedOutput >= threshold;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner - Minimal Vibrant Style */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-300 text-slate-900 text-xs font-black uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" />
            <span>Lesson 1: The Decision Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Build & Customize an Artificial Neuron
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base font-medium leading-relaxed">
            Every AI model—from spam filters to ChatGPT—is made of simple decision units called <strong>Neurons (Perceptrons)</strong>. A neuron multiplies input features by <strong>Weights</strong>, adds a <strong>Bias</strong> threshold, and runs the sum through a <strong>Gate Function</strong>.
          </p>
        </div>
      </div>

      {/* Preset Real-World Scenario Picker */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              1. Choose a Real-World Scenario or Build Your Own
            </h2>
            <p className="text-xs text-slate-500 font-medium">Select a preset to load real feature weights or add/edit your own custom features below.</p>
          </div>
          <button
            onClick={() => handleLoadPreset(activeScenarioId)}
            className="flex items-center gap-1.5 text-xs text-slate-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl font-bold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Default Weights
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_SCENARIOS.map((sc) => {
            const isSelected = sc.id === activeScenarioId;
            return (
              <button
                key={sc.id}
                onClick={() => handleLoadPreset(sc.id)}
                className={`p-4 rounded-2xl text-left border transition-all relative select-none ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/80 text-slate-900 shadow-sm ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between font-black text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{sc.icon}</span>
                    {sc.title}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-xs text-slate-600 font-medium line-clamp-2">{sc.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* NEW FEATURE: Live Example Data Tester Button & Suite */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white border border-indigo-800/50 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/60 pb-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              2. Test Your Tuned AI Model on Example Data
            </span>
            <p className="text-xs text-indigo-200 font-medium">
              Click any sample test case or generate fresh random emails/profiles to pass through your tuned AI weights ($w$) and bias ($b$).
            </p>
          </div>

          <button
            onClick={handleGenerateRandomTest}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Generate & Test Example Email / Data
          </button>
        </div>

        {/* Test Samples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {activePreset.testSamples?.map((sample) => {
            const isSelected = activeSample?.id === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => handleRunTestSample(sample)}
                className={`p-4 rounded-2xl text-left border transition-all relative cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/90 border-indigo-400 text-white shadow-md ring-2 ring-indigo-400'
                    : 'bg-slate-800/70 border-slate-700/80 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-xs truncate max-w-[200px] text-amber-300">
                    {sample.title}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900/80 text-indigo-300 border border-slate-700">
                    Test Case
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium line-clamp-1 mb-2">{sample.subtitle}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 text-[10px]">
                  <span className="text-slate-400">Click to Pass through AI →</span>
                  <span className="font-bold text-indigo-300 uppercase">Run Test</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Test Results Banner */}
        {testResultLog && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              testResultLog.fired
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-100'
                : 'bg-rose-950/80 border-rose-500/60 text-rose-100'
            }`}
          >
            <div className="flex items-center gap-3">
              {testResultLog.fired ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 text-rose-400 flex-shrink-0" />
              )}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  AI Model Decision on Incoming Data:
                </span>
                <h4 className="text-base font-black uppercase text-white">
                  {testResultLog.fired ? customYesLabel : customNoLabel}
                </h4>
                <p className="text-xs text-slate-300 font-medium">
                  {testResultLog.sample.title} — Output Score: <strong className="font-mono text-amber-300">{testResultLog.output.toFixed(3)}</strong>
                </p>
              </div>
            </div>

            <div className="text-right text-xs font-mono bg-slate-900/80 p-3 rounded-xl border border-slate-700 w-full sm:w-auto">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Expected Tag:</span>
              <span className="text-amber-300 font-black">{testResultLog.sample.expectedVerdict || 'DATA RECORD'}</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Interactive Controls & Diagram Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Full Control over Inputs, Weights, Bias & Gate (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                Customize Structure & Weights
              </h3>
              <p className="text-xs text-slate-500 font-medium">Add inputs, change feature values ($x$), drag weights ($w$), and adjust bias ($b$).</p>
            </div>
            
            <button
              onClick={handleAddFeature}
              disabled={features.length >= 6}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Input
            </button>
          </div>

          {/* Dynamic Feature Inputs List */}
          <div className="space-y-4">
            {features.map((feat, index) => (
              <div key={feat.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={feat.name}
                    onChange={(e) => handleUpdateFeature(feat.id, 'name', e.target.value)}
                    className="font-bold text-xs text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-hidden flex-1"
                  />
                  
                  {features.length > 1 && (
                    <button
                      onClick={() => handleRemoveFeature(feat.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Remove Feature"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Input Value Selector (x) */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => handleUpdateFeature(feat.id, 'value', 0.0)}
                    className={`py-1.5 px-3 rounded-xl font-bold transition-all border ${
                      feat.value === 0
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    NO / FALSE (0.0)
                  </button>

                  <button
                    onClick={() => handleUpdateFeature(feat.id, 'value', 1.0)}
                    className={`py-1.5 px-3 rounded-xl font-bold transition-all border ${
                      feat.value === 1
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    YES / TRUE (1.0)
                  </button>
                </div>

                {/* Weight Slider (w) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-bold">
                      Importance Weight ($w_{index + 1}$)
                    </span>
                    <span className={`font-mono font-black ${feat.weight >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {feat.weight > 0 ? `+${feat.weight.toFixed(1)}` : feat.weight.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    step="0.1"
                    value={feat.weight}
                    onChange={(e) => handleUpdateFeature(feat.id, 'weight', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>-6.0 (Strong Penalty)</span>
                    <span>0.0 (Ignore)</span>
                    <span>+6.0 (Strong Boost)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bias Slider (b) */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900">Neuron Bias ($b$ - Baseline Inclination)</span>
              <span className="font-mono font-black text-amber-800 bg-amber-200 px-2 py-0.5 rounded-md">
                b = {bias > 0 ? `+${bias.toFixed(1)}` : bias.toFixed(1)}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              A negative bias makes the neuron strict (needs strong positive evidence to fire). A positive bias makes it lenient.
            </p>
            <input
              type="range"
              min="-10"
              max="10"
              step="0.1"
              value={bias}
              onChange={(e) => {
                setBias(parseFloat(e.target.value));
                sound.playWeightChange(parseFloat(e.target.value));
              }}
              className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>

          {/* Activation Function & Threshold Selection */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase">Activation Gate Function</label>
              <span className="text-[10px] text-indigo-600 font-mono font-bold uppercase">{activationType}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {(['sigmoid', 'relu', 'step', 'tanh'] as ActivationType[]).map((act) => (
                <button
                  key={act}
                  onClick={() => {
                    setActivationType(act);
                    sound.playPulse(500, 0.05);
                  }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                    activationType === act
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Signal Flow & Math Breakdown (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Visual Signal Wiring Box */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Real-Time Neural Signal Calculation
              </span>
              <span className="text-xs font-mono text-slate-400">
                $Z = \sum (x_i \cdot w_i) + b$
              </span>
            </div>

            {/* Inputs -> Weighted Sum -> Gate -> Output Visualizer */}
            <div className="space-y-3">
              {features.map((f, i) => {
                const prod = f.value * f.weight;
                return (
                  <div key={f.id} className="flex items-center justify-between bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                        f.value > 0 ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'
                      }`}>
                        x_{i+1}
                      </span>
                      <span className="font-semibold text-slate-200 truncate max-w-[140px] sm:max-w-[180px]">
                        {f.name}
                      </span>
                    </div>

                    <div className="font-mono text-right">
                      <span className="text-slate-400 text-[11px] mr-2">
                        {f.value} × {f.weight > 0 ? `+${f.weight.toFixed(1)}` : f.weight.toFixed(1)}
                      </span>
                      <span className={`font-black ${prod > 0 ? 'text-emerald-400' : prod < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                        = {prod > 0 ? `+${prod.toFixed(1)}` : prod.toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Bias Addition Row */}
              <div className="flex items-center justify-between bg-amber-900/30 p-3 rounded-2xl border border-amber-700/50 text-xs text-amber-200">
                <span className="font-bold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Baseline Bias ($b$)
                </span>
                <span className="font-mono font-black text-amber-300">
                  {bias > 0 ? `+${bias.toFixed(2)}` : bias.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Resulting Decision Card */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isFired
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/50 text-rose-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Neuron Output Decision</span>
                <span className="font-mono font-black text-xs text-slate-300">Score: {activatedOutput.toFixed(3)}</span>
              </div>

              <div className="flex items-center gap-3">
                {isFired ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-400 flex-shrink-0" />
                )}
                <div>
                  <h4 className="text-lg font-black tracking-tight text-white uppercase">
                    {isFired ? customYesLabel : customNoLabel}
                  </h4>
                  <p className="text-xs text-slate-300 font-medium">
                    {isFired
                      ? `Score (${activatedOutput.toFixed(2)}) is ≥ threshold (${threshold}). Gate triggered!`
                      : `Score (${activatedOutput.toFixed(2)}) is < threshold (${threshold}). Gate remains closed.`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Educational Step-by-Step Mathematical Explanation */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-600" />
              How the Math Works Step-by-Step
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">1. Feature Multiplications</span>
                <p className="text-slate-600 font-medium leading-relaxed">
                  Inputs ($x_i$) are multiplied by their importance weights ($w_i$). Active features with positive weights boost the score.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">2. Sum + Add Bias</span>
                <p className="font-mono text-indigo-700 font-black">
                  Raw $Z = {weightedSum.toFixed(2)}$
                </p>
                <p className="text-slate-600 font-medium leading-relaxed">
                  Summing all feature products and adding the bias gives the total unscaled score.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">3. Activation Gate</span>
                <p className="font-mono text-emerald-700 font-black">
                  $y = {activatedOutput.toFixed(4)}$
                </p>
                <p className="text-slate-600 font-medium leading-relaxed">
                  Squashes raw $Z$ into a probability between 0% and 100%.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
