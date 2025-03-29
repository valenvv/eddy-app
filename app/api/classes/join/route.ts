import { NextResponse } from "next/server"
import { classesData } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { inviteCode, studentId } = data

    if (!inviteCode || !studentId) {
      return NextResponse.json({ error: "Invite code and studentId are required" }, { status: 400 })
    }

    // Find class with matching invite code
    const classIndex = classesData.findIndex((cls) => cls.inviteCode === inviteCode)

    if (classIndex === -1) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 })
    }

    const foundClass = classesData[classIndex]

    // Check if student is already in the class
    if (foundClass.students.some((student) => student.id === studentId)) {
      return NextResponse.json({ error: "Student already in class" }, { status: 400 })
    }

    // Add student to class
    foundClass.students.push({
      id: studentId,
      joinedAt: new Date().toISOString(),
      learningStyle: null, // Will be set after the test
    })

    return NextResponse.json({ message: "Joined class successfully", class: foundClass }, { status: 200 })
  } catch (error) {
    console.error("Error joining class:", error)
    return NextResponse.json({ error: "Failed to join class", details: error.message }, { status: 500 })
  }
}

