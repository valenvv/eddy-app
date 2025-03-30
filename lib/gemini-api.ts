import { env } from "@/lib/env"

// Function to generate content using Gemini API with the recommended model
export async function generateWithGemini(prompt: string) {
  try {
    // Use the recommended model directly instead of trying to list and find one
    const modelName = "gemini-1.5-flash"
    const apiVersion = "v1"

    console.log(`Using model: ${modelName}`)

    const response = await fetch(
      `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Gemini API error:", errorText)
      throw new Error(`Gemini API error: ${errorText}`)
    }

    const geminiResponse = await response.json()

    // Extract the response text from Gemini's response structure
    const responseText = geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || ""

    if (!responseText) {
      console.error("Empty response from Gemini API")
      throw new Error("Empty response from Gemini API")
    }

    return responseText
  } catch (error) {
    console.error("Error generating with Gemini:", error)
    throw error
  }
}

