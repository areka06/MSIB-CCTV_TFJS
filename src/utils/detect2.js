// File: /src/utils/detect.js

import * as tf from '@tensorflow/tfjs';

export const detect = async (img, model) => {
  const batched = tf.tidy(() => {
    const normalized = tf.div(tf.cast(img, 'float32'), 255);
    return normalized.expandDims(0);
  });

  const result = await model.net.executeAsync(batched);
  const [boxes, scores, classes] = result.slice(0, 3);
  const boxesData = boxes.dataSync();
  const scoresData = scores.dataSync();
  const classesData = classes.dataSync();

  tf.dispose(result);
  tf.dispose(batched);

  return { boxesData, scoresData, classesData };
};

export const detectVideo = (video, model, canvas, callback) => {
  const ctx = canvas.getContext('2d');
  const lineY = canvas.height / 2; // Garis di tengah canvas
  let lineColor = 'yellow';

  const detectFrame = async () => {
    if (video.paused || video.ended) return;

    const input = tf.tidy(() => {
      return tf.image.resizeBilinear(tf.browser.fromPixels(video), [model.inputShape[1], model.inputShape[2]])
        .div(255.0).expandDims(0);
    });

    const res = await model.net.executeAsync(input);
    const [boxes, scores, classes] = res.slice(0, 3);
    const boxesData = boxes.dataSync();
    const scoresData = scores.dataSync();
    const classesData = classes.dataSync();

    tf.dispose(res);
    tf.dispose(input);

    const detectionObjects = [];
    let objectsCrossedIn = { cars: 0, motorcycles: 0, trucks: 0, buses: 0, pedestrians: 0 };
    let objectsCrossedOut = { cars: 0, motorcycles: 0, trucks: 0, buses: 0, pedestrians: 0 };

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Gambar garis penghitungan
    ctx.beginPath();
    ctx.moveTo(0, lineY);
    ctx.lineTo(canvas.width, lineY);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let i = 0; i < scoresData.length; i++) {
      if (scoresData[i] > 0.5) {
        const [x1, y1, x2, y2] = boxesData.slice(i * 4, (i + 1) * 4);
        const width = x2 - x1;
        const height = y2 - y1;

        const centerY = y1 + height / 2;

        ctx.beginPath();
        ctx.rect(x1 * canvas.width, y1 * canvas.height, width * canvas.width, height * canvas.height);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();

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
          if (Math.abs(centerY * canvas.height - lineY) < 5) {
            lineColor = 'red'; // Ubah warna garis saat objek menyentuh
            if (centerY * canvas.height < lineY) {
              objectsCrossedIn[objectType]++;
            } else {
              objectsCrossedOut[objectType]++;
            }
          }
        }

        detectionObjects.push({
          class: objectType,
          score: scoresData[i],
          bbox: [x1, y1, width, height],
        });
      }
    }

    const counts = {
      carsCrossedIn: objectsCrossedIn.cars,
      motorcyclesCrossedIn: objectsCrossedIn.motorcycles,
      trucksCrossedIn: objectsCrossedIn.trucks,
      busesCrossedIn: objectsCrossedIn.buses,
      pedestriansCrossedIn: objectsCrossedIn.pedestrians,
      carsCrossedOut: objectsCrossedOut.cars,
      motorcyclesCrossedOut: objectsCrossedOut.motorcycles,
      trucksCrossedOut: objectsCrossedOut.trucks,
      busesCrossedOut: objectsCrossedOut.buses,
      pedestriansCrossedOut: objectsCrossedOut.pedestrians,
    };

    callback(counts);

    setTimeout(() => {
      lineColor = 'yellow'; // Kembalikan warna garis ke kuning setelah beberapa saat
    }, 500);

    requestAnimationFrame(detectFrame);
  };

  detectFrame();
};