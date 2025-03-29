"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Heart, MessageCircle, Video, Mic, FileText, PenTool } from "lucide-react"
import NavigationBar from "@/components/navigation-bar"
import { toast } from "@/components/ui/use-toast"

export default function LearnTogetherPage() {
  const [likes, setLikes] = useState<Record<string, boolean>>({})
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        // In a real app, get the studentId from authentication
        const studentId = "student_123"

        // Fetch tasks for the student's classes
        const tasksResponse = await fetch(`/api/tasks?studentId=${studentId}`)

        if (!tasksResponse.ok) {
          throw new Error("Failed to fetch tasks")
        }

        const tasksData = await tasksResponse.json()

        if (tasksData.length > 0) {
          // Fetch submissions for the first task
          const submissionsResponse = await fetch(`/api/tasks/${tasksData[0].id}/submissions`)

          if (!submissionsResponse.ok) {
            throw new Error("Failed to fetch submissions")
          }

          const submissionsData = await submissionsResponse.json()

          // Transform the data for display
          const formattedSubmissions = submissionsData.map((sub: any) => {
            const submissionTypes = ["video", "audio", "text", "drawing"]
            const randomType = submissionTypes[Math.floor(Math.random() * submissionTypes.length)]
            const randomLikes = Math.floor(Math.random() * 20)

            return {
              id: sub.id,
              name: `Estudiante ${sub.studentId.slice(-3)}`,
              type: randomType,
              icon: getIconForType(randomType),
              title: sub.content.slice(0, 30) + (sub.content.length > 30 ? "..." : ""),
              likes: randomLikes,
            }
          })

          setSubmissions(formattedSubmissions)
        }
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

    fetchSubmissions()
  }, [])

  const getIconForType = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />
      case "audio":
        return <Mic className="h-5 w-5" />
      case "text":
        return <FileText className="h-5 w-5" />
      case "drawing":
        return <PenTool className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const handleLike = (id: string) => {
    setLikes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 via-indigo-300 to-purple-300 flex flex-col items-center justify-center p-4">
        <p>Cargando trabajos de compañeros...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-indigo-300 to-purple-300 flex flex-col items-center p-4 pb-24">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden my-8">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center text-indigo-600 mb-2">Aprendamos Juntos</h1>
          <p className="text-center text-gray-600 mb-6">Mira cómo otros resolvieron la tarea</p>

          <div className="space-y-4 mb-6">
            {submissions.length > 0 ? (
              submissions.map((solution) => (
                <Card key={solution.id} className="overflow-hidden">
                  <div className="bg-indigo-50 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center">
                        {solution.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{solution.name}</h3>
                        <p className="text-xs text-gray-500">{solution.type}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => {}}>
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </div>

                  <div className="p-3">
                    <div className="relative h-32 w-full bg-gray-100 rounded-lg mb-2">
                      <Image
                        src={`/placeholder.svg?height=128&width=320&text=${solution.type}`}
                        alt={solution.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>

                    <h4 className="font-medium mb-1">{solution.title}</h4>

                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-xs ${likes[solution.id] ? "text-red-500" : ""}`}
                        onClick={() => handleLike(solution.id)}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${likes[solution.id] ? "fill-red-500" : ""}`} />
                        ¡Qué genial! ({solution.likes + (likes[solution.id] ? 1 : 0)})
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay trabajos compartidos todavía.</p>
              </div>
            )}
          </div>

          <Link href="/progress">
            <Button className="w-full py-6 text-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl font-bold">
              Ver mi progreso
            </Button>
          </Link>
        </div>
      </div>

      <NavigationBar />
    </div>
  )
}

