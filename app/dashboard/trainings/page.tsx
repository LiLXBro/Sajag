import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Calendar, MapPin, Users, Plus, Search } from "lucide-react"
import type { TrainingProgram } from "@/lib/types"

export default async function TrainingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: trainings } = await supabase
    .from("training_programs")
    .select("*")
    .order("start_date", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "bg-green-100 text-green-800 border-green-200"
      case "planned":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const canCreateTraining =
    profile?.role &&
    ["admin", "ndma_official", "sdma_official", "ati_coordinator", "ngo_coordinator"].includes(profile.role)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Training Programs</h1>
            <p className="text-sm text-gray-600">Manage and monitor all training activities</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search training programs..." className="pl-10" />
          </div>
          {canCreateTraining && (
            <Button asChild>
              <Link href="/dashboard/trainings/new">
                <Plus className="mr-2 h-4 w-4" />
                Create New Program
              </Link>
            </Button>
          )}
        </div>

        <div className="grid gap-6">
          {trainings && trainings.length > 0 ? (
            trainings.map((training: TrainingProgram) => (
              <Card key={training.id} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <CardTitle>{training.title}</CardTitle>
                        <Badge className={getStatusColor(training.status)}>{training.status}</Badge>
                      </div>
                      <CardDescription>{training.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {training.location_name}, {training.district}, {training.state}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(training.start_date).toLocaleDateString()} -{" "}
                      {new Date(training.end_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {training.actual_participants}/{training.target_participants} participants
                    </div>
                  </div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Badge variant="outline">{training.training_type}</Badge>
                    {training.disaster_types.map((type) => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm">
                      <Link href={`/dashboard/trainings/${training.id}`}>View Details</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/trainings/${training.id}/updates`}>Updates</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="mb-4 text-gray-600">No training programs found</p>
                {canCreateTraining && (
                  <Button asChild>
                    <Link href="/dashboard/trainings/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Program
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
