import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function StudentWelcomePage() {
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
          <h1 className="text-3xl font-bold text-purple-600 mb-2">¡Hola Amigo!</h1>
          <p className="text-lg text-gray-600 mb-6">Bienvenido a tu aventura de aprendizaje</p>

          <Link href="/student/register">
            <Button className="w-full mb-4 text-lg py-6 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 rounded-xl font-bold">
              ¡Comenzar!
            </Button>
          </Link>

          <Link href="/student/login" className="text-blue-500 hover:underline text-lg font-medium">
            Ya tengo una cuenta
          </Link>
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

