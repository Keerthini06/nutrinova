
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { findFoodNutrition, scaleNutrition, giSource, giDatabaseSource, nutritionSource } from "../lib/glucoLens";
import {
  identifyFood,
  type FoodPrediction,
} from "../lib/foodAI";

const commonFoodCorrections = ["Biriyani", "Dosa", "Chapathi", "Idli", "Samosa", "Gulab Jamun", "Jalebi", "Curd rice"];
const activityReferenceWeightKg = 70;
const activityOptions = [
  { label: "Moderate walk · 2.8–3.4 mph", met: 3.8 },
  { label: "Jog · 4.3–4.8 mph", met: 7.8 },
];

function activityMinutes(calories: number, met: number) {
  const estimatedCaloriesPerMinute = met * 3.5 * activityReferenceWeightKg / 200;
  return Math.ceil(calories / estimatedCaloriesPerMinute);
}

export default function AnalyzeScreen() {
  const params = useLocalSearchParams<{ image?: string | string[] }>();
  const router = useRouter();

  const imageUri = Array.isArray(params.image)
    ? params.image[0]
    : params.image;

  const [foodResult, setFoodResult] =
    useState<FoodPrediction | null>(null);
  const [foodNameInput, setFoodNameInput] = useState("");
  const [correctedFoodName, setCorrectedFoodName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [servings, setServings] = useState(1);
  const [mealContext, setMealContext] = useState<"alone" | "mixed">("alone");
  const displayedFood = correctedFoodName || foodResult?.foodName || "";
  const nutrition = displayedFood ? findFoodNutrition(displayedFood) : undefined;
  const estimate = nutrition ? scaleNutrition(nutrition, servings) : undefined;

  useEffect(() => {
    let cancelled = false;

    async function analyzeImage() {
      if (!imageUri) {
        setErrorMessage("No image was selected. Please go back and choose a food image.");
        return;
      }

      setLoading(true);
      setErrorMessage("");
      setFoodResult(null);
      setFoodNameInput("");
      setCorrectedFoodName("");
      setServings(1);

      try {
        const result = await identifyFood(imageUri);

        if (!cancelled) {
          setFoodResult(result);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Food analysis failed. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    analyzeImage();

    return () => {
      cancelled = true;
    };
  }, [imageUri]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>NutriNova</Text>
      <Text style={styles.subtitle}>Your food analysis</Text>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.foodImage} />
      ) : null}

      {loading && (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={styles.statusText}>Analyzing your food...</Text>
          <Text style={styles.helperText}>
            This may take a little while the local image model loads.
          </Text>
        </View>
      )}

      {!!errorMessage && !loading && (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Analysis unsuccessful</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              if (imageUri) {
                setErrorMessage("");
                setLoading(true);
                identifyFood(imageUri)
                  .then(setFoodResult)
                  .catch((error: unknown) => {
                    setErrorMessage(
                      error instanceof Error
                        ? error.message
                        : "Please try again."
                    );
                  })
                  .finally(() => setLoading(false));
              }
            }}
          >
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )}

      {foodResult && !loading && (
        <View style={styles.resultCard}>
          <Text style={styles.sectionTitle}>
            {correctedFoodName ? "Your corrected label" : "Detected food"}
          </Text>
          <Text style={styles.foodName}>
            {correctedFoodName || foodResult.foodName}
          </Text>
          {correctedFoodName ? (
            <Text style={styles.localModelNotice}>
              The AI’s original guess was {foodResult.foodName} at {foodResult.confidence}%.
              It may not have identified the food correctly. Your correction changes
              the label shown here only; it does not teach or change the model.
            </Text>
          ) : null}
          {foodResult.source === "trained" && (
            <Text style={styles.localModelNotice}>
              Prediction from your custom-trained food model. Confirm the dish
              name; visually similar foods and foods outside its classes may be
              mistaken for one another.
            </Text>
          )}
          {foodResult.source === "local" && (
            <Text style={styles.localModelNotice}>
              Cloud recognition isn’t available right now. The app used a general
              image model, which can mistake food for unrelated objects. Treat its
              guess as a rough suggestion.
            </Text>
          )}

          <View style={styles.scoreRow}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreValue}>
                {foodResult.confidence}%
              </Text>
              <Text style={styles.scoreLabel}>
                {correctedFoodName ? "Confidence in original AI guess" : "Model confidence"}
              </Text>
            </View>
          </View>

          <View style={styles.glucoseCard}>
            <Text style={styles.glucoseHeading}>GlucoLens · serving estimate</Text>
            <Text style={styles.glucoseIntro}>Photo recognition identifies a likely food; it cannot measure the ingredients or portion. Check the food label and serving below.</Text>
            {nutrition && estimate ? (
              <>
                <Text style={styles.servingHint}>Reference serving: {nutrition.serving} ({nutrition.grams} g)</Text>
                <View style={styles.portionRow}>
                  <Text style={styles.portionLabel}>Servings</Text>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel="Reduce serving amount" style={styles.portionButton} onPress={() => setServings((value) => Math.max(0.5, value - 0.5))}><Text style={styles.portionButtonText}>−</Text></TouchableOpacity>
                  <Text style={styles.portionValue}>{servings.toFixed(servings % 1 ? 1 : 0)}</Text>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel="Increase serving amount" style={styles.portionButton} onPress={() => setServings((value) => Math.min(5, value + 0.5))}><Text style={styles.portionButtonText}>+</Text></TouchableOpacity>
                </View>
                <View style={styles.nutritionGrid}>
                  <NutritionValue label="Calories" value={`${estimate.calories}`} unit="kcal" />
                  <NutritionValue label="Carbohydrates" value={`${estimate.carbohydrates}`} unit="g" />
                  <NutritionValue label="Total sugars" value={`${estimate.sugars}`} unit="g" />
                  <NutritionValue label="Fibre" value={`${estimate.fibre}`} unit="g" />
                  <NutritionValue label="Available carbs*" value={`${estimate.availableCarbs}`} unit="g" />
                  <NutritionValue label="Protein · Fat" value={`${estimate.protein} · ${estimate.fat}`} unit="g" />
                </View>
                <View style={styles.activityCard}>
                  <Text style={styles.glucoseHeadingSmall}>Activity energy equivalent</Text>
                  <Text style={styles.glucoseIntro}>About how long activity might use energy equal to this serving&apos;s estimated {estimate.calories} kcal:</Text>
                  {activityOptions.map((activity) => {
                    const minutes = activityMinutes(estimate.calories, activity.met);
                    const duration = minutes >= 60
                      ? `${Math.floor(minutes / 60)} hr${Math.floor(minutes / 60) === 1 ? "" : "s"}${minutes % 60 ? ` ${minutes % 60} min` : ""}`
                      : `${minutes} min`;
                    return (
                      <View key={activity.label} style={styles.activityRow}>
                        <Text style={styles.activityLabel}>{activity.label}</Text>
                        <Text style={styles.activityDuration}>~{duration}</Text>
                      </View>
                    );
                  })}
                  <Text style={styles.contextNote}>Illustrative estimate for a 70 kg adult, based on standard activity intensity values. Actual energy use varies by person and pace. This is not a recommendation to exercise to compensate for food.</Text>
                  <Link href="https://pacompendium.com/" style={styles.sourceLink}>Activity intensity source: 2024 Adult Compendium</Link>
                </View>
                <Text style={styles.glucoseHeadingSmall}>Glycemic context</Text>
                {nutrition.gi != null ? (
                  <>
                    <Text style={styles.giValue}>GI {nutrition.gi} · {nutrition.gi < 56 ? "Low" : nutrition.gi < 70 ? "Medium" : "High"}{nutrition.giNote ? ` · ${nutrition.giNote}` : ""}</Text>
                    <Text style={styles.glucoseIntro}>Closest study match: {nutrition.giMatch}. Portion-based estimated glycemic load (GL): {estimate.glycemicLoad}. This scales the study GI by your estimated available carbs; it is not a blood-glucose reading or a prediction of your personal response.</Text>
                    <Text style={styles.glucoseIntro}>Meal context</Text>
                    <View style={styles.contextRow}>
                      <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: mealContext === "alone" }} style={[styles.contextButton, mealContext === "alone" && styles.contextButtonSelected]} onPress={() => setMealContext("alone")}><Text style={[styles.contextText, mealContext === "alone" && styles.contextTextSelected]}>On its own</Text></TouchableOpacity>
                      <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: mealContext === "mixed" }} style={[styles.contextButton, mealContext === "mixed" && styles.contextButtonSelected]} onPress={() => setMealContext("mixed")}><Text style={[styles.contextText, mealContext === "mixed" && styles.contextTextSelected]}>Mixed meal</Text></TouchableOpacity>
                    </View>
                    <Text style={styles.contextNote}>{mealContext === "mixed" ? "Protein, fat, fibre, and other foods can change digestion and the meal response. This demo does not apply an unvalidated numeric adjustment." : "The GI comes from a controlled test of a specific food recipe. Your actual response depends on your body and how the food was prepared."}</Text>
                    <Text style={styles.sourceLine}>GI evidence: ICMR-NIN Dietary Guidelines for Indians 2024 (study-tested food values).</Text>
                    <Link href={giSource} style={styles.sourceLink}>Open ICMR-NIN source</Link>
                    <Link href={giDatabaseSource} style={styles.sourceLink}>Search University of Sydney GI database</Link>
                  </>
                ) : (
                  <Text style={styles.contextNote}>No sufficiently close GI study match is available for this food in the current demo. A GI value is not guessed. Ingredients and cooking methods can change the result.</Text>
                )}
                <Text style={styles.disclaimer}>*Available carbohydrate is estimated as total carbohydrate minus fibre. All nutrition values shown here are approximate generic recipe estimates, not measurements from this photo; actual values vary by recipe and portion. They are for a class demo, not medical advice.</Text>
                <Text style={styles.sourceLine}>These prepared-food numbers are provisional illustrative estimates, not copied from the IFCT. IFCT 2017 provides ingredient composition and does not validate these recipes or portions.</Text>
                <Link href={nutritionSource} style={styles.sourceLink}>Open ICMR-NIN IFCT 2017 ingredient tables</Link>
              </>
            ) : (
              <Text style={styles.contextNote}>No matching reference profile for “{displayedFood}”. Correct the food label above to one of the supported foods to show an estimate. We don’t invent nutrition values for unmatched foods.</Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>Correct the food name</Text>
          <Text style={styles.helperText}>
            Quick choices
          </Text>
          <View style={styles.quickChoices}>
            {commonFoodCorrections.map((food) => (
              <TouchableOpacity
                key={food}
                accessibilityRole="button"
                accessibilityState={{ selected: correctedFoodName === food }}
                style={[
                  styles.quickChoice,
                  correctedFoodName === food && styles.quickChoiceSelected,
                ]}
                onPress={() => setCorrectedFoodName(food)}
              >
                <Text
                  style={[
                    styles.quickChoiceText,
                    correctedFoodName === food && styles.quickChoiceTextSelected,
                  ]}
                >
                  {food}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.correctionRow}>
            <TextInput
              value={foodNameInput}
              onChangeText={setFoodNameInput}
              placeholder="For example, samosa"
              accessibilityLabel="Correct food name"
              returnKeyType="done"
              onSubmitEditing={() => {
                const name = foodNameInput.trim();
                if (name) setCorrectedFoodName(name);
              }}
              style={styles.correctionInput}
            />
            <TouchableOpacity
              accessibilityRole="button"
              disabled={!foodNameInput.trim()}
              style={[
                styles.correctionButton,
                !foodNameInput.trim() && styles.correctionButtonDisabled,
              ]}
              onPress={() => setCorrectedFoodName(foodNameInput.trim())}
            >
              <Text style={styles.correctionButtonText}>Use name</Text>
            </TouchableOpacity>
          </View>
          {correctedFoodName ? (
            <TouchableOpacity
              style={styles.resetCorrectionButton}
              onPress={() => setCorrectedFoodName("")}
            >
              <Text style={styles.resetCorrectionText}>Show model result</Text>
            </TouchableOpacity>
          ) : null}

          {!correctedFoodName ? (
            <>
              <Text style={styles.sectionTitle}>Other possible matches</Text>
              {foodResult.alternatives.length > 0 ? (
            foodResult.alternatives.map((food: string, index: number) => (
              <Text key={`${food}-${index}`} style={styles.alternative}>
                • {food}
              </Text>
            ))
              ) : (
                <Text style={styles.helperText}>
                  No alternative matches were returned.
                </Text>
              )}
            </>
          ) : null}

          <Text style={styles.disclaimer}>AI predictions can be incorrect. Confirm the food and portion before using these estimates.</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.homeButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 22,
    paddingTop: 55,
    backgroundColor: "#F8FAFC",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  backText: {
    color: "#15803D",
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#166534",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 22,
  },
  foodImage: {
    width: "100%",
    height: 240,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
    marginBottom: 22,
  },
  statusContainer: {
    alignItems: "center",
    padding: 24,
  },
  statusText: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: "600",
    color: "#334155",
  },
  helperText: {
    marginTop: 8,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  errorCard: {
    backgroundColor: "#FEF2F2",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
  },
  errorTitle: {
    color: "#B91C1C",
    fontSize: 18,
    fontWeight: "700",
  },
  errorText: {
    color: "#7F1D1D",
    marginTop: 8,
    lineHeight: 21,
  },
  retryButton: {
    backgroundColor: "#B91C1C",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  glucoseCard: {
    backgroundColor: "#F2F7EF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#DCE8D9",
  },
  glucoseHeading: { fontSize: 19, fontWeight: "800", color: "#214E34", marginBottom: 8 },
  glucoseHeadingSmall: { fontSize: 16, fontWeight: "800", color: "#214E34", marginTop: 18, marginBottom: 8 },
  glucoseIntro: { fontSize: 13, color: "#526653", lineHeight: 19, marginBottom: 10 },
  servingHint: { color: "#526653", fontSize: 12, marginTop: 2 },
  portionRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 12 },
  portionLabel: { color: "#334155", fontSize: 14, fontWeight: "700", flex: 1 },
  portionButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 17, backgroundColor: "#DCEBDD" },
  portionButtonText: { color: "#214E34", fontSize: 22, fontWeight: "700", lineHeight: 26 },
  portionValue: { minWidth: 32, textAlign: "center", color: "#214E34", fontWeight: "800", fontSize: 16 },
  nutritionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  nutritionValueCard: { width: "48%", flexGrow: 1, backgroundColor: "#FFFFFF", borderRadius: 12, padding: 11, borderWidth: 1, borderColor: "#E4EBE0" },
  nutritionValueNumber: { fontSize: 17, fontWeight: "800", color: "#245C45" },
  nutritionUnit: { fontSize: 11, fontWeight: "600", color: "#6B786B" },
  nutritionValueLabel: { fontSize: 11, color: "#64748B", marginTop: 4 },
  activityCard: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: "#E4EBE0" },
  activityRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: "#EEF2EA" },
  activityLabel: { flex: 1, color: "#365842", fontSize: 12, fontWeight: "600" },
  activityDuration: { color: "#214E34", fontSize: 14, fontWeight: "800" },
  giValue: { fontSize: 17, color: "#214E34", fontWeight: "800", marginBottom: 8 },
  contextRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  contextButton: { borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: "#B8CDB8", backgroundColor: "#FFFFFF" },
  contextButtonSelected: { backgroundColor: "#245C45", borderColor: "#245C45" },
  contextText: { color: "#365842", fontWeight: "600", fontSize: 12 },
  contextTextSelected: { color: "#FFFFFF" },
  contextNote: { color: "#526653", fontSize: 12, lineHeight: 18, marginBottom: 8 },
  sourceLine: { fontSize: 11, color: "#64748B", lineHeight: 16, marginTop: 7 },
  sourceLink: { color: "#166534", fontSize: 12, fontWeight: "700", marginTop: 6, textDecorationLine: "underline" },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 10,
  },
  foodName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#166534",
    marginBottom: 20,
  },
  localModelNotice: {
    color: "#475569",
    fontSize: 13,
    lineHeight: 19,
    marginTop: -12,
    marginBottom: 18,
  },
  scoreRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    padding: 14,
    borderRadius: 12,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#15803D",
  },
  scoreLabel: {
    fontSize: 12,
    color: "#475569",
    marginTop: 6,
  },
  alternative: {
    fontSize: 15,
    color: "#475569",
    paddingVertical: 5,
  },
  disclaimer: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 20,
    lineHeight: 18,
  },
  correctionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  quickChoices: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  quickChoice: {
    borderWidth: 1,
    borderColor: "#BBF7D0",
    backgroundColor: "#F0FDF4",
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  quickChoiceSelected: {
    backgroundColor: "#15803D",
    borderColor: "#15803D",
  },
  quickChoiceText: {
    color: "#166534",
    fontSize: 14,
    fontWeight: "600",
  },
  quickChoiceTextSelected: {
    color: "#FFFFFF",
  },
  correctionInput: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  correctionButton: {
    backgroundColor: "#15803D",
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  correctionButtonDisabled: {
    opacity: 0.5,
  },
  correctionButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  resetCorrectionButton: {
    alignSelf: "flex-start",
    marginTop: -10,
    marginBottom: 18,
  },
  resetCorrectionText: {
    color: "#15803D",
    fontWeight: "600",
  },
  homeButton: {
    backgroundColor: "#16A34A",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 25,
  },
  homeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

function NutritionValue({ label, value, unit }: { label: string; value: string; unit: string }) {
  return <View style={styles.nutritionValueCard}><Text style={styles.nutritionValueNumber}>{value} <Text style={styles.nutritionUnit}>{unit}</Text></Text><Text style={styles.nutritionValueLabel}>{label}</Text></View>;
}
