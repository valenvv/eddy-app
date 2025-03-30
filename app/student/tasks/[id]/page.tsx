"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Upload, Check, Camera, Headphones, BookOpen, PenTool, ArrowLeft } from "lucide-react"
import NavigationBar from "@/components/navigation-bar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [content, setContent] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const [learningStyle, setLearningStyle] = useState<string>("visual")
  const [activeTab, setActiveTab] = useState<string>("visual")

  const learningStyles = [
    { id: "visual", name: "Visual", icon: <Camera className="h-5 w-5" /> },
    { id: "auditory", name: "Auditivo", icon: <Headphones className="h-5 w-5" /> },
    { id: "reading", name: "Lector", icon: <BookOpen className="h-5 w-5" /> },
    { id: "kinesthetic", name: "Kinestésico", icon: <PenTool className="h-5 w-5" /> },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the student ID
        const studentId = localStorage.getItem("studentId") || "student_123"

        // Fetch student's learning style
        const styleResponse = await fetch(`/api/students/learning-style?studentId=${studentId}`)

        if (styleResponse.ok) {
          const styleData = await styleResponse.json()
          setLearningStyle(styleData.learningStyle)
          setActiveTab(styleData.learningStyle)
        }

        // Fetch task details
        // In a real app, this would fetch the specific task from the API
        const tasksResponse = await fetch(`/api/tasks?studentId=${studentId}`)

        if (!tasksResponse.ok) {
          throw new Error("Failed to fetch tasks")
        }

        const tasksData = await tasksResponse.json()
        const currentTask = tasksData.find((t: any) => t.id === params.id)

        if (currentTask) {
          setTask(currentTask)
        } else {
          throw new Error("Task not found")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch task details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Get the student ID
      const studentId = localStorage.getItem("studentId") || "student_123"

      const response = await fetch(`/api/tasks/${params.id}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          content,
          fileUrl,
          learningStyle: activeTab, // Submit with the selected learning style
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit task")
      }

      // If the learning style has changed, update it
      if (activeTab !== learningStyle) {
        await fetch("/api/students/learning-style", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId,
            answers: [activeTab, activeTab, activeTab], // Simple way to ensure this style is chosen
          }),
        })
      }

      toast({
        title: "Tarea enviada correctamente",
        description: "Tu profesor revisará tu trabajo pronto",
      })

      // Redirect to dashboard after successful submission
      router.push("/student/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit task",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, this would upload the file to storage
    // For now, we'll just simulate it
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFileUrl(`file://${file.name}`)
      toast({
        title: "Archivo subido",
        description: file.name,
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-400 via-orange-300 to-red-300 flex flex-col items-center justify-center p-4">
        <p>Cargando detalles de la tarea...</p>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-400 via-orange-300 to-red-300 flex flex-col items-center justify-center p-4">
        <p>No se encontró la tarea</p>
        <Button onClick={() => router.push("/student/dashboard")} className="mt-4">
          Volver al tablero
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-400 via-orange-300 to-red-300 flex flex-col items-center p-4 pb-24">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden my-8">
        <div className="p-6">
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/student/dashboard")}
              className="flex items-center text-orange-600 hover:text-orange-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Volver</span>
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-orange-600 mb-4">Detalles de la Tarea</h1>

          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">¿Quieres probar otro estilo de aprendizaje?</h2>
            <p className="text-sm text-gray-600 mb-4">
              Puedes elegir un estilo diferente para esta tarea. Esto te ayudará a descubrir cómo aprendes mejor.
            </p>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="grid grid-cols-4 h-auto p-1">
                {learningStyles.map((style) => (
                  <TabsTrigger key={style.id} value={style.id} className="flex flex-col items-center py-3 px-2">
                    {style.icon}
                    <span className="text-xs mt-2">{style.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Display the task for the selected learning style */}
          {task.tasksByLearningStyle && task.tasksByLearningStyle[activeTab] && (
            <Card className="p-4 bg-blue-50 mb-6">
              <h2 className="font-bold text-lg mb-2">{task.tasksByLearningStyle[activeTab][0]?.title}</h2>
              <p>{task.tasksByLearningStyle[activeTab][0]?.description}</p>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-medium">Tu respuesta</label>
              <Textarea
                placeholder="Escribe tu respuesta aquí..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium">Subir archivo (opcional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Haz clic para subir o arrastra y suelta</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF hasta 10MB</p>
                  </div>
                </label>

                {fileUrl && (
                  <div className="mt-4 p-2 bg-green-50 rounded flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Archivo subido correctamente</span>
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={submitting}>
              {submitting ? "Enviando..." : "Entregar Tarea"}
            </Button>
          </form>
        </div>
      </div>

      <NavigationBar />
    </div>
  )
}

