// This file simulates a database for our application
// In a real application, this would be replaced with a proper database

// Shared data stores
export const classesData: any[] = []
export const tasksData: any[] = []
export const submissionsData: any[] = []
export const studentsData: any[] = []

// Add some initial demo data
// Demo class
const demoClassId = "class_demo_1"
if (!classesData.some((c) => c.id === demoClassId)) {
  classesData.push({
    id: demoClassId,
    name: "Ciencias Naturales",
    teacherId: "teacher_123",
    description: "Clase demo para ciencias naturales",
    students: [
      {
        id: "student_123",
        joinedAt: new Date().toISOString(),
        learningStyle: "visual",
      },
    ],
    tasks: ["task_demo_1"],
    inviteCode: "DEMO123",
    createdAt: new Date().toISOString(),
  })
}

// Demo task
const demoTaskId = "task_demo_1"
if (!tasksData.some((t) => t.id === demoTaskId)) {
  tasksData.push({
    id: demoTaskId,
    classId: demoClassId,
    tasksByLearningStyle: {
      visual: [
        {
          id: "visual_task_1",
          title: "Crear un mapa mental sobre el Sistema Solar",
          description: "Diseña un mapa mental colorido que muestre los planetas y sus características.",
        },
      ],
      auditory: [
        {
          id: "auditory_task_1",
          title: "Grabar una explicación sobre el Sistema Solar",
          description: "Graba un audio explicando los planetas del Sistema Solar.",
        },
      ],
      reading: [
        {
          id: "reading_task_1",
          title: "Escribir un resumen sobre el Sistema Solar",
          description: "Escribe un resumen detallado sobre los planetas del Sistema Solar.",
        },
      ],
      kinesthetic: [
        {
          id: "kinesthetic_task_1",
          title: "Construir un modelo del Sistema Solar",
          description: "Construye un modelo 3D del Sistema Solar con materiales reciclados.",
        },
      ],
    },
    submissions: [],
    createdAt: new Date().toISOString(),
  })
}

// Demo student
if (!studentsData.some((s) => s.id === "student_123")) {
  studentsData.push({
    id: "student_123",
    learningStyle: "visual",
    createdAt: new Date().toISOString(),
  })
}

// Helper functions for working with our "database"
export function getClassById(id: string) {
  return classesData.find((cls) => cls.id === id)
}

export function getTaskById(id: string) {
  return tasksData.find((task) => task.id === id)
}

export function getTasksByClassId(classId: string) {
  return tasksData.filter((task) => task.classId === classId)
}

export function getTasksByStudentId(studentId: string) {
  // Find classes the student is in
  const studentClasses = classesData.filter((cls) => cls.students.some((student: any) => student.id === studentId))

  // Get tasks from those classes
  return tasksData.filter((task) => studentClasses.some((cls) => cls.tasks.includes(task.id)))
}

export function getSubmissionsByTaskId(taskId: string) {
  return submissionsData.filter((sub) => sub.taskId === taskId)
}

export function getStudentById(id: string) {
  return studentsData.find((student) => student.id === id)
}

export function updateStudentLearningStyle(studentId: string, learningStyle: string) {
  const studentIndex = studentsData.findIndex((student) => student.id === studentId)

  if (studentIndex === -1) {
    // Create new student if not exists
    studentsData.push({
      id: studentId,
      learningStyle,
      createdAt: new Date().toISOString(),
    })
  } else {
    // Update existing student
    studentsData[studentIndex].learningStyle = learningStyle
  }

  // Also update learning style in all classes student is in
  classesData.forEach((cls, index) => {
    const studentIndex = cls.students.findIndex((student: any) => student.id === studentId)
    if (studentIndex !== -1) {
      cls.students[studentIndex].learningStyle = learningStyle
    }
  })

  return { studentId, learningStyle }
}

