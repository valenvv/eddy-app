"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Copy, Users, BookOpen, Plus } from "lucide-react"
import TeacherNavigationBar from "@/components/teacher-navigation-bar"

export default function ClassPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [classData, setClassData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const response = await fetch(`/api/classes/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch class")
        }

        const data = await response.json()
        setClassData(data)
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch class",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchClass()
  }, [params.id])

  const copyInviteCode = () => {
    if (classData?.inviteCode) {
      navigator.clipboard.writeText(classData.inviteCode)
      toast({
        title: "Código copiado",
        description: "Comparte este código con tus estudiantes",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 via-indigo-300 to-purple-300 flex flex-col items-center justify-center p-4">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 via-indigo-300 to-purple-300 flex flex-col items-center justify-center p-4">
        <p>Clase no encontrada</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-indigo-300 to-purple-300 flex flex-col items-center p-4 pb-24">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden my-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-blue-600">{classData.name}</h1>
            <Button onClick={copyInviteCode} variant="outline" className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              <span>{classData.inviteCode}</span>
            </Button>
          </div>

          {classData.description && <p className="text-gray-600 mb-6">{classData.description}</p>}

          <Tabs defaultValue="students" className="mb-6">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="students" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Estudiantes</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Tareas</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students">
              <Card className="p-4">
                <h2 className="text-xl font-bold mb-4">Estudiantes</h2>

                {classData.students && classData.students.length > 0 ? (
                  <div className="space-y-2">
                    {classData.students.map((student: any) => (
                      <div key={student.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="font-medium">ID: {student.id}</p>
                          <p className="text-sm text-gray-500">Estilo: {student.learningStyle || "No determinado"}</p>
                        </div>
                        <p className="text-sm text-gray-500">
                          Unido: {new Date(student.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aún no hay estudiantes en esta clase.</p>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="tasks">
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Tareas</h2>
                  <Link href={`/teacher/classes/${params.id}/create-task`}>
                    <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                      <Plus className="h-4 w-4" />
                      <span>Crear Tarea</span>
                    </Button>
                  </Link>
                </div>

                {classData.tasks && classData.tasks.length > 0 ? (
                  <div className="space-y-2">
                    {classData.tasks.map((taskId: string) => (
                      <Link key={taskId} href={`/teacher/classes/${params.id}/tasks/${taskId}`}>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer">
                          <p className="font-medium">Tarea ID: {taskId}</p>
                          <p className="text-sm text-gray-500">Ver Detalles</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aún no hay tareas creadas para esta clase.</p>
                )}
              </Card>
            </TabsContent>
          </Tabs>

          <Link href="/teacher/dashboard">
            <Button variant="outline" className="w-full">
              Volver al Panel
            </Button>
          </Link>
        </div>
      </div>

      <TeacherNavigationBar />
    </div>
  )
}

