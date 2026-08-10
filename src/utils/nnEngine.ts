import { ActivationType, DatasetPreset, Point2D, NetworkTopology } from '../types';

// Activation functions & derivatives
export function activate(x: number, type: ActivationType): number {
  switch (type) {
    case 'relu':
      return Math.max(0, x);
    case 'sigmoid':
      return 1 / (1 + Math.exp(-Math.max(-15, Math.min(15, x))));
    case 'tanh':
      return Math.tanh(x);
    case 'step':
      return x >= 0 ? 1 : 0;
    case 'linear':
      return x;
    default:
      return x;
  }
}

export function activateDerivative(y: number, type: ActivationType): number {
  // Note: y is the activated value
  switch (type) {
    case 'relu':
      return y > 0 ? 1 : 0;
    case 'sigmoid':
      return y * (1 - y);
    case 'tanh':
      return 1 - y * y;
    case 'step':
      return 0; // Non-differentiable
    case 'linear':
      return 1;
    default:
      return 1;
  }
}

// Neural Network Class representing a fully connected MLP
export class NeuralNetwork {
  layers: number[]; // Number of neurons in each layer (e.g. [2, 4, 2, 1])
  weights: number[][][]; // weights[layerIndex][toNeuron][fromNeuron]
  biases: number[][]; // biases[layerIndex][neuronIndex]
  activations: number[][]; // activations[layerIndex][neuronIndex]
  preActivations: number[][]; // before activation
  activationType: ActivationType;

  constructor(topology: NetworkTopology, activationType: ActivationType = 'tanh') {
    this.layers = [topology.inputSize, ...topology.hiddenLayers, topology.outputSize];
    this.activationType = activationType;

    this.weights = [];
    this.biases = [];
    this.activations = [];
    this.preActivations = [];

    // Initialize activations
    for (let l = 0; l < this.layers.length; l++) {
      this.activations.push(new Array(this.layers[l]).fill(0));
      this.preActivations.push(new Array(this.layers[l]).fill(0));
    }

    // Initialize weights and biases with Xavier/Glorot normal distribution
    for (let l = 1; l < this.layers.length; l++) {
      const prevSize = this.layers[l - 1];
      const currSize = this.layers[l];
      const layerWeights: number[][] = [];
      const layerBiases: number[] = [];

      const std = Math.sqrt(2 / (prevSize + currSize));

      for (let i = 0; i < currSize; i++) {
        const neuronWeights: number[] = [];
        for (let j = 0; j < prevSize; j++) {
          // random weight roughly between -1 and 1
          neuronWeights.push((Math.random() * 2 - 1) * std * 2);
        }
        layerWeights.push(neuronWeights);
        layerBiases.push((Math.random() * 0.4 - 0.2));
      }

      this.weights.push(layerWeights);
      this.biases.push(layerBiases);
    }
  }

  // Forward Pass
  forward(inputs: number[]): number[] {
    this.activations[0] = [...inputs];
    this.preActivations[0] = [...inputs];

    for (let l = 0; l < this.weights.length; l++) {
      const prevActivations = this.activations[l];
      const layerWeights = this.weights[l];
      const layerBiases = this.biases[l];
      const nextSize = this.layers[l + 1];

      const nextActivations = new Array(nextSize).fill(0);
      const nextPreActivations = new Array(nextSize).fill(0);

      // Output activation type for final binary classification layer is Sigmoid unless step is selected
      const currentActType = (l === this.weights.length - 1 && this.activationType !== 'step')
        ? 'sigmoid'
        : this.activationType;

      for (let i = 0; i < nextSize; i++) {
        let sum = layerBiases[i];
        for (let j = 0; j < prevActivations.length; j++) {
          sum += prevActivations[j] * layerWeights[i][j];
        }
        nextPreActivations[i] = sum;
        nextActivations[i] = activate(sum, currentActType);
      }

      this.preActivations[l + 1] = nextPreActivations;
      this.activations[l + 1] = nextActivations;
    }

    return this.activations[this.activations.length - 1];
  }

