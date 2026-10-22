export type FoodPrediction = {
  foodName: string;
  confidence: number;
  alternatives: string[];
  source: "remote" | "local" | "trained";
};
