import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "StudentId is required" }, { status: 400 })
    }

    // Get classes the student is enrolled in
    const { data: enrollments, error: enrollmentError } = await supabaseAdmin
      .from("class_students")
      .select("class_id")
      .eq("student_id", studentId)

    if (enrollmentError) {
      console.error("Error fetching enrollments:", enrollmentError)
      return NextResponse.json({ error: "Error fetching enrollments" }, { status: 500 })
    }

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json([])
    }

    // Get details for these classes
    const classIds = enrollments.map((enrollment) => enrollment.class_id)

    const { data: classes, error: classesError } = await supabaseAdmin
      .from("classes")
      .select(`
        id,
        name,
        description,
        invite_code,
        teacher_id,
        created_at
      `)
      .in("id", classIds)

    if (classesError) {
      console.error("Error fetching classes:", classesError)
      return NextResponse.json({ error: "Error fetching classes" }, { status: 500 })
    }

    return NextResponse.json(classes)
  } catch (error) {
    console.error("Error fetching student classes:", error)
    return NextResponse.json({ error: "Failed to fetch student classes" }, { status: 500 })
  }
}

