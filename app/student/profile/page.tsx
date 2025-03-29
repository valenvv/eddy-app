"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { Settings, Award, BookOpen, Star, Plus } from "lucide-react"
import NavigationBar from "@/components/navigation-bar"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("info")
  const [learningStyle, setLearningStyle] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [classCount, setClassCount] = useState(0)

  const stats = {
    tasksCompleted: 12,
    badges: 5,
  }

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
        }

        // Fetch classes the student is in
        // In a real app, this would be a dedicated endpoint
        const classesResponse = await fetch(`/api/classes`)

        if (classesResponse.ok) {
          const classesData = await classesResponse.json()
          const studentClasses = classesData.filter((cls: any) =>
            cls.students.some((student: any) => student.id === studentId),
          )
          setClassCount(studentClasses.length)
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch profile data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getLearningStyleInfo = () => {
    const styles: Record<string, { description: string; strengths: string[] }> = {
      visual: {
        description: "Aprendes mejor con imágenes, videos y colores.",
        strengths: ["Recordar lo que ves", "Crear mapas mentales", "Usar colores y dibujos"],
      },
      auditory: {
        description: "Aprendes mejor escuchando y hablando.",
        strengths: ["Recordar lo que escuchas", "Participar en debates", "Explicar ideas verbalmente"],
      },
      kinesthetic: {
        description: "Aprendes mejor haciendo y moviéndote.",
        strengths: ["Aprender haciendo", "Experimentar", "Moverte mientras estudias"],
      },
      reading: {
        description: "Aprendes mejor leyendo y escribiendo.",
        strengths: ["Tomar notas", "Leer textos", "Organizar información por escrito"],
      },
    }

    return styles[learningStyle || "visual"]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-400 via-pink-300 to-red-300 flex flex-col items-center justify-center p-4">
        <p>Cargando perfil...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 via-pink-300 to-red-300 flex flex-col items-center p-4 pb-24">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden my-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-purple-600">Mi Perfil</h1>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-col items-center mb-6">
            <div className="relative h-24 w-24 mb-3">
              <Image
                src="/placeholder.svg?height=96&width=96&text=Avatar"
                alt="Avatar del usuario"
                fill
                className="object-cover rounded-full border-4 border-purple-300"
              />
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1">
                <Star className="h-4 w-4 text-white" />
              </div>
            </div>

            <h2 className="text-xl font-bold mb-1">Estudiante Curioso</h2>
            <p className="text-sm text-gray-500">Nivel 3 • Explorador</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className="p-3 text-center bg-blue-50">
              <p className="text-2xl font-bold text-blue-600">{stats.tasksCompleted}</p>
              <p className="text-xs text-gray-600">Tareas</p>
            </Card>
            <Card className="p-3 text-center bg-yellow-50">
              <p className="text-2xl font-bold text-yellow-600">{stats.badges}</p>
              <p className="text-xs text-gray-600">Insignias</p>
            </Card>
            <Card className="p-3 text-center bg-green-50 relative">
              <p className="text-2xl font-bold text-green-600">{classCount}</p>
              <p className="text-xs text-gray-600">Clases</p>
              <Link href="/student/join-class">
                <Button
                  size="icon"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-green-500 hover:bg-green-600"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>
            </Card>
          </div>

          <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="info" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Mi aprendizaje</span>
              </TabsTrigger>
              <TabsTrigger value="badges" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>Mis insignias</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-0">
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50">
                <h3 className="font-bold text-purple-600 mb-2">Estilo de aprendizaje: {learningStyle || "Visual"}</h3>
                <p className="text-sm text-gray-600 mb-3">{getLearningStyleInfo().description}</p>

                <h4 className="font-medium text-sm text-purple-600 mb-1">Tus fortalezas:</h4>
                <ul className="text-sm space-y-1 pl-5 list-disc text-gray-600">
                  {getLearningStyleInfo().strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </Card>
            </TabsContent>

            <TabsContent value="badges" className="mt-0">
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((badge) => (
                  <Card
                    key={badge}
                    className="p-3 flex flex-col items-center bg-gradient-to-br from-white to-yellow-50"
                  >
                    <div className="p-2 rounded-full bg-yellow-100 mb-2">
                      <Award className="h-6 w-6 text-yellow-500" />
                    </div>
                    <p className="font-medium text-sm text-center">Explorador Nivel {badge}</p>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <Button className="w-full py-6 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-bold">
            Cambiar mi avatar
          </Button>
        </div>
      </div>

      <NavigationBar />
    </div>
  )
}

