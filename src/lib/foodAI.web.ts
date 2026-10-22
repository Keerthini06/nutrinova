import type { MobileNet } from "@tensorflow-models/mobilenet";
import type { FoodPrediction } from "./foodTypes";

const teachableModelUrl = "https://teachablemachine.withgoogle.com/models/pzQmfg9Yk/";

type TeachableModel = {
  model: import("@tensorflow/tfjs").LayersModel;
  labels: string[];
  imageSize: number;
};

let mobileNetModelPromise: Promise<MobileNet> | undefined;
let teachableModelPromise: Promise<TeachableModel> | undefined;

async function loadTrainedModel(): Promise<TeachableModel> {
  const tf = await import("@tensorflow/tfjs");
  await tf.ready();

  const [model, metadataResponse] = await Promise.all([
    tf.loadLayersModel(`${teachableModelUrl}model.json`),
    fetch(`${teachableModelUrl}metadata.json`),
  ]);
  if (!metadataResponse.ok) {
    throw new Error("The trained food model details could not be loaded.");
  }

  const metadata = await metadataResponse.json();
  if (!Array.isArray(metadata.labels) || metadata.labels.length === 0) {
    throw new Error("The trained food model has no class labels.");
  }

  return {
    model,
    labels: metadata.labels.map(String),
    imageSize: Number(metadata.imageSize) || 224,
  };
}

async function classifyWithTrainedModel(imageBlob: Blob): Promise<FoodPrediction> {
  const tf = await import("@tensorflow/tfjs");
  teachableModelPromise ??= loadTrainedModel();
  const { model, labels, imageSize } = await teachableModelPromise;
  const imageUrl = URL.createObjectURL(imageBlob);

  try {
    const image = new Image();
    image.src = imageUrl;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = imageSize;
    canvas.height = imageSize;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("The image could not be prepared for the trained model.");
    }

    const scale = imageSize / Math.min(image.width, image.height);
    const scaledWidth = Math.ceil(image.width * scale);
    const scaledHeight = Math.ceil(image.height * scale);
    const offsetX = Math.trunc((scaledWidth - imageSize) / 2) * -1;
    const offsetY = Math.trunc((scaledHeight - imageSize) / 2) * -1;
    context.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);

    const input = tf.tidy(() =>
      tf.browser
        .fromPixels(canvas)
        .toFloat()
        .div(tf.scalar(127))
        .sub(tf.scalar(1))
        .expandDims(0)
    );
    const rawOutput = model.predict(input);
    const output = Array.isArray(rawOutput) ? rawOutput[0] : rawOutput;
    if (!(output instanceof tf.Tensor)) {
      input.dispose();
      throw new Error("The trained food model returned an unsupported result.");
    }

    let scores: Float32Array;
    try {
      scores = await output.data() as Float32Array;
    } finally {
      input.dispose();
      output.dispose();
    }

    const predictions = Array.from(scores, (probability, index) => ({
      className: labels[index] ?? 'Class ' + (index + 1),
      probability,
    })).sort((first, second) => second.probability - first.probability);
    if (predictions.length === 0) {
      throw new Error("The trained food model did not return any predictions.");
    }

    return {
      foodName: predictions[0].className,
      confidence: Math.round(predictions[0].probability * 100),
      alternatives: predictions.slice(1, 4).map((item) => item.className),
      source: "trained",
    };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

async function classifyWithMobileNet(imageBlob: Blob): Promise<FoodPrediction> {
  const tf = await import("@tensorflow/tfjs");
  const mobilenet = await import("@tensorflow-models/mobilenet");
  await tf.ready();

  mobileNetModelPromise ??= mobilenet.load({ version: 2, alpha: 0.5 });
  const model = await mobileNetModelPromise;
  const imageUrl = URL.createObjectURL(imageBlob);

  try {
    const image = new Image();
    image.src = imageUrl;
    await image.decode();

    const predictions = await model.classify(image, 4);
    if (predictions.length === 0) {
      throw new Error("The local image model did not recognize this photo.");
    }

    return {
      foodName: predictions[0].className,
      confidence: Math.round(predictions[0].probability * 100),
      alternatives: predictions.slice(1).map((item) => item.className),
      source: "local",
    };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

async function identifyFoodWithExistingFallbacks(imageUri: string): Promise<FoodPrediction> {
  const imageResponse = await fetch(imageUri);
  if (!imageResponse.ok) {
    throw new Error("The selected photo could not be loaded.");
  }
  const imageBlob = await imageResponse.blob();

  try {
    const formData = new FormData();
    formData.append("image", imageBlob, "food.jpg");

    const apiResponse = await fetch("/api/food", {
      method: "POST",
      body: formData,
    });
    const responseText = await apiResponse.text();

    if (!apiResponse.ok) {
      throw new Error(`Food API error (${apiResponse.status}): ${responseText}`);
    }

    const predictions = JSON.parse(responseText);
    if (!Array.isArray(predictions) || predictions.length === 0) {
      throw new Error("The AI did not return any food predictions.");
    }

    return {
      foodName: String(predictions[0].label ?? predictions[0].foodName ?? "Unknown food"),
      confidence: Math.round(Number(predictions[0].score ?? predictions[0].confidence ?? 0) * 100),
      alternatives: predictions.slice(1, 4).map((item) => String(item.label ?? item.foodName ?? "Unknown food")),
      source: "remote",
    };
  } catch {
    return classifyWithMobileNet(imageBlob);
  }
}


export async function identifyFood(imageUri: string): Promise<FoodPrediction> {
  try {
    const imageResponse = await fetch(imageUri);
    if (!imageResponse.ok) {
      throw new Error("The selected photo could not be loaded.");
    }

    return await classifyWithTrainedModel(await imageResponse.blob());
  } catch {
    return identifyFoodWithExistingFallbacks(imageUri);
  }
}
