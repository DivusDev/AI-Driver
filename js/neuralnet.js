class NeuralNet {
  constructor(a, b, c, d) {
    if (a instanceof tf.Sequential) {
      this.model = a;
      this.input_nodes = b;
      this.hidden_nodes = c;
      this.output_nodes = d;
      return;
    }

    this.input_nodes = a;
    this.hidden_nodes = b;
    this.output_nodes = c;

    this.model = this.createModel();
  }

  createModel() {
    const model = tf.sequential();
    let hidden = tf.layers.dense({
      units: this.hidden_nodes,
      inputShape: [this.input_nodes],
      activation: "sigmoid",
    });

    model.add(hidden);

    hidden = tf.layers.dense({
      units: this.hidden_nodes,
      inputShape: [this.hidden_nodes],
      activation: "sigmoid",
    });
    model.add(hidden);

    const output = tf.layers.dense({
      units: this.output_nodes,
      activation: "softmax",
    });
    model.add(output);

    model.compile({
      loss: "meanSquaredError",
      optimizer: "sgd",
    });
    return model;
  }

  copy() {
    return tf.tidy(() => {
      const modelCopy = this.createModel();
      const weights = this.model.getWeights();
      const weightCopies = [];
      for (let i = 0; i < weights.length; i++) {
        weightCopies[i] = weights[i].clone();
      }
      modelCopy.setWeights(weightCopies);
      return new NeuralNet(
        modelCopy,
        this.input_nodes,
        this.hidden_nodes,
        this.output_nodes
      );
    });
  }

  dispose() {
    this.model.dispose();
  }

  /**
   *
   * @param {*} rate
   */
  mutate(rate) {
    // Make sure you are garbage collecting
    tf.tidy(() => {
      const weights = this.model.getWeights();
      let mutatedWeights = [];
      for (let i = 0; i < weights.length; i++) {
        let tensor = weights[i];
        let shape = weights[i].shape;
        let values = tensor.dataSync().slice();

        for (let j = 0; j < values.length; j++) {
          if (random(1) < rate) {
            let w = values[j];
            values[j] = w + randomGaussian();
          }
        }
        let newTensor = tf.tensor(values, shape);
        mutatedWeights[i] = newTensor;
      }
      this.model.setWeights(mutatedWeights);
    });
  }

  predict(inputs) {
    return tf.tidy(() => {
      const tensorInputs = tf.tensor2d([inputs]);
      const ys = this.model.predict(tensorInputs);
      tensorInputs.dispose();
      const outputs = ys.dataSync();
      return outputs;
    });
  }
}
