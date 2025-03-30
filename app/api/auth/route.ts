import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { userId, role } = data

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("user_id, name, role")
      .eq("user_id", userId)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Database error:", fetchError)
      return NextResponse.json({ error: "Error checking user" }, { status: 500 })
    }

    if (existingUser) {
      return NextResponse.json(existingUser)
    }

    // Create new user if it doesn't exist
    const newUser = {
      user_id: userId,
      name: role === "teacher" ? "Profesor Nuevo" : "Estudiante Nuevo",
      role: role || "student",
    }

    const { data: createdUser, error: createError } = await supabaseAdmin
      .from("users")
      .insert([newUser])
      .select()
      .single()

    if (createError) {
      console.error("Error creating user:", createError)
      return NextResponse.json({ error: "Error creating user" }, { status: 500 })
    }

    return NextResponse.json(createdUser)
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("user_id, name, role")
      .eq("user_id", userId)
      .single()

    if (error) {
      console.error("Error fetching user:", error)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error in GET user:", error)
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 })
  }
}

