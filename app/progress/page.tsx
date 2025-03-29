"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import { Trophy, Star, Award, Medal } from "lucide-react"

export default function ProgressPage() {
  const [progress, setProgress] = useState(65)

  const badges = [
    { id: 1, name: "Explorador Curioso", icon: <Star className="h-6 w-6 text-yellow-500" />, unlocked: true },
    { id: 2, name: "Científico Novato", icon: <Award className="h-6 w-6 text-blue-500" />, unlocked: true },
    { id: 3, name: "Artista del Conocimiento", icon: <Medal className="h-6 w-6 text-purple-500" />, unlocked: false },
    { id: 4, name: "Maestro del Saber", icon: <Trophy className="h-6 w-6 text-gray-400" />, unlocked: false },
  ]

  const achievements = [
    { id: 1, text: "¡Completaste tu primera tarea!", completed: true },
    { id: 2, text: "¡Probaste una nueva forma de aprender!", completed: true },
    { id: 3, text: "¡Compartiste tu trabajo con otros!", completed: true },
    { id: 4, text: "¡Completa 5 tareas diferentes!", completed: false },
    { id: 5, text: "¡Prueba todos los estilos de aprendizaje!", completed: false },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 via-pink-300 to-red-300 flex flex-col items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden my-8">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center text-purple-600 mb-6">Mi Progreso</h1>

          <div className="flex flex-col items-center mb-8">
            <div className="relative h-32 w-32 mb-4">
              <Image
                src="/placeholder.svg?height=128&width=128&text=Avatar"
                alt="Avatar del usuario"
                fill
                className="object-cover rounded-full border-4 border-purple-300"
              />
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-1">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>

            <h2 className="text-xl font-bold mb-1">¡Nivel 3!</h2>
            <div className="w-full mb-1">
              <Progress value={progress} className="h-3" />
            </div>
            <p className="text-sm text-gray-500">{progress}% hacia el nivel 4</p>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold mb-3">Mis Insignias</h3>
            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`border rounded-xl p-3 flex items-center gap-3 ${
                    badge.unlocked ? "bg-gradient-to-br from-white to-yellow-50" : "bg-gray-100"
                  }`}
                >
                  <div className={`p-2 rounded-full ${badge.unlocked ? "bg-yellow-100" : "bg-gray-200"}`}>
                    {badge.icon}
                  </div>
                  <span className={`font-medium ${badge.unlocked ? "" : "text-gray-400"}`}>{badge.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">Logros</h3>
            <div className="space-y-2">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-lg flex items-center gap-3 ${
                    achievement.completed ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center ${
                      achievement.completed ? "bg-green-500 text-white" : "bg-gray-300"
                    }`}
                  >
                    {achievement.completed ? "✓" : ""}
                  </div>
                  <span className={achievement.completed ? "font-medium" : "text-gray-500"}>{achievement.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-100 rounded-xl p-4 text-center mb-6">
            <p className="text-purple-800 font-medium text-lg">¡Probaste una nueva forma de aprender!</p>
            <p className="text-purple-600">Sigue explorando para descubrir más.</p>
          </div>

          <Link href="/">
            <Button className="w-full py-6 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-bold">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

