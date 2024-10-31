import labels from "./labels.json";

let trackedObjects = {};
let vehicleCounts = {
  carsCrossedIn: 0,
  motorcyclesCrossedIn: 0,
  pedestriansCrossedIn: 0,
  trucksCrossedIn: 0,
  busesCrossedIn: 0,
  carsCrossedOut: 0,
  motorcyclesCrossedOut: 0,
  pedestriansCrossedOut: 0,
  trucksCrossedOut: 0,
  busesCrossedOut: 0,
};

const TRACKING_THRESHOLD = 50;

export const renderBoxes = (canvasRef, boxes_data, scores_data, classes_data, ratios) => {
  const ctx = canvasRef.getContext("2d");
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const colors = new Colors();
  const font = `${Math.max(
    Math.round(Math.max(ctx.canvas.width, ctx.canvas.height) / 40),
    14
  )}px Arial`;
  ctx.font = font;
  ctx.textBaseline = "top";

  // Draw fixed diagonal line
  const startX = 80;
  const startY = ctx.canvas.height * 0.4;
  const endX = ctx.canvas.width * 0.8;
  const endY = ctx.canvas.height * 0.7;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.stroke();

  let currentObjects = {};
  console.log(`Detected ${scores_data.length} objects`);

  for (let i = 0; i < scores_data.length; ++i) {
    const klass = labels[classes_data[i]];
    const color = colors.get(classes_data[i]);
    const score = (scores_data[i] * 100).toFixed(1);

    let [y1, x1, y2, x2] = boxes_data.slice(i * 4, (i + 1) * 4);
    x1 *= ratios[0];
    x2 *= ratios[0];
    y1 *= ratios[1];
    y2 *= ratios[1];
    const width = x2 - x1;
    const height = y2 - y1;

    // Calculate center of the bounding box
    let centerX = (x1 + x2) / 2;
    let centerY = (y1 + y2) / 2;

    console.log(`centerX: ${centerX}, centerY: ${centerY}`);

    const isAboveLine = (endY - startY) * (centerX - startX) - (endX - startX) * (centerY - startY) > 0;
    console.log(`isAboveLine: ${isAboveLine}`);

    let matchedId = null;
    for (let id in trackedObjects) {
      const trackedObj = trackedObjects[id];
      const distance = Math.sqrt(
        Math.pow(centerX - trackedObj.centerX, 2) + Math.pow(centerY - trackedObj.centerY, 2)
      );
      if (distance < TRACKING_THRESHOLD && klass === trackedObj.klass) {
        matchedId = id;
        break;
      }
    }

    if (matchedId) {
      const trackedObj = trackedObjects[matchedId];
      if (trackedObj.isAboveLine !== isAboveLine) {
        if (isAboveLine) {
          if (klass === "car") vehicleCounts.carsCrossedOut++;
          if (klass === "motorcycle") vehicleCounts.motorcyclesCrossedOut++;
          if (klass === "person") vehicleCounts.pedestriansCrossedOut++;
          if (klass === "truck") vehicleCounts.trucksCrossedOut++;
          if (klass === "bus") vehicleCounts.busesCrossedOut++;
        } else {
          if (klass === "car") vehicleCounts.carsCrossedIn++;
          if (klass === "motorcycle") vehicleCounts.motorcyclesCrossedIn++;
          if (klass === "person") vehicleCounts.pedestriansCrossedIn++;
          if (klass === "truck") vehicleCounts.trucksCrossedIn++;
          if (klass === "bus") vehicleCounts.busesCrossedIn++;
        }
        console.log(`Vehicle crossed: In=${JSON.stringify(vehicleCounts)}`);
      }
      trackedObj.centerX = centerX;
      trackedObj.centerY = centerY;
      trackedObj.isAboveLine = isAboveLine;
      currentObjects[matchedId] = trackedObj;
    } else {
      const newId = `${klass}_${Date.now()}_${i}`;
      currentObjects[newId] = { centerX, centerY, isAboveLine, klass };
    }

    // Draw box and label (existing code)
    ctx.fillStyle = Colors.hexToRgba(color, 0.2);
    ctx.fillRect(x1, y1, width, height);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(Math.min(ctx.canvas.width, ctx.canvas.height) / 200, 2.5);
    ctx.strokeRect(x1, y1, width, height);
    ctx.fillStyle = color;
    const textWidth = ctx.measureText(klass + " - " + score + "%").width;
    const textHeight = parseInt(font, 10);
    const yText = y1 - (textHeight + ctx.lineWidth);
    ctx.fillRect(
      x1 - 1,
      yText < 0 ? 0 : yText,
      textWidth + ctx.lineWidth,
      textHeight + ctx.lineWidth
    );
    ctx.fillStyle = "#ffffff";
    ctx.fillText(klass + " - " + score + "%", x1 - 1, yText < 0 ? 0 : yText);
  }

  trackedObjects = currentObjects;
  window.vehicleCounts = vehicleCounts;

  console.log(`window update: ${JSON.stringify(window.vehicleCounts)}`);

  return vehicleCounts;
};

class Colors {
  constructor() {
    this.palette = [
      "#FF3838",
      "#FF9D97",
      "#FF701F",
      "#FFB21D",
      "#CFD231",
      "#48F90A",
      "#92CC17",
      "#3DDB86",
      "#1A9334",
      "#00D4BB",
      "#2C99A8",
      "#00C2FF",
      "#344593",
      "#6473FF",
      "#0018EC",
      "#8438FF",
      "#520085",
      "#CB38FF",
      "#FF95C8",
      "#FF37C7",
    ];
    this.n = this.palette.length;
  }

  get = (i) => this.palette[Math.floor(i) % this.n];

  static hexToRgba = (hex, alpha) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `rgba(${[parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)].join(", ")}, ${alpha})`
      : null;
  };
}
