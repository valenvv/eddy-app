"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Logo } from "@/components/logo"

export default function StudentLoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [userId, setUserId] = useState("student_123")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(userId, "student")
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido, Estudiante",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo iniciar sesión. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 via-blue-300 to-purple-300 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Acceso para Estudiantes</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="userId">ID de Estudiante</Label>
              <Input
                id="userId"
                placeholder="Ingresa tu ID de estudiante"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

