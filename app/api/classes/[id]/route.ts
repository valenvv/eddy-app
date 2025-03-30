import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const classId = params.id

    // Get the class details
    const { data: classData, error: classError } = await supabaseAdmin
      .from("classes")
      .select(`
        id, 
        name, 
        description, 
        invite_code,
        teacher_id,
        created_at
      `)
      .eq("id", classId)
      .single()

    if (classError) {
      console.error("Error fetching class:", classError)
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    // Get students in this class
    const { data: classStudents, error: studentsError } = await supabaseAdmin
      .from("class_students")
      .select(`
        id,
        student_id,
        joined_at
      `)
      .eq("class_id", classId)

    if (studentsError) {
      console.error("Error fetching class students:", studentsError)
    }

    // Get learning styles for these students
    const studentIds = classStudents?.map((student) => student.student_id) || []

    const { data: learningStyles, error: stylesError } = await supabaseAdmin
      .from("learning_styles")
      .select(`
        student_id,
        style
      `)
      .in("student_id", studentIds.length > 0 ? studentIds : ["none"])

    if (stylesError && studentIds.length > 0) {
      console.error("Error fetching learning styles:", stylesError)
    }

    // Create a map of student_id to learning_style
    const styleMap = new Map()
    learningStyles?.forEach((style) => {
      styleMap.set(style.student_id, style.style)
    })

    // Get tasks for this class
    const { data: tasks, error: tasksError } = await supabaseAdmin
      .from("tasks")
      .select(`
    id,
    theme,
    created_at
  `)
      .eq("class_id", classId)

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError)
    }

    // Format the response
    const formattedClass = {
      ...classData,
      students:
        classStudents?.map((student) => ({
          id: student.student_id,
          joinedAt: student.joined_at,
          learningStyle: styleMap.get(student.student_id) || null,
        })) || [],
      tasks: tasks?.map((task) => ({ id: task.id, theme: task.theme, created_at: task.created_at })) || [],
    }

    return NextResponse.json(formattedClass)
  } catch (error) {
    console.error("Error fetching class:", error)
    return NextResponse.json({ error: "Failed to fetch class" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const classId = params.id
    const data = await request.json()

    const { error } = await supabaseAdmin.from("classes").update(data).eq("id", classId)

    if (error) {
      console.error("Error updating class:", error)
      return NextResponse.json({ error: "Failed to update class" }, { status: 500 })
    }

    // Get the updated class
    const { data: updatedClass, error: fetchError } = await supabaseAdmin
      .from("classes")
      .select()
      .eq("id", classId)
      .single()

    if (fetchError) {
      console.error("Error fetching updated class:", fetchError)
      return NextResponse.json({ error: "Failed to fetch updated class" }, { status: 500 })
    }

    return NextResponse.json(updatedClass)
  } catch (error) {
    console.error("Error updating class:", error)
    return NextResponse.json({ error: "Failed to update class" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const classId = params.id

    const { error } = await supabaseAdmin.from("classes").delete().eq("id", classId)

    if (error) {
      console.error("Error deleting class:", error)
      return NextResponse.json({ error: "Failed to delete class" }, { status: 500 })
    }

    return NextResponse.json({ message: "Class deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting class:", error)
    return NextResponse.json({ error: "Failed to delete class" }, { status: 500 })
  }
}

