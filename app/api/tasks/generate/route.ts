import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { classId, subject, description } = data

    if (!classId || !subject) {
      return NextResponse.json({ error: "ClassId and subject are required" }, { status: 400 })
    }

    // In a real implementation, this would call an AI service
    // For now, we'll generate mock tasks for each learning style
    const taskOptions = generateTaskOptions(subject, description)

    return NextResponse.json(taskOptions, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate task options" }, { status: 500 })
  }
}

function generateTaskOptions(subject: string, description?: string) {
  // Mock task generation for different learning styles
  const taskOptions = {
    visual: [
      {
        id: `visual_1_${Date.now()}`,
        title: `Crear un mapa mental sobre ${subject}`,
        description: `Diseña un mapa mental colorido que muestre los conceptos principales de ${subject}. ${description || ""}`,
      },
      {
        id: `visual_2_${Date.now()}`,
        title: `Infografía de ${subject}`,
        description: `Crea una infografía visual que explique los aspectos más importantes de ${subject}. ${description || ""}`,
      },
      {
        id: `visual_3_${Date.now()}`,
        title: `Video explicativo sobre ${subject}`,
        description: `Graba un video corto explicando ${subject} usando elementos visuales. ${description || ""}`,
      },
      {
        id: `visual_4_${Date.now()}`,
        title: `Póster ilustrativo de ${subject}`,
        description: `Diseña un póster con ilustraciones que expliquen ${subject}. ${description || ""}`,
      },
    ],
    auditory: [
      {
        id: `auditory_1_${Date.now()}`,
        title: `Podcast sobre ${subject}`,
        description: `Graba un podcast explicando los conceptos clave de ${subject}. ${description || ""}`,
      },
      {
        id: `auditory_2_${Date.now()}`,
        title: `Debate sobre ${subject}`,
        description: `Prepara y graba un debate con un compañero sobre ${subject}. ${description || ""}`,
      },
      {
        id: `auditory_3_${Date.now()}`,
        title: `Canción sobre ${subject}`,
        description: `Crea una canción o rap que explique los conceptos de ${subject}. ${description || ""}`,
      },
      {
        id: `auditory_4_${Date.now()}`,
        title: `Explicación verbal de ${subject}`,
        description: `Graba una explicación verbal detallada sobre ${subject}. ${description || ""}`,
      },
    ],
    reading: [
      {
        id: `reading_1_${Date.now()}`,
        title: `Ensayo sobre ${subject}`,
        description: `Escribe un ensayo detallado sobre ${subject}. ${description || ""}`,
      },
      {
        id: `reading_2_${Date.now()}`,
        title: `Resumen de ${subject}`,
        description: `Lee sobre ${subject} y crea un resumen con los puntos clave. ${description || ""}`,
      },
      {
        id: `reading_3_${Date.now()}`,
        title: `Cuestionario sobre ${subject}`,
        description: `Crea un cuestionario con preguntas y respuestas sobre ${subject}. ${description || ""}`,
      },
      {
        id: `reading_4_${Date.now()}`,
        title: `Glosario de términos de ${subject}`,
        description: `Crea un glosario con los términos más importantes de ${subject}. ${description || ""}`,
      },
    ],
    kinesthetic: [
      {
        id: `kinesthetic_1_${Date.now()}`,
        title: `Experimento práctico sobre ${subject}`,
        description: `Diseña y realiza un experimento práctico relacionado con ${subject}. ${description || ""}`,
      },
      {
        id: `kinesthetic_2_${Date.now()}`,
        title: `Maqueta sobre ${subject}`,
        description: `Construye una maqueta o modelo 3D que represente ${subject}. ${description || ""}`,
      },
      {
        id: `kinesthetic_3_${Date.now()}`,
        title: `Juego de rol sobre ${subject}`,
        description: `Crea y participa en un juego de rol que explique ${subject}. ${description || ""}`,
      },
      {
        id: `kinesthetic_4_${Date.now()}`,
        title: `Actividad interactiva sobre ${subject}`,
        description: `Diseña una actividad interactiva para aprender sobre ${subject}. ${description || ""}`,
      },
    ],
  }

  return taskOptions
}

