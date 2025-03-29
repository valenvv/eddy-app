"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export default function JoinClassPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [inviteCode, setInviteCode] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real app, get the studentId from authentication
      const studentId = "student_123"

      const response = await fetch("/api/classes/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteCode,
          studentId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to join class")
      }

      toast({
        title: "Joined class successfully",
        description: `You've joined ${data.class.name}`,
      })

      // Redirect to learning style test if not already completed
      const hasLearningStyle = data.class.students.some(
        (student: any) => student.id === studentId && student.learningStyle,
      )

      if (hasLearningStyle) {
        router.push("/student/dashboard")
      } else {
        router.push("/student/learning-test")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join class",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-md py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Join a Class</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="inviteCode">Class Invite Code</Label>
            <Input
              id="inviteCode"
              placeholder="Enter the 6-digit code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
              className="text-center text-2xl tracking-wider"
              maxLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Joining..." : "Join Class"}
          </Button>
        </form>
      </Card>
    </div>
  )
}

