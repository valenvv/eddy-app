"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function LearningTestPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [learningStyle, setLearningStyle] = useState<string | null>(null)

  const questions = [
    {
      question: "¿Cómo te gusta aprender más?",
      options: [
        { id: "visual", text: "Viendo imágenes y videos", icon: "👁️" },
        { id: "auditory", text: "Escuchando explicaciones", icon: "👂" },
        { id: "kinesthetic", text: "Haciendo actividades prácticas", icon: "✋" },
        { id: "reading", text: "Leyendo instrucciones", icon: "📚" },
      ],
    },
    {
      question: "¿Qué actividad prefieres?",
      options: [
        { id: "visual", text: "Dibujar y colorear", icon: "🎨" },
        { id: "auditory", text: "Cantar o escuchar música", icon: "🎵" },
        { id: "kinesthetic", text: "Jugar deportes", icon: "⚽" },
        { id: "reading", text: "Leer cuentos", icon: "📖" },
      ],
    },
    {
      question: "¿Cómo recuerdas mejor las cosas?",
      options: [
        { id: "visual", text: "Con imágenes y colores", icon: "🌈" },
        { id: "auditory", text: "Repitiendo en voz alta", icon: "🗣️" },
        { id: "kinesthetic", text: "Moviéndote o actuando", icon: "🏃" },
        { id: "reading", text: "Escribiendo notas", icon: "✏️" },
      ],
    },
  ]

  const handleAnswer = async (answerId: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerId
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Submit all answers when the last question is answered
      setIsSubmitting(true)

      try {
        // Get the studentId from localStorage or use default
        const studentId = localStorage.getItem("studentId") || "student_123"

        const response = await fetch("/api/students/learning-style", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId,
            answers: [...newAnswers, answerId],
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to save learning style")
        }

        setLearningStyle(data.learningStyle)
        setShowResults(true)
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to save learning style",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const getLearningStyle = () => {
    const styles: Record<string, { title: string; description: string; icon: string }> = {
      visual: {
        title: "¡Eres un Explorador Visual!",
        description: "Aprendes mejor con imágenes, videos y colores.",
        icon: "👁️",
      },
      auditory: {
        title: "¡Eres un Maestro Auditivo!",
        description: "Aprendes mejor escuchando y hablando.",
        icon: "👂",
      },
      kinesthetic: {
        title: "¡Eres un Aventurero Kinestésico!",
        description: "Aprendes mejor haciendo y moviéndote.",
        icon: "✋",
      },
      reading: {
        title: "¡Eres un Sabio Lector!",
        description: "Aprendes mejor leyendo y escribiendo.",
        icon: "📚",
      },
    }

    return styles[learningStyle || "visual"]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 via-blue-300 to-purple-300 flex flex-col items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden my-8">
        {!showResults ? (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-green-600">Test de Aprendizaje</h1>
              <span className="text-lg font-medium bg-green-100 px-3 py-1 rounded-full">
                {currentQuestion + 1}/{questions.length}
              </span>
            </div>

            <h2 className="text-xl font-medium text-center mb-6">{questions[currentQuestion].question}</h2>

            <div className="space-y-4 mb-6">
              {questions[currentQuestion].options.map((option) => (
                <Button
                  key={option.id}
                  className="w-full py-6 text-left flex items-center justify-start bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl"
                  variant="ghost"
                  onClick={() => handleAnswer(option.id)}
                  disabled={isSubmitting}
                >
                  <span className="text-2xl mr-4">{option.icon}</span>
                  <span className="text-lg">{option.text}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">{getLearningStyle().icon}</div>
            <h1 className="text-3xl font-bold text-purple-600 mb-2">{getLearningStyle().title}</h1>
            <p className="text-lg text-gray-600 mb-6">{getLearningStyle().description}</p>

            <Link href="/student/dashboard">
              <Button className="w-full py-6 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-bold">
                Ver mis tareas
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

