import { NextResponse } from "next/server"
import { tasksData, submissionsData } from "@/lib/db"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const taskId = params.id
    const task = tasksData.find((t) => t.id === taskId)

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const data = await request.json()
    const { studentId, content, fileUrl } = data

    if (!studentId || !content) {
      return NextResponse.json({ error: "StudentId and content are required" }, { status: 400 })
    }

    const submissionId = `submission_${Date.now()}`
    const newSubmission = {
      id: submissionId,
      taskId,
      studentId,
      content,
      fileUrl: fileUrl || null,
      status: "completed",
      createdAt: new Date().toISOString(),
    }

    submissionsData.push(newSubmission)

    // Add submission to task
    const taskIndex = tasksData.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      if (!tasksData[taskIndex].submissions) {
        tasksData[taskIndex].submissions = []
      }
      tasksData[taskIndex].submissions.push(submissionId)
    }

    return NextResponse.json(newSubmission, { status: 201 })
  } catch (error) {
    console.error("Error submitting task:", error)
    return NextResponse.json({ error: "Failed to submit task", details: error.message }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const taskId = params.id
    const task = tasksData.find((t) => t.id === taskId)

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Get all submissions for this task
    const taskSubmissions = submissionsData.filter((submission) => submission.taskId === taskId)

    return NextResponse.json(taskSubmissions)
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ error: "Failed to fetch submissions", details: error.message }, { status: 500 })
  }
}

