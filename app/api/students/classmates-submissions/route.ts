import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "StudentId is required" }, { status: 400 })
    }

    // First, get all classes the student is enrolled in
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

    // Get all classmates (students in the same classes)
    const classIds = enrollments.map((enrollment) => enrollment.class_id)

    const { data: classmates, error: classmatesError } = await supabaseAdmin
      .from("class_students")
      .select("student_id")
      .in("class_id", classIds)
      .neq("student_id", studentId) // Exclude the current student

    if (classmatesError) {
      console.error("Error fetching classmates:", classmatesError)
      return NextResponse.json({ error: "Error fetching classmates" }, { status: 500 })
    }

    if (!classmates || classmates.length === 0) {
      return NextResponse.json([])
    }

    // Get submissions from these classmates
    const classmateIds = [...new Set(classmates.map((c) => c.student_id))]

    const { data: submissions, error: submissionsError } = await supabaseAdmin
      .from("submissions")
      .select("*")
      .in("student_id", classmateIds)
      .order("created_at", { ascending: false })

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError)
      return NextResponse.json({ error: "Error fetching submissions" }, { status: 500 })
    }

    return NextResponse.json(submissions || [])
  } catch (error) {
    console.error("Error fetching classmates' submissions:", error)
    return NextResponse.json({ error: "Failed to fetch classmates' submissions" }, { status: 500 })
  }
}

