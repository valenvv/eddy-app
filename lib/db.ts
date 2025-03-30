// This file is now deprecated as we're using Supabase
// It's kept for reference but no longer used in the application

// Shared data stores - these are now in Supabase tables
export const classesData: any[] = []
export const tasksData: any[] = []
export const submissionsData: any[] = []
export const studentsData: any[] = []

// Helper functions - these are now handled by Supabase queries
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
  // This functionality is now handled by the learning-style API
  return { studentId, learningStyle }
}

