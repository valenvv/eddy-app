"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Users, Plus } from "lucide-react"
import TeacherNavigationBar from "@/components/teacher-navigation-bar"

export default function TeacherDashboardPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // Get the teacherId from localStorage
        const teacherId = localStorage.getItem("teacherId") || "teacher_123"

        console.log("Fetching classes for teacher:", teacherId)

        const response = await fetch(`/api/classes?teacherId=${teacherId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch classes")
        }

        const data = await response.json()
        console.log("Classes fetched:", data)
        setClasses(data)
      } catch (error) {
        console.error("Error fetching classes:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch classes",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-indigo-300 to-purple-300 flex flex-col items-center p-4 pb-24">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden my-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-blue-600">Panel del Profesor</h1>
            <div className="bg-blue-100 px-3 py-1 rounded-full text-blue-600 font-medium">{classes.length} Clases</div>
          </div>

          <h2 className="text-xl font-bold mb-4">Mis Clases</h2>

          {loading ? (
            <p className="text-center py-4">Cargando clases...</p>
          ) : classes.length > 0 ? (
            <div className="space-y-3 mb-6">
              {classes.map((cls: any) => (
                <Link href={`/teacher/classes/${cls.id}`} key={cls.id}>
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{cls.name}</h3>
                        <p className="text-xs text-gray-500">
                          {cls.students || 0} estudiantes • {cls.tasks || 0} tareas
                        </p>
                      </div>
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 mb-6">
              <p className="text-muted-foreground mb-4">No tienes clases creadas</p>
            </div>
          )}

          <Link href="/teacher/create-class">
            <Button className="w-full py-6 text-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2">
              <Plus className="h-5 w-5" />
              <span>Crear Nueva Clase</span>
            </Button>
          </Link>
        </div>
      </div>

      <TeacherNavigationBar />
    </div>
  )
}

