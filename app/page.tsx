import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 via-pink-300 to-blue-300 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 text-center">
          <div className="flex justify-center mb-6">
            <Logo width={175} height={150} />
          </div>
          <h1 className="text-3xl font-bold text-purple-600 mb-2">¡Bienvenido!</h1>
          <p className="text-lg text-gray-600 mb-6">¿Cómo quieres ingresar?</p>

          <div className="grid grid-cols-2 gap-4">
            <Link href="/student/welcome">
              <Button className="w-full py-6 text-lg bg-green-400 hover:bg-green-500 rounded-xl font-bold">
                Estudiante
              </Button>
            </Link>

            <Link href="/teacher/login">
              <Button className="w-full py-6 text-lg bg-purple-500 hover:bg-purple-600 rounded-xl font-bold">
                Profesor
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-blue-100 p-2 flex justify-center space-x-2">
          <div className="w-6 h-6 bg-yellow-300 rounded-full"></div>
          <div className="w-6 h-6 bg-green-300 rounded-full"></div>
          <div className="w-6 h-6 bg-pink-300 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

