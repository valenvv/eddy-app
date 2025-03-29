"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, BookOpen, Settings } from "lucide-react"

export default function TeacherNavigationBar() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: "/teacher/dashboard",
      icon: <Home className="h-6 w-6" />,
    },
    {
      name: "Clases",
      href: "/teacher/classes",
      icon: <Users className="h-6 w-6" />,
    },
    {
      name: "Tareas",
      href: "/teacher/tasks",
      icon: <BookOpen className="h-6 w-6" />,
    },
    {
      name: "Ajustes",
      href: "/teacher/settings",
      icon: <Settings className="h-6 w-6" />,
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t rounded-t-xl shadow-lg z-10">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center py-3 px-5 ${
                isActive ? "text-blue-600" : "text-gray-500 hover:text-blue-500"
              }`}
            >
              <div className={`p-2 rounded-full ${isActive ? "bg-blue-100" : ""}`}>{item.icon}</div>
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

