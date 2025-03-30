"use client"

import { env } from "@/lib/env"

// Task difficulty levels
export type DifficultyLevel = "basic" | "intermediate" | "advanced"

// Task formats
export type TaskFormat = "multiple-choice" | "short-answer" | "essay" | "practical" | "project" | "quiz"

// Learning styles
export type LearningStyle =
  | "visual"
  | "auditory"
  | "reading"
  | 'kinesthetic"gStyle = "visual'
  | "auditory"
  | "reading"
  | "kinesthetic"

export async function directGenerateTasks(data: {
  classId: string
  subject: string
  description?: string
  learningObjectives?: string[]
  difficultyLevel?: DifficultyLevel
  taskFormats?: TaskFormat[]
}) {
  try {
    const {
      classId,
      subject,
      description = "",
      learningObjectives = [],
      difficultyLevel = "intermediate",
      taskFormats = ["multiple-choice", "short-answer", "essay", "practical"],
    } = data

    if (!classId || !subject) {
      throw new Error("ClassId and subject are required")
    }

    // Ensure difficultyLevel is a string to prevent toLowerCase errors
    const safeLevel = typeof difficultyLevel === "string" ? difficultyLevel : "intermediate"

    // Ensure taskFormats is an array
    const safeFormats =
      Array.isArray(taskFormats) && taskFormats.length > 0
        ? taskFormats
        : ["multiple-choice", "short-answer", "essay", "practical"]

    // Format learning objectives for the prompt
    const objectivesText =
      Array.isArray(learningObjectives) && learningObjectives.length > 0
        ? `
Learning Objectives:
${learningObjectives.map((obj: string, i: number) => `${i + 1}. ${String(obj)}`).join("\n")}`
        : ""

    // Prepare the prompt - use safeLevel.toUpperCase() to avoid undefined errors
    const prompt = `
    IMPORTANTE: Genera todo el contenido en ESPAÑOL.
    
    Genera opciones de tareas educativas para diferentes estilos de aprendizaje basadas en este tema: "${subject}" ${description ? `con estas instrucciones adicionales: "${description}"` : ""} ${objectivesText}

    El nivel de dificultad debe ser: ${safeLevel.toUpperCase()}
    
    Para cada estilo de aprendizaje (visual, auditivo, lectura, kinestésico), crea 4 opciones diferentes de tareas que sean apropiadas para estudiantes.
    
    Incluye una variedad de formatos de tareas entre las opciones:
    ${safeFormats.join(", ")}
    
    Cada tarea debe tener:
    1. Un título corto y atractivo (máximo 50 caracteres)
    2. Una descripción clara que explique lo que el estudiante debe hacer (máximo 200 caracteres)
    
    IMPORTANTE: Tu respuesta debe ser un objeto JSON válido con la siguiente estructura:
    
    {
      "visual": [
        {"id": "v1", "title": "Título de la tarea", "description": "Descripción de la tarea"},
        {"id": "v2", "title": "Título de la tarea", "description": "Descripción de la tarea"},
        {"id": "v3", "title": "Título de la tarea", "description": "Descripción de la tarea"},
        {"id": "v4", "title": "Título de la tarea", "description": "Descripción de la tarea"}
      ],
      "auditory": [
        {"id": "a1", "title": "Título de la tarea", "description": "Descripción de la tarea"},
        {"id": "a2", "title": "Título de la tarea", "description": "Descripción de la tarea"},
        {"id": "a3", "title": "Título de la tarea", "description": "Descripción de la tarea"},
        {"id": "a4", "title": "Título de la tarea", "description": "Descripción de la tarea"}
      ],
      "reading": [
        {"id": "r1", "title": "Título de la tarea", "description": "Descripción de la tarea"},
        {"id": "r2", "title": "Título de la tarea", "description": "Descripción de la tarea"},
        {"id": "r3", "title": "Título de la tarea", "description": "Descripción de la tarea"},
        {"id": "r4", "title": "Título de la tarea", "description": "Descripción de la tarea"}
      ],
      "kinesthetic": [
        {"id": "k1", "title": "Título de la tarea", "description": "Descripción de la tarea"},
        {"id": "k2", "title": "Título de la tarea", "description": "Descripción de la tarea"},
        {"id": "k3", "title": "Título de la tarea", "description": "Descripción de la tarea"},
        {"id": "k4", "title": "Título de la tarea", "description": "Descripción de la tarea"}
      ]
    }
    
    Devuelve SOLO el objeto JSON sin texto adicional.
    `

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

      // Try to parse the response as JSON
      try {
        // Extract JSON from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        const jsonText = jsonMatch ? jsonMatch[0] : responseText

        const parsedData = JSON.parse(jsonText)

        // Validate the structure
        const requiredStyles = ["visual", "auditory", "reading", "kinesthetic"]
        const missingStyles = requiredStyles.filter((style) => !parsedData[style] || !Array.isArray(parsedData[style]))

        if (missingStyles.length > 0) {
          console.log("Missing styles in AI response:", missingStyles)
          return generateMockTaskOptions(subject, description, safeLevel, safeFormats)
        }

        // Add IDs to the tasks if they don't have them
        const timestamp = Date.now()
        const result: any = {}

        requiredStyles.forEach((style) => {
          result[style] = parsedData[style].map((task: any, index: number) => ({
            id: task.id || `${style}_${index + 1}_${timestamp}`,
            title: task.title || `Task for ${style}`,
            description: task.description || `This is a ${style} task for ${subject}`,
          }))
        })

        return result
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError)
        return generateMockTaskOptions(subject, description, safeLevel, safeFormats)
      }
    } catch (aiError) {
      console.error("Error with Gemini API:", aiError)
      return generateMockTaskOptions(subject, description, safeLevel, safeFormats)
    }
  } catch (error) {
    console.error("General error in task generation:", error)
    // Always return mock data
    return generateMockTaskOptions("General topic", "", "intermediate", [
      "multiple-choice",
      "short-answer",
      "essay",
      "practical",
    ])
  }
}

