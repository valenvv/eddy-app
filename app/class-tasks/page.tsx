"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, CheckCircle, Clock } from "lucide-react"
import NavigationBar from "@/components/navigation-bar"

export default function ClassTasksPage() {
  const [activeTab, setActiveTab] = useState("pending")

  const tasks = {
    pending: [
      {
        id: 1,
        title: "Proyecto de Ciencias",
        dueDate: "15 Mayo",
        subject: "Ciencias",
        color: "bg-green-100 border-l-4 border-green-500",
      },
      {
        id: 2,
        title: "Ejercicios de Matemáticas",
        dueDate: "18 Mayo",
        subject: "Matemáticas",
        color: "bg-blue-100 border-l-4 border-blue-500",
      },
      {
        id: 3,
        title: "Lectura Comprensiva",
        dueDate: "20 Mayo",
        subject: "Lenguaje",
        color: "bg-purple-100 border-l-4 border-purple-500",
      },
    ],
    completed: [
      {
        id: 4,
        title: "Dibujo de mi familia",
        completedDate: "10 Mayo",
        subject: "Arte",
        color: "bg-pink-100 border-l-4 border-pink-500",
      },
      {
        id: 5,
        title: "Tabla de multiplicar",
        completedDate: "5 Mayo",
        subject: "Matemáticas",
        color: "bg-blue-100 border-l-4 border-blue-500",
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-indigo-300 to-purple-300 flex flex-col items-center p-4 pb-24">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden my-8">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center text-indigo-600 mb-6">Tareas de la Clase</h1>

          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Pendientes</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Completadas</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-0">
              <div className="space-y-3">
                {tasks.pending.map((task) => (
                  <Card key={task.id} className={`${task.color} p-4 rounded-xl hover:shadow-md transition-shadow`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-xs text-gray-600">{task.subject}</p>
                      </div>
                      <div className="flex items-center text-xs bg-white px-2 py-1 rounded-full">
                        <Calendar className="h-3 w-3 mr-1" />
                        {task.dueDate}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-0">
              <div className="space-y-3">
                {tasks.completed.map((task) => (
                  <Card key={task.id} className={`${task.color} p-4 rounded-xl hover:shadow-md transition-shadow`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-xs text-gray-600">{task.subject}</p>
                      </div>
                      <div className="flex items-center text-xs bg-white px-2 py-1 rounded-full">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {task.completedDate}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="text-center">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl font-bold">
              Ver calendario completo
            </Button>
          </div>
        </div>
      </div>

      <NavigationBar />
    </div>
  )
}

