"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle, Clock } from "lucide-react"
import NavigationBar from "@/components/navigation-bar"

export default function StudentDashboardPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [learningStyle, setLearningStyle] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the studentId from localStorage
        const studentId = localStorage.getItem("studentId") || "student_123"

        // Fetch student's learning style
        const styleResponse = await fetch(`/api/students/learning-style?studentId=${studentId}`)

        if (styleResponse.ok) {
          const styleData = await styleResponse.json()
          setLearningStyle(styleData.learningStyle)
        }

        // Fetch tasks assigned to the student
        const tasksResponse = await fetch(`/api/tasks?studentId=${studentId}`)

        if (!tasksResponse.ok) {
          throw new Error("Failed to fetch tasks")
        }

        const tasksData = await tasksResponse.json()
        setTasks(tasksData)

        // Fetch all submissions by this student to determine completed tasks
        const submissionsResponse = await fetch(`/api/students/submissions?studentId=${studentId}`)

        if (submissionsResponse.ok) {
          const submissionsData = await submissionsResponse.json()

          // Create a map of taskId -> completed status
          const submissionsMap: Record<string, boolean> = {}
          submissionsData.forEach((submission: any) => {
            submissionsMap[submission.task_id] = true
          })

          setSubmissions(submissionsMap)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
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

  // Separate tasks into pending and completed based on submissions
  const pendingTasks = tasks.flatMap((task) => {
    // Skip if this task has been submitted by the student
    if (submissions[task.id]) return []

    // For each task, get tasks for the student's learning style
    const tasksForStyle = task.tasksByLearningStyle?.[learningStyle || "visual"] || []

    return tasksForStyle.map((t: any) => ({
      ...t,
      taskId: task.id,
      color: getColorForLearningStyle(learningStyle || "visual"),
    }))
  })

  const completedTasks = tasks.flatMap((task) => {
    // Only include if this task has been submitted by the student
    if (!submissions[task.id]) return []

    // For each task, get tasks for the student's learning style
    const tasksForStyle = task.tasksByLearningStyle?.[learningStyle || "visual"] || []

    return tasksForStyle.map((t: any) => ({
      ...t,
      taskId: task.id,
      color: "bg-green-100",
    }))
  })

  function getColorForLearningStyle(style: string) {
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

          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Tareas Pendientes</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Tareas Realizadas</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-0">
              {pendingTasks.length > 0 ? (
                <div className="space-y-3">
                  {pendingTasks.map((task: any) => (
                    <Link href={`/student/tasks/${task.taskId}`} key={task.id}>
                      <Card className={`${task.color} p-4 rounded-xl hover:shadow-md transition-shadow cursor-pointer`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            <p className="text-xs text-gray-600 line-clamp-1">{task.description}</p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No tienes tareas pendientes.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-0">
              {completedTasks.length > 0 ? (
                <div className="space-y-3">
                  {completedTasks.map((task: any) => (
                    <Card key={task.id} className={`${task.color} p-4 rounded-xl`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-xs text-gray-600 line-clamp-1">{task.description}</p>
                        </div>
                        <div className="bg-white rounded-full p-1">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No has completado ninguna tarea aún.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <NavigationBar />
    </div>
  )
}