// Fallback function to generate mock task options if the AI fails
function generateMockTaskOptions(
  subject: string,
  description?: string,
  difficultyLevel: DifficultyLevel = "intermediate",
  taskFormats: TaskFormat[] = ["multiple-choice", "short-answer", "essay", "practical"],
) {
  const timestamp = Date.now()

  // Mock task generation for different learning styles
  return {
    visual: [
      {
        id: `visual_1_${timestamp}`,
        title: `Crear un mapa mental sobre ${subject}`,
        description: `Diseña un mapa mental colorido que muestre los conceptos principales de ${subject}. ${description || ""}`,
      },
      {
        id: `visual_2_${timestamp}`,
        title: `Infografía de ${subject}`,
        description: `Crea una infografía visual que explique los aspectos más importantes de ${subject}. ${description || ""}`,
      },
      {
        id: `visual_3_${timestamp}`,
        title: `Video explicativo sobre ${subject}`,
        description: `Graba un video corto explicando ${subject} usando elementos visuales. ${description || ""}`,
      },
      {
        id: `visual_4_${timestamp}`,
        title: `Cuestionario visual sobre ${subject}`,
        description: `Responde a preguntas basadas en diagramas y gráficos sobre ${subject}. ${description || ""}`,
      },
    ],
    auditory: [
      {
        id: `auditory_1_${timestamp}`,
        title: `Podcast sobre ${subject}`,
        description: `Graba un podcast explicando los conceptos clave de ${subject}. ${description || ""}`,
      },
      {
        id: `auditory_2_${timestamp}`,
        title: `Debate sobre ${subject}`,
        description: `Prepara y graba un debate con un compañero sobre ${subject}. ${description || ""}`,
      },
      {
        id: `auditory_3_${timestamp}`,
        title: `Canción sobre ${subject}`,
        description: `Crea una canción o rap que explique los conceptos de ${subject}. ${description || ""}`,
      },
      {
        id: `auditory_4_${timestamp}`,
        title: `Preguntas de comprensión auditiva sobre ${subject}`,
        description: `Escucha una explicación y responde preguntas sobre ${subject}. ${description || ""}`,
      },
    ],
    reading: [
      {
        id: `reading_1_${timestamp}`,
        title: `Ensayo sobre ${subject}`,
        description: `Escribe un ensayo detallado sobre ${subject}. ${description || ""}`,
      },
      {
        id: `reading_2_${timestamp}`,
        title: `Resumen de ${subject}`,
        description: `Lee sobre ${subject} y crea un resumen con los puntos clave. ${description || ""}`,
      },
      {
        id: `reading_3_${timestamp}`,
        title: `Cuestionario sobre ${subject}`,
        description: `Responde a preguntas de opción múltiple sobre ${subject}. ${description || ""}`,
      },
      {
        id: `reading_4_${timestamp}`,
        title: `Glosario de términos de ${subject}`,
        description: `Crea un glosario con los términos más importantes de ${subject}. ${description || ""}`,
      },
    ],
    kinesthetic: [
      {
        id: `kinesthetic_1_${timestamp}`,
        title: `Experimento práctico sobre ${subject}`,
        description: `Diseña y realiza un experimento práctico relacionado con ${subject}. ${description || ""}`,
      },
      {
        id: `kinesthetic_2_${timestamp}`,
        title: `Maqueta sobre ${subject}`,
        description: `Construye una maqueta o modelo 3D que represente ${subject}. ${description || ""}`,
      },
      {
        id: `kinesthetic_3_${timestamp}`,
        title: `Juego de rol sobre ${subject}`,
        description: `Crea y participa en un juego de rol que explique ${subject}. ${description || ""}`,
      },
      {
        id: `kinesthetic_4_${timestamp}`,
        title: `Preguntas prácticas sobre ${subject}`,
        description: `Responde preguntas basadas en actividades prácticas sobre ${subject}. ${description || ""}`,
      },
    ],
  }
}

