import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { studentId, answers } = data

    if (!studentId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "StudentId and answers array are required" }, { status: 400 })
    }

    // Calculate learning style based on answers
    const learningStyle = calculateLearningStyle(answers)

    // Check if student exists
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from("users")
      .select("user_id")
      .eq("user_id", studentId)
      .single()

    if (userError && userError.code !== "PGRST116") {
      console.error("Error checking user:", userError)
      return NextResponse.json({ error: "Error checking user" }, { status: 500 })
    }

    if (!existingUser) {
      // Create new student
      const { error: createError } = await supabaseAdmin.from("users").insert([
        {
          user_id: studentId,
          name: `Student ${studentId}`,
          role: "student",
        },
      ])

      if (createError) {
        console.error("Error creating user:", createError)
        return NextResponse.json({ error: "Error creating user" }, { status: 500 })
      }
    }

    // Check if learning style already exists for this student
    const { data: existingStyle, error: styleError } = await supabaseAdmin
      .from("learning_styles")
      .select("id")
      .eq("student_id", studentId)
      .single()

    if (styleError && styleError.code !== "PGRST116") {
      console.error("Error checking learning style:", styleError)
      return NextResponse.json({ error: "Error checking learning style" }, { status: 500 })
    }

    if (existingStyle) {
      // Update existing learning style
      const { error: updateError } = await supabaseAdmin
        .from("learning_styles")
        .update({ style: learningStyle })
        .eq("student_id", studentId)

      if (updateError) {
        console.error("Error updating learning style:", updateError)
        return NextResponse.json({ error: "Error updating learning style" }, { status: 500 })
      }
    } else {
      // Create new learning style
      const { error: insertError } = await supabaseAdmin.from("learning_styles").insert([
        {
          student_id: studentId,
          style: learningStyle,
        },
      ])

      if (insertError) {
        console.error("Error creating learning style:", insertError)
        return NextResponse.json({ error: "Error creating learning style" }, { status: 500 })
      }
    }

    return NextResponse.json({ studentId, learningStyle }, { status: 200 })
  } catch (error) {
    console.error("Error saving learning style:", error)
    return NextResponse.json({ error: "Failed to save learning style" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "StudentId is required" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("learning_styles")
      .select("style")
      .eq("student_id", studentId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No learning style found, return default
        return NextResponse.json({ studentId, learningStyle: "visual" }, { status: 200 })
      }

      console.error("Error fetching learning style:", error)
      return NextResponse.json({ error: "Error fetching learning style" }, { status: 500 })
    }

    return NextResponse.json({ studentId, learningStyle: data.style }, { status: 200 })
  } catch (error) {
    console.error("Error fetching learning style:", error)
    return NextResponse.json({ error: "Failed to fetch learning style" }, { status: 500 })
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