  // Train a single epoch over dataset using Gradient Descent
  trainStep(data: Point2D[], learningRate: number): { loss: number; accuracy: number } {
    let totalLoss = 0;
    let correct = 0;

    // Accumulate gradients
    const weightGradients: number[][][] = this.weights.map(layer =>
      layer.map(row => new Array(row.length).fill(0))
    );
    const biasGradients: number[][] = this.biases.map(layer =>
      new Array(layer.length).fill(0)
    );

    for (const point of data) {
      const output = this.forward([point.x, point.y])[0];
      const target = point.label;

      // Binary Cross Entropy Loss
      const loss = - (target * Math.log(Math.max(1e-7, output)) + (1 - target) * Math.log(Math.max(1e-7, 1 - output)));
      totalLoss += isNaN(loss) ? 0 : loss;

      const prediction = output >= 0.5 ? 1 : 0;
      if (prediction === target) correct++;

      // Backpropagation
      const numLayers = this.layers.length;
      const deltas: number[][] = [];
      for (let l = 0; l < numLayers; l++) {
        deltas.push(new Array(this.layers[l]).fill(0));
      }

      // Output layer delta (Error = Output - Target)
      deltas[numLayers - 1][0] = output - target;

      // Backpropagate through hidden layers
      for (let l = numLayers - 2; l >= 1; l--) {
        const weightIdx = l; // index in this.weights (0 means layer 0 -> 1)
        const nextDeltas = deltas[l + 1];
        const layerWeights = this.weights[weightIdx]; // size [nextLayerSize][currLayerSize]

        for (let j = 0; j < this.layers[l]; j++) {
          let errorSum = 0;
          for (let i = 0; i < this.layers[l + 1]; i++) {
            errorSum += nextDeltas[i] * layerWeights[i][j];
          }
          const act = this.activations[l][j];
          const der = activateDerivative(act, this.activationType);
          deltas[l][j] = errorSum * der;
        }
      }

      // Accumulate gradients
      for (let l = 0; l < this.weights.length; l++) {
        for (let i = 0; i < this.layers[l + 1]; i++) {
          biasGradients[l][i] += deltas[l + 1][i];
          for (let j = 0; j < this.layers[l]; j++) {
            weightGradients[l][i][j] += deltas[l + 1][i] * this.activations[l][j];
          }
        }
      }
    }

    // Apply gradients
    const N = data.length || 1;
    for (let l = 0; l < this.weights.length; l++) {
      for (let i = 0; i < this.layers[l + 1]; i++) {
        this.biases[l][i] -= (learningRate * biasGradients[l][i]) / N;
        for (let j = 0; j < this.layers[l]; j++) {
          this.weights[l][i][j] -= (learningRate * weightGradients[l][i][j]) / N;
        }
      }
    }

    return {
      loss: totalLoss / N,
      accuracy: (correct / N) * 100,
    };
  }
}

// Generate Datasets
export function generateDataset(type: DatasetPreset, count = 120): Point2D[] {
  const points: Point2D[] = [];
  const noise = 0.1;

  for (let i = 0; i < count; i++) {
    const x = (Math.random() * 2 - 1);
    const y = (Math.random() * 2 - 1);
    let label = 0;

    switch (type) {
      case 'xor':
        label = (x * y > 0) ? 1 : 0;
        break;
      case 'circle':
        const dist = Math.sqrt(x * x + y * y);
        label = dist < 0.6 ? 1 : 0;
        break;
      case 'linear':
        label = (y > 0.8 * x + 0.1) ? 1 : 0;
        break;
      case 'spiral': {
        const radius = Math.random() * 0.8 + 0.1;
        const angle = radius * 4 * Math.PI + (i % 2 === 0 ? 0 : Math.PI);
        const px = radius * Math.cos(angle) + (Math.random() - 0.5) * noise;
        const py = radius * Math.sin(angle) + (Math.random() - 0.5) * noise;
        points.push({ id: `p_${i}`, x: Math.max(-1, Math.min(1, px)), y: Math.max(-1, Math.min(1, py)), label: i % 2 });
        continue;
      }
      default:
        label = x > 0 ? 1 : 0;
    }

    // Add slight jitter
    const jx = Math.max(-1, Math.min(1, x + (Math.random() - 0.5) * noise));
    const jy = Math.max(-1, Math.min(1, y + (Math.random() - 0.5) * noise));
    points.push({ id: `p_${i}`, x: jx, y: jy, label });
  }

  return points;
}
