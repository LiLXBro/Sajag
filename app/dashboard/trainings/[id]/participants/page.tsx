import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ParticipantsList } from "@/components/participants-list"
import { AddParticipantForm } from "@/components/add-participant-form"

export default async function ParticipantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: training } = await supabase.from("training_programs").select("*").eq("id", id).single()

  if (!training) {
    redirect("/dashboard/trainings")
  }

  const { data: participants } = await supabase
    .from("participants")
    .select("*")
    .eq("training_id", id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost" size="sm" className="mb-2">
            <Link href={`/dashboard/trainings/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Training Details
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{training.title}</h1>
          <p className="text-sm text-gray-600">Manage participants and attendance</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ParticipantsList participants={participants || []} trainingId={id} />
          </div>
          <div>
            <AddParticipantForm trainingId={id} />
          </div>
        </div>
      </div>
    </div>
  )
}
