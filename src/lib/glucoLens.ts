/**
 * Demo reference estimates for common Indian foods. Values are approximate per
 * default serving and vary with recipe, size, and cooking method. They are not
 * laboratory measurements of the photographed dish.
 */
export type FoodNutrition = {
  key: string;
  label: string;
  serving: string;
  grams: number;
  calories: number;
  carbohydrates: number;
  sugars: number;
  fibre: number;
  protein: number;
  fat: number;
  gi?: number;
  giMatch?: string;
  giNote?: string;
};

export const foodNutrition: FoodNutrition[] = [
  { key: "idli", label: "Idli", serving: "2 idlis", grams: 120, calories: 146, carbohydrates: 29, sugars: 1, fibre: 1, protein: 4, fat: 1 },
  { key: "dosa", label: "Dosa", serving: "1 plain dosa", grams: 100, calories: 168, carbohydrates: 27, sugars: 2, fibre: 1, protein: 4, fat: 5, gi: 79, giMatch: "Plain dosa (study-tested recipe)", giNote: "study mean 79.39 ± 6.8 (SD)" },
  { key: "samosa", label: "Samosa", serving: "1 medium samosa", grams: 100, calories: 260, carbohydrates: 32, sugars: 2, fibre: 3, protein: 5, fat: 12 },
  { key: "chapati", label: "Chapati", serving: "1 chapati", grams: 40, calories: 120, carbohydrates: 19, sugars: 1, fibre: 3, protein: 4, fat: 3, gi: 62, giMatch: "Chapati (study-tested recipe)", giNote: "study mean 62.43 ± 6.1 (SD)" },
  { key: "biryani", label: "Biryani", serving: "1 cup vegetable biryani", grams: 250, calories: 350, carbohydrates: 52, sugars: 4, fibre: 3, protein: 8, fat: 11, gi: 75, giMatch: "Vegetable biryani (study-tested recipe)", giNote: "study mean 74.53 ± 6.1 (SD)" },
  { key: "idli sambar", label: "Idli with sambar", serving: "2 idlis + 1/2 cup sambar", grams: 220, calories: 210, carbohydrates: 36, sugars: 4, fibre: 5, protein: 8, fat: 4, gi: 69, giMatch: "Idli sambar (study-tested meal)", giNote: "study mean 68.69 ± 5.8 (SD)" },
  { key: "gulab jamun", label: "Gulab jamun", serving: "1 medium piece", grams: 45, calories: 145, carbohydrates: 23, sugars: 17, fibre: 0, protein: 2, fat: 5 },
  { key: "jalebi", label: "Jalebi", serving: "2 small pieces", grams: 60, calories: 240, carbohydrates: 39, sugars: 25, fibre: 0, protein: 2, fat: 8 },
  { key: "curd rice", label: "Curd rice", serving: "1 cup", grams: 240, calories: 245, carbohydrates: 40, sugars: 4, fibre: 1, protein: 7, fat: 5, gi: 65, giMatch: "Curd rice (study-tested recipe)", giNote: "study mean 64.94 ± 5.6 (SD)" },
];

export function findFoodNutrition(foodName: string): FoodNutrition | undefined {
  const name = foodName.toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
  if (name.includes("idli") && name.includes("sambar")) return foodNutrition.find((food) => food.key === "idli sambar");
  if (/\bbiriyani\b|\bbiriani\b/.test(name)) return foodNutrition.find((food) => food.key === "biryani");
  if (/\bchapathi\b/.test(name)) return foodNutrition.find((food) => food.key === "chapati");
  return foodNutrition.find((food) => name === food.key || name.includes(food.key));
}

export function scaleNutrition(food: FoodNutrition, servings: number) {
  const scale = servings;
  const round = (value: number) => Math.round(value * scale * 10) / 10;
  const availableCarbs = Math.max(0, food.carbohydrates - food.fibre);
  return {
    calories: Math.round(food.calories * scale),
    carbohydrates: round(food.carbohydrates),
    sugars: round(food.sugars),
    fibre: round(food.fibre),
    protein: round(food.protein),
    fat: round(food.fat),
    availableCarbs: round(availableCarbs),
    glycemicLoad: food.gi == null ? undefined : Math.round(availableCarbs * servings * food.gi / 100 * 10) / 10,
  };
}

export const nutritionSource = "https://www.nin.res.in/ebooks/IFCT2017.pdf";
export const giSource = "https://www.nin.res.in/dietaryguidelines/pdfjs/locale/DGI07052024P.pdf";
export const giDatabaseSource = "https://glycemicindex.com/gi-search/";
