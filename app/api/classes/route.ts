import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, teacherId, description } = data

    if (!name || !teacherId) {
      return NextResponse.json({ error: "Name and teacherId are required" }, { status: 400 })
    }

    // Generate a unique invite code
    const inviteCode = generateInviteCode()

    const { data: newClass, error } = await supabaseAdmin
      .from("classes")
      .insert([
        {
          name,
          teacher_id: teacherId,
          description: description || "",
          invite_code: inviteCode,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating class:", error)
      return NextResponse.json({ error: "Failed to create class" }, { status: 500 })
    }

    return NextResponse.json(newClass, { status: 201 })
  } catch (error) {
    console.error("Error creating class:", error)
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get("teacherId")

    if (teacherId) {
      const { data, error } = await supabaseAdmin
        .from("classes")
        .select(`
          id, 
          name, 
          description, 
          invite_code,
          teacher_id,
          created_at
        `)
        .eq("teacher_id", teacherId)

      if (error) {
        console.error("Error fetching classes:", error)
        return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 })
      }

      // For each class, get the count of students and tasks
      const classesWithCounts = await Promise.all(
        data.map(async (cls) => {
          // Get student count
          const { count: studentCount, error: studentError } = await supabaseAdmin
            .from("class_students")
            .select("*", { count: "exact", head: true })
            .eq("class_id", cls.id)

          if (studentError) {
            console.error("Error counting students:", studentError)
          }

          // Get task count
          const { count: taskCount, error: taskError } = await supabaseAdmin
            .from("tasks")
            .select("*", { count: "exact", head: true })
            .eq("class_id", cls.id)

          if (taskError) {
            console.error("Error counting tasks:", taskError)
          }

          return {
            ...cls,
            students: studentCount || 0,
            tasks: taskCount || 0,
          }
        }),
      )

      return NextResponse.json(classesWithCounts)
    }

    // If no teacherId is provided, return all classes
    const { data, error } = await supabaseAdmin.from("classes").select()

    if (error) {
      console.error("Error fetching all classes:", error)
      return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 })
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

