"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import NavigationBar from "@/components/navigation-bar"

export default function AvatarSelectPage() {
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null)

  const avatars = [
    { id: 1, name: "Explorador", color: "bg-blue-200" },
    { id: 2, name: "Científico", color: "bg-green-200" },
    { id: 3, name: "Artista", color: "bg-purple-200" },
    { id: 4, name: "Astronauta", color: "bg-orange-200" },
    { id: 5, name: "Inventor", color: "bg-pink-200" },
    { id: 6, name: "Músico", color: "bg-yellow-200" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-purple-300 to-pink-300 flex flex-col items-center p-4 pb-24">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden my-8">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center text-purple-600 mb-6">¡Escoge tu avatar favorito!</h1>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {avatars.map((avatar) => (
              <div
                key={avatar.id}
                className={`${avatar.color} rounded-2xl p-4 flex flex-col items-center cursor-pointer transition-transform transform hover:scale-105 ${
                  selectedAvatar === avatar.id ? "ring-4 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedAvatar(avatar.id)}
              >
                <div className="relative h-20 w-20 mb-2">
                  <Image
                    src={`/placeholder.svg?height=80&width=80&text=${avatar.name}`}
                    alt={avatar.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="font-medium">{avatar.name}</span>
              </div>
            ))}
          </div>

          <Link href="/learning-test">
            <Button
              className="w-full py-6 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-bold"
              disabled={selectedAvatar === null}
            >
              ¡Continuar!
            </Button>
          </Link>
        </div>
      </div>

      <NavigationBar />
    </div>
  )
}

