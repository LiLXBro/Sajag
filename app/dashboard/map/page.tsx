import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapView } from "@/components/map-view"

export default async function MapPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all training programs with location data
  const { data: trainings } = await supabase
    .from("training_programs")
    .select("*")
    .not("latitude", "is", null)
    .not("longitude", "is", null)

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Geographic View</h1>
            <p className="text-sm text-gray-600">Training programs across India</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      <div className="flex-1">
        <MapView trainings={trainings || []} />
      </div>
    </div>
  )
}
