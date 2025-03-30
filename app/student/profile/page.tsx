"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, BookOpen, Plus, Camera, Headphones, PenTool, User } from "lucide-react"
import NavigationBar from "@/components/navigation-bar"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Badge = {
  id: string
  student_id: string
  badge_type: "visual" | "auditory" | "reading" | "kinesthetic"
  earned_at: string
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("info")
  const [learningStyle, setLearningStyle] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [classCount, setClassCount] = useState(0)
  const [pendingTasksCount, setPendingTasksCount] = useState(0)
  const [username, setUsername] = useState("Estudiante")
  const [joinClassOpen, setJoinClassOpen] = useState(false)
  const [inviteCode, setInviteCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [badges, setBadges] = useState<Badge[]>([])

  const badgeInfo = {
    visual: {
      title: "Explorador Visual",
      description: "Completaste tu primera tarea visual",
      icon: <Camera className="h-6 w-6 text-blue-500" />,
      color: "bg-blue-100",
    },
    auditory: {
      title: "Explorador Auditivo",
      description: "Completaste tu primera tarea auditiva",
      icon: <Headphones className="h-6 w-6 text-yellow-500" />,
      color: "bg-yellow-100",
    },
    reading: {
      title: "Explorador de Lectura",
      description: "Completaste tu primera tarea de lectura",
      icon: <BookOpen className="h-6 w-6 text-green-500" />,
      color: "bg-green-100",
    },
    kinesthetic: {
      title: "Explorador Práctico",
      description: "Completaste tu primera tarea práctica",
      icon: <PenTool className="h-6 w-6 text-purple-500" />,
      color: "bg-purple-100",
    },
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
        const classesResponse = await fetch(`/api/students/classes?studentId=${studentId}`)

        if (classesResponse.ok) {
          const classesData = await classesResponse.json()
          setClassCount(classesData.length)
        }

        // Fetch student's user info to get the name
        // Set the username to be the student ID
        setUsername(studentId)

        // Fetch tasks and count pending ones
        const tasksResponse = await fetch(`/api/tasks?studentId=${studentId}`)

        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json()

          // Fetch submissions to determine pending tasks
          const submissionsResponse = await fetch(`/api/students/submissions?studentId=${studentId}`)

          if (submissionsResponse.ok) {
            const submissionsData = await submissionsResponse.json()

            // Create a map of taskId -> completed status
            const submissionsMap: Record<string, boolean> = {}
            submissionsData.forEach((submission: any) => {
              submissionsMap[submission.task_id] = true
            })

            // Count pending tasks
            const pendingCount = tasksData.filter((task: any) => !submissionsMap[task.id]).length
            setPendingTasksCount(pendingCount)
          }
        }

        // Fetch student's badges
        const badgesResponse = await fetch(`/api/students/badges?studentId=${studentId}`)

        if (badgesResponse.ok) {
          const badgesData = await badgesResponse.json()
          setBadges(badgesData)
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

  const handleJoinClass = async () => {
    if (!inviteCode) {
      toast({
        title: "Error",
        description: "Por favor ingresa un código de invitación",
        variant: "destructive",
      })
      return
    }

    setIsJoining(true)

    try {
      // Get the studentId from localStorage
      const studentId = localStorage.getItem("studentId") || "student_123"

      const response = await fetch("/api/classes/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteCode,
          studentId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to join class")
      }

      toast({
        title: "¡Te has unido a la clase!",
        description: `Te has unido a: ${data.class.name}`,
      })

      // Update class count
      setClassCount((prev) => prev + 1)

      // Close the dialog
      setJoinClassOpen(false)
      setInviteCode("")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join class",
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

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
            {/* Removed configuration icon */}
          </div>

          <div className="flex flex-col items-center mb-6">
            <div className="relative h-24 w-24 mb-3 rounded-full overflow-hidden bg-gradient-to-br from-purple-300 via-pink-200 to-blue-300 flex items-center justify-center border-4 border-white shadow-lg">
              <User className="h-14 w-14 text-white" strokeWidth={1.5} />
            </div>

            <h2 className="text-xl font-bold mb-1">{username}</h2>
            {/* Removed level and explorer text */}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className="p-3 text-center bg-blue-50">
              <p className="text-2xl font-bold text-blue-600">{pendingTasksCount}</p>
              <p className="text-xs text-gray-600">Tareas</p>
            </Card>
            <Card className="p-3 text-center bg-yellow-50">
              <p className="text-2xl font-bold text-yellow-600">{badges.length}</p>
              <p className="text-xs text-gray-600">Insignias</p>
            </Card>
            <Card className="p-3 text-center bg-green-50 relative">
              <p className="text-2xl font-bold text-green-600">{classCount}</p>
              <p className="text-xs text-gray-600">Clases</p>
              <Button
                size="icon"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-green-500 hover:bg-green-600"
                onClick={() => setJoinClassOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
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
              {badges.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {badges.map((badge) => {
                    const info = badgeInfo[badge.badge_type]
                    return (
                      <Card
                        key={badge.id}
                        className={`p-3 flex flex-col items-center bg-gradient-to-br from-white to-${info.color}`}
                      >
                        <div className={`p-2 rounded-full ${info.color} mb-2`}>{info.icon}</div>
                        <p className="font-medium text-sm text-center">{info.title}</p>
                        <p className="text-xs text-gray-500 text-center mt-1">{info.description}</p>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Aún no has ganado insignias</p>
                  <p className="text-xs text-gray-400 mt-1">Completa tareas para ganar insignias</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <NavigationBar />

      {/* Join Class Dialog */}
      <Dialog open={joinClassOpen} onOpenChange={setJoinClassOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Unirse a una Clase</DialogTitle>
            <DialogDescription>Ingresa el código de invitación que te proporcionó tu profesor.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="inviteCode" className="text-right">
                Código
              </Label>
              <Input
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="col-span-3 text-center text-xl tracking-wider uppercase"
                placeholder="ABC123"
                maxLength={6}
              />
            </div>

          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleJoinClass} disabled={isJoining}>
              {isJoining ? "Uniéndose..." : "Unirse a la Clase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

