
export async function POST(request: Request) {
  try {
    const token = process.env.HF_TOKEN;

    if (!token) {
      return Response.json(
        { error: "HF_TOKEN is missing. Check your root .env file." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    // Expo's React Native FormData declaration omits get(), but Request.formData()
    // returns the standard server-side FormData implementation at runtime.
    const image = (formData as unknown as { get(name: string): unknown }).get(
      "image"
    );

    if (!(image instanceof Blob)) {
      return Response.json(
        { error: "No food image was received." },
        { status: 400 }
      );
    }

    const imageBytes = await image.arrayBuffer();

    const hfResponse = await fetch(
      "https://router.huggingface.co/hf-inference/models/microsoft/resnet-50",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": image.type || "image/jpeg",
        },
        body: imageBytes,
      }
    );

    const responseText = await hfResponse.text();

console.log("HF HTTP status:", hfResponse.status);
console.log("HF response body:", responseText);

let result;

try {
  result = JSON.parse(responseText);
} catch {
  result = { message: responseText };
}

    if (!hfResponse.ok) {
      console.error("Hugging Face status:", hfResponse.status);
console.error("Hugging Face error details:", JSON.stringify(result, null, 2));

      return Response.json(
        { error: "Food recognition service failed.", details: result },
        { status: hfResponse.status }
      );
    }

    if (!Array.isArray(result)) {
      return Response.json(
        { error: "Unexpected response from food recognition service.", details: result },
        { status: 502 }
      );
    }

    return Response.json(result);
  } catch (error) {
    console.error("Food API route error:", error);

    return Response.json(
      { error: "Unable to analyze the food image." },
      { status: 500 }
    );
  }
}
