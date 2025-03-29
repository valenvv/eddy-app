import { NextResponse } from "next/server"
import { classesData } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const classId = params.id
    const classData = classesData.find((cls) => cls.id === classId)

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    return NextResponse.json(classData)
  } catch (error) {
    console.error("Error fetching class:", error)
    return NextResponse.json({ error: "Failed to fetch class", details: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const classId = params.id
    const classIndex = classesData.findIndex((cls) => cls.id === classId)

    if (classIndex === -1) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    const data = await request.json()
    const updatedClass = { ...classesData[classIndex], ...data }
    classesData[classIndex] = updatedClass

    return NextResponse.json(updatedClass)
  } catch (error) {
    console.error("Error updating class:", error)
    return NextResponse.json({ error: "Failed to update class", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const classId = params.id
    const classIndex = classesData.findIndex((cls) => cls.id === classId)

    if (classIndex === -1) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    classesData.splice(classIndex, 1)

    return NextResponse.json({ message: "Class deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting class:", error)
    return NextResponse.json({ error: "Failed to delete class", details: error.message }, { status: 500 })
  }
}

