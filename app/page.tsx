import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 via-pink-300 to-blue-300 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 text-center">
          <div className="relative h-48 w-48 mx-auto mb-4">
            <Image
              src="/placeholder.svg?height=200&width=200"
              alt="Friendly character"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-purple-600 mb-2">¡Bienvenido!</h1>
          <p className="text-lg text-gray-600 mb-6">¿Cómo quieres ingresar?</p>

          <div className="grid grid-cols-2 gap-4">
            <Link href="/student/welcome">
              <Button className="w-full py-6 text-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 rounded-xl font-bold">
                Estudiante
              </Button>
            </Link>

            <Link href="/teacher/login">
              <Button className="w-full py-6 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-bold">
                Profesor
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-blue-100 p-4 flex justify-center space-x-4">
          <div className="w-10 h-10 bg-yellow-300 rounded-full"></div>
          <div className="w-10 h-10 bg-green-300 rounded-full"></div>
          <div className="w-10 h-10 bg-pink-300 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

