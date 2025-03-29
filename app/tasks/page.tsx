"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Headphones, BookOpen, PenTool } from "lucide-react"
import NavigationBar from "@/components/navigation-bar"
import { toast } from "@/components/ui/use-toast"

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState("visual")
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [learningStyle, setLearningStyle] = useState<string | null>(null)

  const learningStyles = [
    { id: "visual", name: "Visual", icon: <Camera className="h-5 w-5" /> },
    { id: "auditory", name: "Auditivo", icon: <Headphones className="h-5 w-5" /> },
    { id: "reading", name: "Lectura", icon: <BookOpen className="h-5 w-5" /> },
    { id: "kinesthetic", name: "Práctico", icon: <PenTool className="h-5 w-5" /> },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, get the studentId from authentication
        const studentId = "student_123"

        // Fetch student's learning style
        const styleResponse = await fetch(`/api/students/learning-style?studentId=${studentId}`)

        if (styleResponse.ok) {
          const styleData = await styleResponse.json()
          setLearningStyle(styleData.learningStyle)
          setActiveTab(styleData.learningStyle)
        }

        // Fetch tasks assigned to the student
        const tasksResponse = await fetch(`/api/tasks?studentId=${studentId}`)

        if (!tasksResponse.ok) {
          throw new Error("Failed to fetch tasks")
        }

        const tasksData = await tasksResponse.json()
        setTasks(tasksData)
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getTasksForLearningStyle = (style: string) => {
    if (tasks.length === 0) return []

    return tasks.flatMap((task: any) => {
      const tasksForStyle = task.tasksByLearningStyle?.[style] || []
      return tasksForStyle.map((t: any) => ({
        ...t,
        taskId: task.id,
        color: getColorForStyle(style),
      }))
    })
  }

  const getColorForStyle = (style: string) => {
    switch (style) {
      case "visual":
        return "bg-blue-100"
      case "auditory":
        return "bg-yellow-100"
      case "reading":
        return "bg-green-100"
      case "kinesthetic":
        return "bg-purple-100"
      default:
        return "bg-blue-100"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-400 via-orange-300 to-red-300 flex flex-col items-center justify-center p-4">
        <p>Cargando tareas...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-400 via-orange-300 to-red-300 flex flex-col items-center p-4 pb-24">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden my-8">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center text-orange-600 mb-6">Mis Tareas</h1>

          <Tabs
            defaultValue={learningStyle || "visual"}
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-6"
          >
            <TabsList className="grid grid-cols-4 mb-4">
              {learningStyles.map((style) => (
                <TabsTrigger key={style.id} value={style.id} className="flex flex-col items-center py-2">
                  {style.icon}
                  <span className="text-xs mt-1">{style.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {learningStyles.map((style) => {
              const styleTasks = getTasksForLearningStyle(style.id)

              return (
                <TabsContent key={style.id} value={style.id} className="mt-0">
                  {styleTasks.length > 0 ? (
                    <div className="space-y-3">
                      {styleTasks.map((task: any) => (
                        <Link href={`/student/tasks/${task.taskId}`} key={task.id}>
                          <Card
                            className={`${task.color} p-4 rounded-xl hover:shadow-md transition-shadow cursor-pointer`}
                          >
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium">{task.title}</h3>
                              <div className="bg-white rounded-full p-1">
                                {learningStyles.find((s) => s.id === style.id)?.icon}
                              </div>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No hay tareas disponibles para este estilo de aprendizaje.</p>
                    </div>
                  )}
                </TabsContent>
              )
            })}
          </Tabs>

          <div className="text-center">
            <p className="text-gray-600 mb-4">¿Quieres probar otro estilo de aprendizaje?</p>
            <Button
              variant="outline"
              className="rounded-xl border-2 border-dashed border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              Prueba otro estilo
            </Button>
          </div>
        </div>
      </div>

      <Link href="/learn-together">
        <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl font-bold py-6 px-8">
          ¡Aprendamos Juntos!
        </Button>
      </Link>

      <NavigationBar />
    </div>
  )
}

