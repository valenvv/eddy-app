"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import TeacherNavigationBar from "@/components/teacher-navigation-bar"
import { ArrowLeft } from "lucide-react"

export default function CreateClassPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get the teacherId from localStorage or use default
      const teacherId = localStorage.getItem("teacherId") || "teacher_123"

      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          teacherId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to create class")
      }

      toast({
        title: "Clase creada exitosamente",
        description: `Código de invitación: ${data.invite_code}`,
      })

      // Store the teacher ID in localStorage if not already there
      if (!localStorage.getItem("teacherId")) {
        localStorage.setItem("teacherId", teacherId)
      }

      router.push(`/teacher/dashboard`)
    } catch (error) {
      console.error("Error creating class:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create class",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-indigo-300 to-purple-300 flex flex-col items-center p-4 pb-24">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden my-8">
        <div className="p-6">
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/teacher/dashboard")}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Volver</span>
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">Crear Nueva Clase</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Clase</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ej: Matemáticas 101"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Ingresa una descripción para tu clase"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <Button
              type="submit"
              className="w-full py-6 text-lg bg-blue-500 hover:bg-blue-600 rounded-xl font-bold"
              disabled={isLoading}
            >
              {isLoading ? "Creando..." : "Crear Clase"}
            </Button>
          </form>
        </div>
      </div>

      <TeacherNavigationBar />
    </div>
  )
}

