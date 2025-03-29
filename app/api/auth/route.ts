import { NextResponse } from "next/server"

// This is a simplified auth API for demo purposes
// In a real app, you would use a proper authentication system

// Mock user database
const users = new Map([
  ["student_123", { id: "student_123", name: "Estudiante Demo", role: "student" }],
  ["teacher_123", { id: "teacher_123", name: "Profesor Demo", role: "teacher" }],
])

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { userId, role } = data

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Check if user exists
    if (users.has(userId)) {
      const user = users.get(userId)
      return NextResponse.json(user)
    }

    // Create new user if it doesn't exist
    const newUser = {
      id: userId,
      name: role === "teacher" ? "Profesor Nuevo" : "Estudiante Nuevo",
      role: role || "student",
    }

    users.set(userId, newUser)

    return NextResponse.json(newUser)
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const user = users.get(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 })
  }
}

