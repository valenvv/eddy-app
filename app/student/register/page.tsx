"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export default function StudentRegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    studentId: "",
    inviteCode: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // First, try to join the class with the invite code
      const joinResponse = await fetch("/api/classes/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteCode: formData.inviteCode,
          studentId: formData.studentId,
        }),
      })

      // Check if the response is JSON before trying to parse it
      const contentType = joinResponse.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Respuesta inesperada del servidor: ${await joinResponse.text()}`)
      }

      const joinData = await joinResponse.json()

      if (!joinResponse.ok) {
        throw new Error(joinData.error || "No se pudo unir a la clase")
      }

      // Store the student ID in localStorage for future use
      localStorage.setItem("studentId", formData.studentId)

      toast({
        title: "¡Registro exitoso!",
        description: `Te has unido a la clase: ${joinData.class.name}`,
      })

      // Redirect to learning style test
      router.push("/student/learning-test")
    } catch (error) {
      console.error("Registration error:", error) // Add more detailed error logging
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al registrarse",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 via-blue-300 to-purple-300 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-blue-600">Regístrate</h1>
            <p className="text-gray-600">Ingresa tus datos para comenzar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">ID de Estudiante</Label>
              <Input
                id="studentId"
                name="studentId"
                placeholder="Ej: juan123"
                value={formData.studentId}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-gray-500">Crea un ID único que usarás para iniciar sesión</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inviteCode">Código de Clase</Label>
              <Input
                id="inviteCode"
                name="inviteCode"
                placeholder="Ej: ABC123"
                value={formData.inviteCode}
                onChange={handleChange}
                required
                className="text-center text-lg tracking-wider"
              />
              <p className="text-xs text-gray-500">Ingresa el código que te dio tu profesor</p>
            </div>

            <Button
              type="submit"
              className="w-full py-6 text-lg bg-green-500 hover:bg-green-600 rounded-xl font-bold"
              disabled={isLoading}
            >
              {isLoading ? "Registrando..." : "¡Comenzar!"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

