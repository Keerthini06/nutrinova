# NutriNova

NutriNova is an Expo and React Native food-analysis demo. On web, it uses a custom Google Teachable Machine image classifier to recognize eight foods, then displays approximate nutrition and glycemic context from local reference profiles.

## Features

- Recognizes Biriyani, Chapathi, Dosa, Idli, Samosa, Gulab Jamun, Jalebi, and Curd rice.
- Shows the predicted label, model confidence, and alternative matches.
- Displays estimated calories, carbohydrates, sugars, fibre, protein, fat, and available carbohydrates for a reference serving.
- Lets the user adjust servings and updates the nutrition estimates.
- Shows glycemic index and estimated glycemic load only when a matching reference is available.
- Shows approximate walking and jogging durations for the estimated calories, using a fixed 70 kg reference adult.

All food nutrition values are illustrative estimates. A photo does not determine the exact ingredients or portion. Glycemic data is not a prediction of an individual's blood-glucose response, and activity times are not personalized.

## Run the phone-browser demo

Requirements: Node.js and npm.

```bash
npm install
npx expo start --web --lan
```

Keep the development server running. Open the LAN address printed by Expo in a phone browser while the phone and computer are on the same Wi-Fi. The browser loads the custom model from the Teachable Machine URL configured in `src/lib/foodAI.web.ts`.

## Native API configuration

The native Expo path uses `src/app/api/food+api.ts`, which sends images to Hugging Face ResNet-50. To use that path, create a local `.env` file containing:

```text
HF_TOKEN=your_hugging_face_token
```

Keep `.env` private. It is ignored by Git and must never be committed. Hugging Face inference availability and credits are managed by Hugging Face.

## Main code areas

- `src/app/index.tsx` — photo selection and home screen.
- `src/app/analyze.tsx` — analysis screen, serving controls, nutrition, glycemic context, and activity estimates.
- `src/lib/foodAI.web.ts` — custom TensorFlow.js model flow for web.
- `src/lib/foodAI.ts` — API-based recognition flow for native platforms.
- `src/app/api/food+api.ts` — server-side Hugging Face API route.
- `src/lib/glucoLens.ts` — local nutrition profiles and serving calculations.

`npx expo start --web --lan` runs the tested browser demo. The native API recognition path is separate and requires an available Hugging Face inference service.
