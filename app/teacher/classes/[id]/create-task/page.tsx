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
import { Camera, Headphones, BookOpen, PenTool } from "lucide-react"
import TeacherNavigationBar from "@/components/teacher-navigation-bar"

export default function CreateTaskPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
  })
  const [taskOptions, setTaskOptions] = useState<any>(null)
  const [selectedTasks, setSelectedTasks] = useState<Record<string, string[]>>({
    visual: [],
    auditory: [],
    reading: [],
    kinesthetic: [],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

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
      const response = await fetch("/api/tasks/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classId: params.id,
          subject: formData.subject,
          description: formData.description,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al generar opciones de tareas")
      }

      const data = await response.json()
      setTaskOptions(data)

      // Select the first task for each learning style by default
      const initialSelection: Record<string, string[]> = {
        visual: [data.visual[0].id],
        auditory: [data.auditory[0].id],
        reading: [data.reading[0].id],
        kinesthetic: [data.kinesthetic[0].id],
      }

      setSelectedTasks(initialSelection)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al generar tareas",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTaskSelection = (learningStyle: string, taskId: string) => {
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

      Object.entries(selectedTasks).forEach(([style, taskIds]) => {
        tasksByLearningStyle[style] = taskIds.map((id) => {
          const tasksByStyle = taskOptions[style]
          return tasksByStyle.find((task: any) => task.id === id)
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
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear tareas")
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-indigo-300 to-purple-300 flex flex-col items-center p-4 pb-24">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden my-8">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">Crear Tarea</h1>

          <Card className="p-4 mb-6">
            <form className="space-y-6">
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

              <Button
                type="button"
                onClick={handleGenerateTasks}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-xl"
                disabled={isGenerating}
              >
                {isGenerating ? "Generando..." : "Generar Opciones de Tareas"}
              </Button>
            </form>
          </Card>

          {taskOptions && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-bold mb-4">Selecciona Tareas para Cada Estilo de Aprendizaje</h2>
              <p className="text-gray-600 mb-6">
                Selecciona al menos una tarea para cada estilo de aprendizaje. Estas tareas serán asignadas a los
                estudiantes según su estilo de aprendizaje.
              </p>

              <Tabs defaultValue="visual" className="mb-6">
                <TabsList className="grid grid-cols-4 mb-4">
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
                    <span className="text-xs mt-1">Lectura</span>
                  </TabsTrigger>
                  <TabsTrigger value="kinesthetic" className="flex flex-col items-center py-2">
                    <PenTool className="h-5 w-5" />
                    <span className="text-xs mt-1">Práctico</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="visual" className="space-y-4">
                  {taskOptions.visual.map((task: any) => (
                    <Card key={task.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={task.id}
                          checked={selectedTasks.visual.includes(task.id)}
                          onCheckedChange={() => handleTaskSelection("visual", task.id)}
                        />
                        <div>
                          <Label htmlFor={task.id} className="text-lg font-medium cursor-pointer">
                            {task.title}
                          </Label>
                          <p className="text-gray-600">{task.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="auditory" className="space-y-4">
                  {taskOptions.auditory.map((task: any) => (
                    <Card key={task.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={task.id}
                          checked={selectedTasks.auditory.includes(task.id)}
                          onCheckedChange={() => handleTaskSelection("auditory", task.id)}
                        />
                        <div>
                          <Label htmlFor={task.id} className="text-lg font-medium cursor-pointer">
                            {task.title}
                          </Label>
                          <p className="text-gray-600">{task.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="reading" className="space-y-4">
                  {taskOptions.reading.map((task: any) => (
                    <Card key={task.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={task.id}
                          checked={selectedTasks.reading.includes(task.id)}
                          onCheckedChange={() => handleTaskSelection("reading", task.id)}
                        />
                        <div>
                          <Label htmlFor={task.id} className="text-lg font-medium cursor-pointer">
                            {task.title}
                          </Label>
                          <p className="text-gray-600">{task.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="kinesthetic" className="space-y-4">
                  {taskOptions.kinesthetic.map((task: any) => (
                    <Card key={task.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={task.id}
                          checked={selectedTasks.kinesthetic.includes(task.id)}
                          onCheckedChange={() => handleTaskSelection("kinesthetic", task.id)}
                        />
                        <div>
                          <Label htmlFor={task.id} className="text-lg font-medium cursor-pointer">
                            {task.title}
                          </Label>
                          <p className="text-gray-600">{task.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>

              <Button
                type="submit"
                className="w-full py-6 text-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-xl font-bold"
                disabled={isLoading}
              >
                {isLoading ? "Creando..." : "Crear y Asignar Tareas"}
              </Button>
            </form>
          )}
        </div>
      </div>

      <TeacherNavigationBar />
    </div>
  )
}

