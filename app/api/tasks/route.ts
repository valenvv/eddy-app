import { NextResponse } from "next/server"
import { tasksData, classesData } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { classId, tasksByLearningStyle } = data

    if (!classId || !tasksByLearningStyle) {
      return NextResponse.json({ error: "ClassId and tasksByLearningStyle are required" }, { status: 400 })
    }

    const classIndex = classesData.findIndex((cls) => cls.id === classId)
    if (classIndex === -1) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    const taskId = `task_${Date.now()}`
    const newTask = {
      id: taskId,
      classId,
      tasksByLearningStyle,
      submissions: [],
      createdAt: new Date().toISOString(),
    }

    tasksData.push(newTask)

    // Add task to class
    classesData[classIndex].tasks.push(taskId)

    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task", details: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")
    const studentId = searchParams.get("studentId")

    if (classId) {
      const classTasks = tasksData.filter((task) => task.classId === classId)
      return NextResponse.json(classTasks)
    }

    if (studentId) {
      // Find classes the student is in
      const studentClasses = classesData.filter((cls) => cls.students.some((student) => student.id === studentId))

      // Check if task is in one of those classes
      const studentTasks = tasksData.filter((task) => studentClasses.some((cls) => cls.tasks.includes(task.id)))

      return NextResponse.json(studentTasks)
    }

    return NextResponse.json(tasksData)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks", details: error.message }, { status: 500 })
  }
}

