export type ActivationType = 'relu' | 'sigmoid' | 'tanh' | 'step' | 'linear';

export type DatasetPreset = 'xor' | 'circle' | 'linear' | 'spiral' | 'custom';

export interface Point2D {
  id?: string;
  x: number; // range -1 to 1
  y: number; // range -1 to 1
  label: number; // 0 or 1
}

export interface NeuronState {
  id: string;
  layerIndex: number;
  neuronIndex: number;
  bias: number;
  preActivation: number;
  activation: number;
  delta?: number;
}

export interface Synapse {
  fromId: string;
  toId: string;
  weight: number;
}

export interface NetworkTopology {
  inputSize: number; // fixed to 2 (x1, x2) for 2D visualization
  hiddenLayers: number[]; // e.g. [4, 2] means layer 1 has 4 neurons, layer 2 has 2
  outputSize: number; // 1 for binary classification
}

export interface RealWorldAnalogy {
  id: string;
  title: string;
  icon: string;
  description: string;
  input1Label: string;
  input2Label: string;
  weight1Default: number;
  weight2Default: number;
  biasDefault: number;
  thresholdName: string;
  outputYes: string;
  outputNo: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  badge: string;
  preset: DatasetPreset;
  hint: string;
  targetAccuracy: number; // percentage e.g. 95
  maxEpochs?: number;
  initialTopology: NetworkTopology;
  initialActivation: ActivationType;
  initialLR: number;
}

export interface GlossaryItem {
  term: string;
  simpleDefinition: string;
  analogy: string;
  keyTakeaway: string;
  iconName: string;
  category: 'basics' | 'architecture' | 'training' | 'advanced';
}
