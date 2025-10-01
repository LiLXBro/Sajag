import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CreateTrainingForm } from "@/components/create-training-form"

export default async function NewTrainingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const canCreateTraining =
    profile?.role &&
    ["admin", "ndma_official", "sdma_official", "ati_coordinator", "ngo_coordinator"].includes(profile.role)

  if (!canCreateTraining) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Training Program</h1>
            <p className="text-sm text-gray-600">Register a new disaster management training activity</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/trainings">Cancel</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <CreateTrainingForm userId={user.id} />
      </div>
    </div>
  )
}
