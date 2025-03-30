import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { inviteCode, studentId } = data

    if (!inviteCode || !studentId) {
      return NextResponse.json({ error: "Se requiere código de invitación y ID de estudiante" }, { status: 400 })
    }

    // Find class with matching invite code
    const { data: classData, error: classError } = await supabaseAdmin
      .from("classes")
      .select("id, name, invite_code")
      .eq("invite_code", inviteCode)
      .single()

    if (classError) {
      console.error("Error finding class:", classError)
      return NextResponse.json({ error: "No se encontró la clase con ese código de invitación" }, { status: 404 })
    }

    // Check if student exists, create if not
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from("users")
      .select("user_id")
      .eq("user_id", studentId)
      .single()

    if (userError && userError.code !== "PGRST116") {
      console.error("Error checking user:", userError)
      return NextResponse.json({ error: "Error al verificar el usuario" }, { status: 500 })
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
        return NextResponse.json({ error: "Error al crear el usuario" }, { status: 500 })
      }
    }

    // Check if student is already in the class
    const { data: existingEnrollment, error: enrollmentError } = await supabaseAdmin
      .from("class_students")
      .select("id")
      .eq("class_id", classData.id)
      .eq("student_id", studentId)
      .single()

    if (enrollmentError && enrollmentError.code !== "PGRST116") {
      console.error("Error checking enrollment:", enrollmentError)
      return NextResponse.json({ error: "Error al verificar la inscripción" }, { status: 500 })
    }

    if (!existingEnrollment) {
      // Add student to class
      const { error: joinError } = await supabaseAdmin.from("class_students").insert([
        {
          class_id: classData.id,
          student_id: studentId,
        },
      ])

      if (joinError) {
        console.error("Error joining class:", joinError)
        return NextResponse.json({ error: "Error al unirse a la clase" }, { status: 500 })
      }
    }

    // Get all students in the class
    const { data: classStudents, error: studentsError } = await supabaseAdmin
      .from("class_students")
      .select(`
        student_id,
        joined_at
      `)
      .eq("class_id", classData.id)

    if (studentsError) {
      console.error("Error fetching students:", studentsError)
    }

    // Get learning styles for these students separately
    const studentIds = classStudents?.map((student) => student.student_id) || []
    let learningStyles = []

    if (studentIds.length > 0) {
      const { data: styles, error: stylesError } = await supabaseAdmin
        .from("learning_styles")
        .select(`
          student_id,
          style
        `)
        .in("student_id", studentIds)

      if (stylesError) {
        console.error("Error fetching learning styles:", stylesError)
      } else {
        learningStyles = styles || []
      }
    }

    // Create a map of student_id to learning_style
    const styleMap = new Map()
    learningStyles.forEach((style) => {
      styleMap.set(style.student_id, style.style)
    })

    const formattedStudents =
      classStudents?.map((student) => ({
        id: student.student_id,
        joinedAt: student.joined_at,
        learningStyle: styleMap.get(student.student_id) || null,
      })) || []

    return NextResponse.json(
      {
        message: "Joined class successfully",
        class: {
          id: classData.id,
          name: classData.name,
          inviteCode: classData.invite_code,
          students: formattedStudents,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error joining class:", error)
    return NextResponse.json({ error: "Error al unirse a la clase" }, { status: 500 })
  }
}

