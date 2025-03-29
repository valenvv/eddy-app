import { NextResponse } from "next/server"
import { studentsData, updateStudentLearningStyle } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { studentId, answers } = data

    if (!studentId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "StudentId and answers array are required" }, { status: 400 })
    }

    // Calculate learning style based on answers
    const learningStyle = calculateLearningStyle(answers)

    // Update student's learning style
    const result = updateStudentLearningStyle(studentId, learningStyle)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Error saving learning style:", error)
    return NextResponse.json({ error: "Failed to save learning style", details: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "StudentId is required" }, { status: 400 })
    }

    const student = studentsData.find((s) => s.id === studentId)

    if (!student || !student.learningStyle) {
      // For demo purposes, return a default learning style if not found
      return NextResponse.json({ studentId, learningStyle: "visual" }, { status: 200 })
    }

    return NextResponse.json({ studentId, learningStyle: student.learningStyle }, { status: 200 })
  } catch (error) {
    console.error("Error fetching learning style:", error)
    return NextResponse.json({ error: "Failed to fetch learning style", details: error.message }, { status: 500 })
  }
}

function calculateLearningStyle(answers: string[]) {
  // Count occurrences of each learning style in answers
  const counts: Record<string, number> = {
    visual: 0,
    auditory: 0,
    reading: 0,
    kinesthetic: 0,
  }

  answers.forEach((answer) => {
    if (counts[answer] !== undefined) {
      counts[answer]++
    }
  })

  // Find the learning style with the highest count
  let maxCount = 0
  let dominantStyle = "visual" // Default

  Object.entries(counts).forEach(([style, count]) => {
    if (count > maxCount) {
      maxCount = count
      dominantStyle = style
    }
  })

  return dominantStyle
}

