
import type { FoodPrediction } from "./foodTypes";

export type { FoodPrediction } from "./foodTypes";

export async function identifyFood(
  imageUri: string
): Promise<FoodPrediction> {
  const response = await fetch(imageUri);
  const imageBlob = await response.blob();

  const formData = new FormData();
  formData.append("image", imageBlob, "food.jpg");

  const apiResponse = await fetch("/api/food", {
    method: "POST",
    body: formData,
  });

  if (!apiResponse.ok) {
    const errorText = await apiResponse.text();
    throw new Error(
      `Food API error (${apiResponse.status}): ${errorText}`
    );
  }

  const predictions = await apiResponse.json();

  if (!Array.isArray(predictions) || predictions.length === 0) {
    throw new Error("The AI did not return any food predictions.");
  }

  const best = predictions[0];

  const foodName = String(
    best.label ?? best.foodName ?? "Unknown food"
  );

  const confidence = Number(best.score ?? best.confidence ?? 0);

  return {
    foodName,
    confidence: Math.round(confidence * 100),
    alternatives: predictions
      .slice(1, 4)
      .map((item: { label?: string; foodName?: string }) =>
        String(item.label ?? item.foodName ?? "Unknown food")
      ),
    source: "remote",
  };
}
