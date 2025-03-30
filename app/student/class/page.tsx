"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Video, Mic, FileText, PenTool } from "lucide-react"
import NavigationBar from "@/components/navigation-bar"
import { toast } from "@/components/ui/use-toast"

export default function StudentClassPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        // Get the student ID
        const studentId = localStorage.getItem("studentId") || "student_123"

        // Fetch submissions from classmates
        const submissionsResponse = await fetch(`/api/students/classmates-submissions?studentId=${studentId}`)

        if (!submissionsResponse.ok) {
          throw new Error("Failed to fetch submissions")
        }

        const submissionsData = await submissionsResponse.json()

        // Transform the data for display
        const formattedSubmissions = submissionsData.map((sub: any) => {
          const submissionTypes = ["video", "audio", "text", "drawing"]
          const randomType = submissionTypes[Math.floor(Math.random() * submissionTypes.length)]

          return {
            id: sub.id,
            name: sub.student_id, // Show full student ID
            type: randomType,
            icon: getIconForType(randomType),
            title: sub.content.slice(0, 30) + (sub.content.length > 30 ? "..." : ""),
            content: sub.content,
            taskId: sub.task_id,
            createdAt: sub.created_at,
            fileUrl: sub.file_url, // Assuming the API returns a file_url
          }
        })

        console.log(
          "Submissions with file URLs:",
          formattedSubmissions.map((sub) => ({
            id: sub.id,
            fileUrl: sub.fileUrl,
          })),
        )

        setSubmissions(formattedSubmissions)
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
                  <div className="bg-indigo-50 p-3 flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center">
                        {solution.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{solution.name}</h3>
                        <p className="text-xs text-gray-500">{solution.type}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3">
                    {solution.fileUrl ? (
                      <div className="relative h-32 w-full bg-gray-100 rounded-lg mb-2">
                        <Image
                          src={solution.fileUrl || "/placeholder.svg"}
                          alt={solution.title}
                          fill
                          className="object-cover rounded-lg"
                          onError={(e) => {
                            // When image fails to load, replace with placeholder
                            const target = e.target as HTMLImageElement
                            target.onerror = null // Prevent infinite error loop
                            target.src = `/placeholder.svg?height=128&width=320&text=${solution.type}`
                          }}
                        />
                      </div>
                    ) : null}

                    <h4 className="font-medium mb-1">{solution.title}</h4>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay trabajos compartidos todavía.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <NavigationBar />
    </div>
  )
}

