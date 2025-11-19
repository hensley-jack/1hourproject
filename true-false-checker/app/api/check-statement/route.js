// app/api/check-statement/route.js  (your folder name may be different)
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Make sure the API key exists on the server
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set");
      return NextResponse.json(
        {
          verdict: "FALSE",
          explanation: "Server misconfiguration: GEMINI_API_KEY is missing.",
        },
        { status: 500 }
      );
    }

    const { statement } = await request.json();

    console.log("Received statement:", statement);

    const apiResponse = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // This never goes to the browser, it's read only on the server
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Analyze this statement and determine if it's TRUE or FALSE: "${statement}"
                  
Respond in this exact JSON format with no other text:
{
  "verdict": "TRUE" or "FALSE",
  "explanation": "Brief explanation of why this is true or false"
}
`,
                },
              ],
            },
          ],
        }),
      }
    );

    console.log("API Response status:", apiResponse.status);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("API Error Response:", errorText);
      throw new Error(`API returned ${apiResponse.status}: ${errorText}`);
    }

    const data = await apiResponse.json();
    console.log("API Response data:", data);

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    // Strip ```json fences if Gemini wraps the JSON
    const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();

    const parsed = JSON.parse(cleanText);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Detailed API Error:", error);
    return NextResponse.json(
      {
        verdict: "FALSE",
        explanation: `Error: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
