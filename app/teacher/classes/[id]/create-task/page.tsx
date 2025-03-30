"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Camera, Headphones, BookOpen, PenTool, Loader2, Plus, Trash2, ArrowLeft } from "lucide-react"
import TeacherNavigationBar from "@/components/teacher-navigation-bar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Types
type DifficultyLevel = "basic" | "intermediate" | "advanced"
type TaskFormat = "multiple-choice" | "short-answer" | "essay" | "practical" | "project" | "quiz"
type LearningStyle = "visual" | "auditory" | "reading" | "kinesthetic"

interface TaskOption {
  id: string
  title: string
  description: string
}

export default function CreateTaskPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
  })
  const [learningObjectives, setLearningObjectives] = useState<string[]>([])
  const [newObjective, setNewObjective] = useState("")
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>("intermediate")
  const [selectedTaskFormats, setSelectedTaskFormats] = useState<TaskFormat[]>([
    "multiple-choice",
    "short-answer",
    "essay",
    "practical",
  ])
  const [taskOptions, setTaskOptions] = useState<Record<LearningStyle, TaskOption[]> | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<Record<LearningStyle, string[]>>({
    visual: [],
    auditory: [],
    reading: [],
    kinesthetic: [],
  })
  const [editingTask, setEditingTask] = useState<{
    style: LearningStyle
    task: TaskOption
  } | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const addLearningObjective = () => {
    if (newObjective.trim()) {
      setLearningObjectives([...learningObjectives, newObjective.trim()])
      setNewObjective("")
    }
  }

  const removeLearningObjective = (index: number) => {
    setLearningObjectives(learningObjectives.filter((_, i) => i !== index))
  }

  const toggleTaskFormat = (format: TaskFormat) => {
    if (selectedTaskFormats.includes(format)) {
      setSelectedTaskFormats(selectedTaskFormats.filter((f) => f !== format))
    } else {
      setSelectedTaskFormats([...selectedTaskFormats, format])
    }
  }

  // Update the handleGenerateTasks function to use the server action directly if possible
  // or fall back to the API route
  const handleGenerateTasks = async () => {
    if (!formData.subject) {
      toast({
        title: "Error",
        description: "Por favor ingresa un tema",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Use client-side mock data as immediate fallback
      const mockData = generateClientMockData(formData.subject, formData.description)

      // Try to fetch from API with a timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout for AI generation

      try {
        console.log("Sending request to generate tasks:", {
          classId: params.id,
          subject: formData.subject,
          description: formData.description,
          learningObjectives,
          difficultyLevel,
          taskFormats: selectedTaskFormats,
        })

        // Call the API route
        const response = await fetch("/api/tasks/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            classId: params.id,
            subject: formData.subject,
            description: formData.description,
            learningObjectives,
            difficultyLevel,
            taskFormats: selectedTaskFormats,
          }),
          signal: controller.signal,
          cache: "no-store", // Ensure we're not using cached responses
        })

        clearTimeout(timeoutId)

        // If response is not ok, use mock data
        if (!response.ok) {
          console.error(`API returned status ${response.status}`)
          const errorText = await response.text()
          console.error("Error response:", errorText)
          throw new Error(`API error: ${response.status}`)
        }

        // Try to parse the response as JSON
        let data
        try {
          data = await response.json()
          console.log("Received task data:", data)
        } catch (parseError) {
          console.error("Error parsing response:", parseError)
          throw new Error("Failed to parse server response")
        }

        // Validate the data structure
        if (!data || typeof data !== "object") {
          console.error("Invalid response format:", data)
          throw new Error("Invalid response format")
        }

        // Check if we have the required learning styles
        const requiredStyles: LearningStyle[] = ["visual", "auditory", "reading", "kinesthetic"]
        const missingStyles = requiredStyles.filter((style) => !data[style] || !Array.isArray(data[style]))

        if (missingStyles.length > 0) {
          console.error("Missing learning styles in response:", missingStyles)
          throw new Error(`Missing learning styles: ${missingStyles.join(", ")}`)
        }

        // Set the task options
        setTaskOptions(data as Record<LearningStyle, TaskOption[]>)

        // Select the first task for each learning style by default
        const initialSelection: Record<LearningStyle, string[]> = {
          visual: data.visual.length > 0 ? [data.visual[0].id] : [],
          auditory: data.auditory.length > 0 ? [data.auditory[0].id] : [],
          reading: data.reading.length > 0 ? [data.reading[0].id] : [],
          kinesthetic: data.kinesthetic.length > 0 ? [data.kinesthetic[0].id] : [],
        }

        setSelectedTasks(initialSelection)

        toast({
          title: "Tareas generadas con IA",
          description: "Se han generado opciones de tareas para cada estilo de aprendizaje",
        })
      } catch (fetchError) {
        console.error("Error fetching or processing tasks:", fetchError)

        // Use the mock data we prepared earlier
        setTaskOptions(mockData)

        // Select the first task for each learning style by default
        const initialSelection: Record<LearningStyle, string[]> = {
          visual: mockData.visual.length > 0 ? [mockData.visual[0].id] : [],
          auditory: mockData.auditory.length > 0 ? [mockData.auditory[0].id] : [],
          reading: mockData.reading.length > 0 ? [mockData.reading[0].id] : [],
          kinesthetic: mockData.kinesthetic.length > 0 ? [mockData.kinesthetic[0].id] : [],
        }

        setSelectedTasks(initialSelection)

        toast({
          title: "Usando opciones predefinidas",
          description: "No se pudo conectar con el servicio de IA. Puedes continuar con estas opciones.",
          variant: "warning",
        })
      }
    } catch (error) {
      console.error("General error in task generation:", error)

      // Final fallback - generate mock data client-side
      const mockData = generateClientMockData(formData.subject, formData.description)
      setTaskOptions(mockData)

      // Select the first task for each learning style by default
      const initialSelection: Record<LearningStyle, string[]> = {
        visual: mockData.visual.length > 0 ? [mockData.visual[0].id] : [],
        auditory: mockData.auditory.length > 0 ? [mockData.auditory[0].id] : [],
        reading: mockData.reading.length > 0 ? [mockData.reading[0].id] : [],
        kinesthetic: mockData.kinesthetic.length > 0 ? [mockData.kinesthetic[0].id] : [],
      }

      setSelectedTasks(initialSelection)

      toast({
        title: "Usando opciones predefinidas",
        description: "Se produjo un error. Puedes continuar con estas opciones predefinidas.",
        variant: "warning",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Client-side fallback for generating mock data
  const generateClientMockData = (subject: string, description?: string) => {
    const timestamp = Date.now()

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

  const handleTaskSelection = (learningStyle: LearningStyle, taskId: string) => {
    setSelectedTasks((prev) => {
      const currentSelection = [...prev[learningStyle]]

      if (currentSelection.includes(taskId)) {
        return {
          ...prev,
          [learningStyle]: currentSelection.filter((id) => id !== taskId),
        }
      } else {
        return {
          ...prev,
          [learningStyle]: [...currentSelection, taskId],
        }
      }
    })
  }

  const handleEditTask = (style: LearningStyle, task: TaskOption) => {
    setEditingTask({ style, task: { ...task } })
    setIsEditDialogOpen(true)
  }

  const handleSaveEditedTask = () => {
    if (!editingTask || !taskOptions) return

    const { style, task } = editingTask

    setTaskOptions({
      ...taskOptions,
      [style]: taskOptions[style].map((t) => (t.id === task.id ? task : t)),
    })

    setIsEditDialogOpen(false)
    setEditingTask(null)

    toast({
      title: "Tarea actualizada",
      description: "Los cambios han sido guardados",
    })
  }

  const getFilteredTasks = (style: LearningStyle) => {
    if (!taskOptions) return []
    return taskOptions[style]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Check if at least one task is selected for each learning style
      const hasEmptyLearningStyle = Object.values(selectedTasks).some((tasks) => tasks.length === 0)

      if (hasEmptyLearningStyle) {
        throw new Error("Selecciona al menos una tarea para cada estilo de aprendizaje")
      }

      // Create task assignments based on selected tasks
      const tasksByLearningStyle: Record<string, any[]> = {}

      if (!taskOptions) {
        throw new Error("No se han generado opciones de tareas")
      }

      Object.entries(selectedTasks).forEach(([style, taskIds]) => {
        tasksByLearningStyle[style] = taskIds.map((id) => {
          const tasksByStyle = taskOptions[style as LearningStyle]
          return tasksByStyle.find((task: TaskOption) => task.id === id)
        })
      })

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classId: params.id,
          tasksByLearningStyle,
          theme: formData.subject, // Añadimos el tema de la tarea
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`)
      }

      toast({
        title: "Tareas creadas exitosamente",
        description: "Las tareas han sido asignadas a los estudiantes según su estilo de aprendizaje",
      })

      router.push(`/teacher/classes/${params.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear tareas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStyleIcon = (style: LearningStyle) => {
    switch (style) {
      case "visual":
        return <Camera className="h-5 w-5" />
      case "auditory":
        return <Headphones className="h-5 w-5" />
      case "reading":
        return <BookOpen className="h-5 w-5" />
      case "kinesthetic":
        return <PenTool className="h-5 w-5" />
    }
  }

  const getStyleLabel = (style: LearningStyle) => {
    switch (style) {
      case "visual":
        return "Visual"
      case "auditory":
        return "Auditivo"
      case "reading":
        return "Lector"
      case "kinesthetic":
        return "Kinestésico"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-indigo-300 to-purple-300 flex flex-col items-center p-4 pb-24">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden my-8">
        <div className="p-6">
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/teacher/classes/${params.id}`)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Volver</span>
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">Crear Tarea</h1>

          <Accordion type="single" collapsible defaultValue="step1" className="mb-6">
            <AccordionItem value="step1">
              <AccordionTrigger className="text-lg font-medium">1. Información básica</AccordionTrigger>
              <AccordionContent>
                <Card className="p-4 mb-4">
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Tema</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="Ej: Sistema Solar, Fracciones, Segunda Guerra Mundial"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Instrucciones Adicionales (Opcional)</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Ingresa cualquier instrucción adicional para la tarea"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                      />
                    </div>
                  </form>
                </Card>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step2">
              <AccordionTrigger className="text-lg font-medium">2. Objetivos de aprendizaje</AccordionTrigger>
              <AccordionContent>
                <Card className="p-4 mb-4">
                  <div className="space-y-4">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label htmlFor="newObjective" className="mb-2 block">
                          Añadir objetivo
                        </Label>
                        <Input
                          id="newObjective"
                          value={newObjective}
                          onChange={(e) => setNewObjective(e.target.value)}
                          placeholder="Ej: Comprender los planetas del Sistema Solar"
                        />
                      </div>
                      <Button type="button" onClick={addLearningObjective} disabled={!newObjective.trim()}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {learningObjectives.length > 0 ? (
                      <div className="space-y-2">
                        <Label>Objetivos añadidos:</Label>
                        <ul className="space-y-2">
                          {learningObjectives.map((objective, index) => (
                            <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                              <span>{objective}</span>
                              <Button variant="ghost" size="sm" onClick={() => removeLearningObjective(index)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No hay objetivos añadidos. Los objetivos ayudan a la IA a generar tareas más relevantes.
                      </p>
                    )}
                  </div>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button
            type="button"
            onClick={handleGenerateTasks}
            className="w-full bg-blue-500 hover:bg-blue-600 rounded-xl"
            disabled={isGenerating || !formData.subject}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando opciones con IA...
              </>
            ) : (
              "Generar Opciones de Tareas con IA"
            )}
          </Button>

          {taskOptions && (
            <form onSubmit={handleSubmit} className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Selecciona Tareas</h2>
              </div>

              <p className="text-gray-600 mb-6">
                Selecciona al menos una tarea para cada estilo de aprendizaje. Estas tareas serán asignadas a los
                estudiantes según su estilo de aprendizaje.
              </p>

              <Tabs defaultValue="visual" className="mb-6">
                <TabsList className="grid grid-cols-4 mb-4 p-1 h-auto">
                  <TabsTrigger value="visual" className="flex flex-col items-center py-2">
                    <Camera className="h-5 w-5" />
                    <span className="text-xs mt-1">Visual</span>
                  </TabsTrigger>
                  <TabsTrigger value="auditory" className="flex flex-col items-center py-2">
                    <Headphones className="h-5 w-5" />
                    <span className="text-xs mt-1">Auditivo</span>
                  </TabsTrigger>
                  <TabsTrigger value="reading" className="flex flex-col items-center py-2">
                    <BookOpen className="h-5 w-5" />
                    <span className="text-xs mt-1">Lector</span>
                  </TabsTrigger>
                  <TabsTrigger value="kinesthetic" className="flex flex-col items-center py-2">
                    <PenTool className="h-5 w-5" />
                    <span className="text-xs mt-1">Kinestésico</span>
                  </TabsTrigger>
                </TabsList>

                {(["visual", "auditory", "reading", "kinesthetic"] as LearningStyle[]).map((style) => (
                  <TabsContent key={style} value={style} className="space-y-4">
                    {getFilteredTasks(style).length > 0 ? (
                      getFilteredTasks(style).map((task) => (
                        <Card key={task.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id={task.id}
                              checked={selectedTasks[style].includes(task.id)}
                              onCheckedChange={() => handleTaskSelection(style, task.id)}
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <Label htmlFor={task.id} className="text-lg font-medium cursor-pointer">
                                  {task.title}
                                </Label>
                              </div>
                              <p className="text-gray-600 mb-2">{task.description}</p>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No hay tareas que coincidan con los filtros seleccionados.</p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>

              <Button
                type="submit"
                className="w-full py-6 text-lg bg-blue-500 hover:bg-blue-600 rounded-xl font-bold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear y Asignar Tareas"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>

      <TeacherNavigationBar />

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Tarea</DialogTitle>
            <DialogDescription>Personaliza esta tarea para adaptarla a tus necesidades.</DialogDescription>
          </DialogHeader>

          {editingTask && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={editingTask.task.title}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      task: { ...editingTask.task, title: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  value={editingTask.task.description}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      task: { ...editingTask.task, description: e.target.value },
                    })
                  }
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2 bg-blue-50 p-2 rounded-md">
                <div className="p-2 bg-blue-100 rounded-full">{getStyleIcon(editingTask.style)}</div>
                <div>
                  <p className="text-sm font-medium">Estilo de aprendizaje: {getStyleLabel(editingTask.style)}</p>
                  <p className="text-xs text-gray-500">
                    Las tareas se asignarán a estudiantes con este estilo de aprendizaje
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEditedTask}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

