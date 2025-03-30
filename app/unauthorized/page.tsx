import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-400 via-orange-300 to-yellow-300 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden p-6 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Acceso No Autorizado</h1>
        <p className="text-lg text-gray-600 mb-6">No tienes permiso para acceder a esta página.</p>

        <Link href="/">
          <Button className="w-full py-6 text-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-xl font-bold">
            Volver al Inicio
          </Button>
        </Link>
      </div>
    </div>
  )
}

