"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import NavigationBar from "@/components/navigation-bar"
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
      question: "Quiero aprender a jugar un nuevo juego de mesa o de cartas. Yo:",
      options: [
        { id: "kinesthetic", text: "Observaría a otros jugar antes de unirme al juego." },
        { id: "auditory", text: "Escucharía a alguien que lo explicara y haría preguntas." },
        {
          id: "visual",
          text: "Utilizaría los diagramas que explican las distintas fases, movimientos y estrategias del juego.",
        },
        { id: "reading", text: "Leería las instrucciones." },
      ],
    },
    {
      question: "Quiero aprender a hacer algo nuevo en una computadora. Yo:",
      options: [
        { id: "reading", text: "Leería las instrucciones escritas que vienen con el programa." },
        { id: "auditory", text: "Hablaría con personas que conozcan el programa." },
        { id: "kinesthetic", text: "Empezaría a utilizarlo y aprender por ensayo y error." },
        { id: "visual", text: "Seguiría los diagramas de un libro." },
      ],
    },
    {
      question: "Prefiero un profesor o maestro que utilice:",
      options: [
        { id: "kinesthetic", text: "Demostraciones, modelos o sesiones prácticas." },
        { id: "auditory", text: "Preguntas y respuestas, charlas, discusiones en grupo u oradores invitados." },
        { id: "reading", text: "Folletos, libros o lecturas." },
        { id: "visual", text: "Diagramas, cuadros, mapas o gráficos." },
      ],
    },
    {
      question: "Acabo de terminar una competencia o una prueba y quiero recibir una opinión. Me gustaría recibirla:",
      options: [
        { id: "kinesthetic", text: "Utilizando ejemplos de lo que he hecho." },
        { id: "reading", text: "Mediante una descripción escrita de mis resultados." },
        { id: "auditory", text: "De alguien que lo hable conmigo." },
        { id: "visual", text: "Mediante gráficos que muestren lo que alcancé." },
      ],
    },
    {
      question: "Cuando aprendo de Internet, me gusta:",
      options: [
        { id: "kinesthetic", text: "Los vídeos que muestran cómo hacer o fabricar algo." },
        { id: "visual", text: "El diseño y las características visuales interesantes." },
        { id: "reading", text: "Descripciones, listas y explicaciones escritas interesantes." },
        { id: "auditory", text: "Los canales de audio donde puedo escuchar podcasts o entrevistas." },
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
        // In a real app, get the studentId from authentication
        const studentId = "student_123"

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
    <div className="min-h-screen bg-gradient-to-b from-green-400 via-blue-300 to-purple-300 flex flex-col items-center p-4 pb-24">
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

            <Link href="/tasks">
              <Button className="w-full py-6 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-bold">
                Ver mis tareas
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      <NavigationBar />
    </div>
  )
}

