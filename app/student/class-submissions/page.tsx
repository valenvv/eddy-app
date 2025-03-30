"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Heart, MessageCircle, Video, Mic, FileText, PenTool } from "lucide-react"
import NavigationBar from "@/components/navigation-bar"

export default function ClassSubmissionsPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [likes, setLikes] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, get the studentId from authentication
        const studentId = "student_123"

        // Fetch tasks for the student's classes
        const tasksResponse = await fetch(`/api/tasks?studentId=${studentId}`)

        if (!tasksResponse.ok) {
          throw new Error("Failed to fetch tasks")
        }

        const tasksData = await tasksResponse.json()
        setTasks(tasksData)

        if (tasksData.length > 0) {
          setSelectedTask(tasksData[0].id)

          // Fetch submissions for the first task
          const submissionsResponse = await fetch(`/api/tasks/${tasksData[0].id}/submissions`)

          if (!submissionsResponse.ok) {
            throw new Error("Failed to fetch submissions")
          }

          const submissionsData = await submissionsResponse.json()
          setSubmissions(submissionsData)
        }
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

  const handleTaskChange = async (taskId: string) => {
    setSelectedTask(taskId)
    setLoading(true)

    try {
      const response = await fetch(`/api/tasks/${taskId}/submissions`)

      if (!response.ok) {
        throw new Error("Failed to fetch submissions")
      }

      const data = await response.json()
      setSubmissions(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch submissions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLike = (submissionId: string) => {
    setLikes((prev) => ({
      ...prev,
      [submissionId]: !prev[submissionId],
    }))

    // In a real app, this would send a request to the server
    toast({
      title: likes[submissionId] ? "Me gusta eliminado" : "¡Qué genial!",
      description: "Tu opinión ha sido registrada",
    })
  }

  const getSubmissionTypeIcon = (submission: any) => {
    // In a real app, this would be determined by the submission type
    // For now, we'll randomly assign icons
    const icons = [
      <Video key="video" className="h-5 w-5" />,
      <Mic key="audio" className="h-5 w-5" />,
      <FileText key="text" className="h-5 w-5" />,
      <PenTool key="drawing" className="h-5 w-5" />,
    ]

    return icons[submission.id.length % 4]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 via-indigo-300 to-purple-300 flex flex-col items-center justify-center p-4">
        <p>Loading submissions...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-indigo-300 to-purple-300 flex flex-col items-center p-4 pb-24">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden my-8">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center text-indigo-600 mb-2">Trabajos de la Clase</h1>
          <p className="text-center text-gray-600 mb-6">Mira cómo tus compañeros resolvieron las tareas</p>

          {tasks.length > 0 ? (
            <>
              <div className="mb-6">
                <label className="font-medium mb-2 block">Selecciona una tarea:</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedTask || ""}
                  onChange={(e) => handleTaskChange(e.target.value)}
                >
                  {tasks.map((task: any) => (
                    <option key={task.id} value={task.id}>
                      Tarea: {task.id}
                    </option>
                  ))}
                </select>
              </div>

              {submissions.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {submissions.map((submission: any) => (
                    <Card key={submission.id} className="overflow-hidden">
                      <div className="bg-indigo-50 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center">
                            {getSubmissionTypeIcon(submission)}
                          </div>
                          <div>
                            <h3 className="font-medium">Estudiante {submission.studentId.slice(-3)}</h3>
                            <p className="text-xs text-gray-500">
                              {new Date(submission.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </div>

                      <div className="p-3">
                        <p className="mb-3 text-sm">{submission.content}</p>

                        {submission.fileUrl && (
                          <div className="bg-gray-100 p-2 rounded mb-2 text-sm">
                            Archivo adjunto: {submission.fileUrl}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`text-xs ${likes[submission.id] ? "text-red-500" : ""}`}
                            onClick={() => handleLike(submission.id)}
                          >
                            <Heart className={`h-4 w-4 mr-1 ${likes[submission.id] ? "fill-red-500" : ""}`} />
                            ¡Qué genial!
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 mb-6">
                  <p className="text-muted-foreground">No hay entregas para esta tarea todavía</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 mb-6">
              <p className="text-muted-foreground mb-4">No hay tareas disponibles</p>
              <Link href="/student/join-class">
                <Button>Unirse a una clase</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <NavigationBar />
    </div>
  )
}

