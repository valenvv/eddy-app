import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { classId, tasksByLearningStyle, theme } = data

    if (!classId || !tasksByLearningStyle) {
      return NextResponse.json({ error: "ClassId and tasksByLearningStyle are required" }, { status: 400 })
    }

    // Check if class exists
    const { data: classData, error: classError } = await supabaseAdmin
      .from("classes")
      .select("id")
      .eq("id", classId)
      .single()

    if (classError) {
      console.error("Error checking class:", classError)
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    // Create the task
    const { data: newTask, error: taskError } = await supabaseAdmin
      .from("tasks")
      .insert([
        {
          class_id: classId,
          theme: theme || null, // Guardamos el tema de la tarea
        },
      ])
      .select()
      .single()

    if (taskError) {
      console.error("Error creating task:", taskError)
      return NextResponse.json({ error: "Error creating task" }, { status: 500 })
    }

    // Create task options for each learning style
    const taskOptions = []
    for (const [style, tasks] of Object.entries(tasksByLearningStyle)) {
      for (const task of tasks as any[]) {
        taskOptions.push({
          task_id: newTask.id,
          learning_style: style,
          title: task.title,
          description: task.description,
        })
      }
    }

    if (taskOptions.length > 0) {
      const { error: optionsError } = await supabaseAdmin.from("task_options").insert(taskOptions)

      if (optionsError) {
        console.error("Error creating task options:", optionsError)
        return NextResponse.json({ error: "Error creating task options" }, { status: 500 })
      }
    }

    // Return the created task with options
    const { data: taskWithOptions, error: fetchError } = await supabaseAdmin
      .from("tasks")
      .select(`
        id,
        class_id,
        theme,
        created_at,
        task_options (
          id,
          learning_style,
          title,
          description
        )
      `)
      .eq("id", newTask.id)
      .single()

    if (fetchError) {
      console.error("Error fetching created task:", fetchError)
      return NextResponse.json({ error: "Error fetching created task" }, { status: 500 })
    }

    // Format the response to match the expected structure
    const formattedTask = {
      id: taskWithOptions.id,
      classId: taskWithOptions.class_id,
      theme: taskWithOptions.theme,
      tasksByLearningStyle: {} as Record<string, any[]>,
      submissions: [],
      createdAt: taskWithOptions.created_at,
    }

    // Group task options by learning style
    taskWithOptions.task_options.forEach((option: any) => {
      if (!formattedTask.tasksByLearningStyle[option.learning_style]) {
        formattedTask.tasksByLearningStyle[option.learning_style] = []
      }

      formattedTask.tasksByLearningStyle[option.learning_style].push({
        id: option.id,
        title: option.title,
        description: option.description,
      })
    })

    return NextResponse.json(formattedTask, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")
    const studentId = searchParams.get("studentId")

    if (classId) {
      // Get tasks for a specific class
      const { data, error } = await supabaseAdmin
        .from("tasks")
        .select(`
          id,
          class_id,
          theme,
          created_at,
          task_options (
            id,
            learning_style,
            title,
            description
          ),
          submissions (
            id
          )
        `)
        .eq("class_id", classId)

      if (error) {
        console.error("Error fetching tasks:", error)
        return NextResponse.json({ error: "Error fetching tasks" }, { status: 500 })
      }

      // Format the response
      const formattedTasks = data.map((task) => {
        const tasksByLearningStyle: Record<string, any[]> = {}

        // Group task options by learning style
        task.task_options.forEach((option: any) => {
          if (!tasksByLearningStyle[option.learning_style]) {
            tasksByLearningStyle[option.learning_style] = []
          }

          tasksByLearningStyle[option.learning_style].push({
            id: option.id,
            title: option.title,
            description: option.description,
          })
        })

        return {
          id: task.id,
          classId: task.class_id,
          theme: task.theme,
          tasksByLearningStyle,
          submissions: task.submissions.map((sub: any) => sub.id),
          createdAt: task.created_at,
        }
      })

      return NextResponse.json(formattedTasks)
    }

    if (studentId) {
      // Get tasks for a specific student
      // First, get the classes the student is enrolled in
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

      // Get tasks for these classes
      const classIds = enrollments.map((enrollment) => enrollment.class_id)

      const { data, error } = await supabaseAdmin
        .from("tasks")
        .select(`
          id,
          class_id,
          theme,
          created_at,
          task_options (
            id,
            learning_style,
            title,
            description
          ),
          submissions (
            id,
            student_id
          )
        `)
        .in("class_id", classIds)

      if (error) {
        console.error("Error fetching tasks:", error)
        return NextResponse.json({ error: "Error fetching tasks" }, { status: 500 })
      }

      // Format the response
      const formattedTasks = data.map((task) => {
        const tasksByLearningStyle: Record<string, any[]> = {}

        // Group task options by learning style
        task.task_options.forEach((option: any) => {
          if (!tasksByLearningStyle[option.learning_style]) {
            tasksByLearningStyle[option.learning_style] = []
          }

          tasksByLearningStyle[option.learning_style].push({
            id: option.id,
            title: option.title,
            description: option.description,
          })
        })

        // Check if this student has submitted this task
        const studentSubmissions = task.submissions.filter((sub: any) => sub.student_id === studentId)

        return {
          id: task.id,
          classId: task.class_id,
          theme: task.theme,
          tasksByLearningStyle,
          submissions: studentSubmissions.map((sub: any) => sub.id),
          createdAt: task.created_at,
        }
      })

      return NextResponse.json(formattedTasks)
    }

    // If no filters provided, return all tasks
    const { data, error } = await supabaseAdmin.from("tasks").select(`
        id,
        class_id,
        theme,
        created_at
      `)

    if (error) {
      console.error("Error fetching all tasks:", error)
      return NextResponse.json({ error: "Error fetching tasks" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

