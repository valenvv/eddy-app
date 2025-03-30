import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "StudentId is required" }, { status: 400 })
    }

    // Get all badges for the student
    const { data, error } = await supabaseAdmin
      .from("badges")
      .select("*")
      .eq("student_id", studentId)
      .order("earned_at", { ascending: false })

    if (error) {
      console.error("Error fetching badges:", error)
      return NextResponse.json({ error: "Error fetching badges" }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Error fetching badges:", error)
    return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 })
  }
}

