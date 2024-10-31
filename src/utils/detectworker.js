// File: /src/workers/detectionWorker.js

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

let model;

self.addEventListener('message', async (e) => {
  if (e.data.type === 'load') {
    model = await tf.loadGraphModel(e.data.modelPath);
    self.postMessage({ type: 'loaded' });
  } else if (e.data.type === 'detect') {
    if (!model) {
      self.postMessage({ type: 'error', message: 'Model not loaded' });
      return;
    }

    const { imageData, width, height, lineY } = e.data;
    const input = tf.tidy(() => {
      return tf.image.resizeBilinear(tf.browser.fromPixels(imageData), [model.inputs[0].shape[1], model.inputs[0].shape[2]])
        .div(255.0).expandDims(0);
    });

    const res = await model.executeAsync(input);
    const [boxes, scores, classes] = res.slice(0, 3);
    const boxesData = boxes.dataSync();
    const scoresData = scores.dataSync();
    const classesData = classes.dataSync();

    tf.dispose(res);
    tf.dispose(input);

    const detections = [];
    let objectsCrossedIn = { cars: 0, motorcycles: 0, trucks: 0, buses: 0, pedestrians: 0 };
    let objectsCrossedOut = { cars: 0, motorcycles: 0, trucks: 0, buses: 0, pedestrians: 0 };

    for (let i = 0; i < scoresData.length; i++) {
      if (scoresData[i] > 0.5) {
        const [y1, x1, y2, x2] = boxesData.slice(i * 4, (i + 1) * 4);
        const width = x2 - x1;
        const height = y2 - y1;
        const centerY = y1 + height / 2;

        const label = classesData[i];
        let objectType;
        switch(label) {
          case 2: objectType = 'cars'; break;
          case 3: objectType = 'motorcycles'; break;
          case 5: objectType = 'buses'; break;
          case 7: objectType = 'trucks'; break;
          case 0: objectType = 'pedestrians'; break;
          default: objectType = 'unknown';
        }

        if (objectType !== 'unknown') {
          if (Math.abs(centerY * height - lineY) < 5) {
            if (centerY * height < lineY) {
              objectsCrossedIn[objectType]++;
            } else {
              objectsCrossedOut[objectType]++;
            }
          }
        }

        detections.push({
          bbox: [x1, y1, width, height],
          class: objectType,
          score: scoresData[i]
        });
      }
    }

    self.postMessage({
      type: 'result',
      detections,
      objectsCrossedIn,
      objectsCrossedOut
    });
  }
});