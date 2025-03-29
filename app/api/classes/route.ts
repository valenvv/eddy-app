import { NextResponse } from "next/server"
import { classesData } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, teacherId, description } = data

    if (!name || !teacherId) {
      return NextResponse.json({ error: "Name and teacherId are required" }, { status: 400 })
    }

    const classId = `class_${Date.now()}`
    const newClass = {
      id: classId,
      name,
      teacherId,
      description: description || "",
      students: [],
      tasks: [],
      inviteCode: generateInviteCode(),
      createdAt: new Date().toISOString(),
    }

    classesData.push(newClass)

    return NextResponse.json(newClass, { status: 201 })
  } catch (error) {
    console.error("Error creating class:", error)
    return NextResponse.json({ error: "Failed to create class", details: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get("teacherId")

    if (teacherId) {
      const teacherClasses = classesData.filter((cls) => cls.teacherId === teacherId)
      return NextResponse.json(teacherClasses)
    }

    return NextResponse.json(classesData)
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json({ error: "Failed to fetch classes", details: error.message }, { status: 500 })
  }
}

function generateInviteCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

