import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "StudentId is required" }, { status: 400 })
    }

    // Get all submissions by this student
    const { data, error } = await supabaseAdmin
      .from("submissions")
      .select("id, task_id, content, file_url, status, created_at")
      .eq("student_id", studentId)

    if (error) {
      console.error("Error fetching student submissions:", error)
      return NextResponse.json({ error: "Error fetching submissions" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching student submissions:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}

