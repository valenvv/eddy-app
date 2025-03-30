import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const taskId = params.id
    const data = await request.json()
    const { studentId, content, fileUrl, learningStyle } = data

    if (!taskId || !studentId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if task exists
    const { data: taskData, error: taskError } = await supabaseAdmin
      .from("tasks")
      .select("id")
      .eq("id", taskId)
      .single()

    if (taskError) {
      console.error("Error checking task:", taskError)
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if student exists
    const { data: studentData, error: studentError } = await supabaseAdmin
      .from("users")
      .select("user_id")
      .eq("user_id", studentId)
      .single()

    if (studentError) {
      console.error("Error checking student:", studentError)
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Check if submission already exists
    const { data: existingSubmission, error: submissionError } = await supabaseAdmin
      .from("submissions")
      .select("id")
      .eq("task_id", taskId)
      .eq("student_id", studentId)
      .maybeSingle()

    if (submissionError && submissionError.code !== "PGRST116") {
      console.error("Error checking submission:", submissionError)
      return NextResponse.json({ error: "Error checking submission" }, { status: 500 })
    }

    let submissionId

    if (existingSubmission) {
      // Update existing submission
      const { data: updatedSubmission, error: updateError } = await supabaseAdmin
        .from("submissions")
        .update({
          content,
          file_url: fileUrl || null,
        })
        .eq("id", existingSubmission.id)
        .select("id")
        .single()

      if (updateError) {
        console.error("Error updating submission:", updateError)
        return NextResponse.json({ error: "Error updating submission" }, { status: 500 })
      }

      submissionId = updatedSubmission.id
    } else {
      // Create new submission
      const { data: newSubmission, error: createError } = await supabaseAdmin
        .from("submissions")
        .insert([
          {
            task_id: taskId,
            student_id: studentId,
            content,
            file_url: fileUrl || null,
          },
        ])
        .select("id")
        .single()

      if (createError) {
        console.error("Error creating submission:", createError)
        return NextResponse.json({ error: "Error creating submission" }, { status: 500 })
      }

      submissionId = newSubmission.id
    }

    // Check if the student has earned a badge for this learning style
    if (learningStyle) {
      const { data: existingBadge, error: badgeError } = await supabaseAdmin
        .from("badges")
        .select("id")
        .eq("student_id", studentId)
        .eq("badge_type", learningStyle)
        .maybeSingle()

      if (badgeError && badgeError.code !== "PGRST116") {
        console.error("Error checking badge:", badgeError)
      } else if (!existingBadge) {
        // Award new badge for this learning style
        const { error: createBadgeError } = await supabaseAdmin.from("badges").insert([
          {
            student_id: studentId,
            badge_type: learningStyle,
          },
        ])

        if (createBadgeError) {
          console.error("Error creating badge:", createBadgeError)
        }
      }
    }

    return NextResponse.json({ success: true, id: submissionId }, { status: 200 })
  } catch (error) {
    console.error("Error submitting task:", error)
    return NextResponse.json({ error: "Failed to submit task" }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const taskId = params.id
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    let query = supabaseAdmin.from("submissions").select("*").eq("task_id", taskId)

    if (studentId) {
      query = query.eq("student_id", studentId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching submissions:", error)
      return NextResponse.json({ error: "Error fetching submissions" }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}

