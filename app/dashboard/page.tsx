import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, MapPin, Users, TrendingUp, AlertCircle, Plus } from "lucide-react"
import type { TrainingProgram } from "@/lib/types"
import { RealtimeUpdates } from "@/components/realtime-updates"
import { ActiveTrainingsMonitor } from "@/components/active-trainings-monitor"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch training programs
  const { data: trainings } = await supabase
    .from("training_programs")
    .select("*")
    .order("start_date", { ascending: false })
    .limit(10)

  // Fetch statistics
  const { count: totalTrainings } = await supabase.from("training_programs").select("*", { count: "exact", head: true })

  const { count: ongoingTrainings } = await supabase
    .from("training_programs")
    .select("*", { count: "exact", head: true })
    .eq("status", "ongoing")

  const { data: participantData } = await supabase.from("training_programs").select("actual_participants")

  const totalParticipants = participantData?.reduce((sum, t) => sum + (t.actual_participants || 0), 0) || 0

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
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Disaster Management Training</h1>
            <p className="text-sm text-gray-600">Welcome back, {profile?.full_name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              {profile?.role?.replace("_", " ").toUpperCase()}
            </Badge>
            <form action="/auth/logout" method="post">
              <Button variant="outline" size="sm">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Programs</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalTrainings || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Ongoing</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{ongoingTrainings || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalParticipants}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">States Covered</CardTitle>
              <MapPin className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">28</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4">
          {canCreateTraining && (
            <Button asChild>
              <Link href="/dashboard/trainings/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Training Program
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/dashboard/trainings">View All Programs</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/map">Geographic View</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/analytics">Analytics</Link>
          </Button>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <RealtimeUpdates />
          <ActiveTrainingsMonitor />
        </div>

        {/* Recent Training Programs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Training Programs</CardTitle>
            <CardDescription>Latest disaster management training activities</CardDescription>
          </CardHeader>
          <CardContent>
            {trainings && trainings.length > 0 ? (
              <div className="space-y-4">
                {trainings.map((training: TrainingProgram) => (
                  <Link
                    key={training.id}
                    href={`/dashboard/trainings/${training.id}`}
                    className="block rounded-lg border p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{training.title}</h3>
                          <Badge className={getStatusColor(training.status)}>{training.status}</Badge>
                        </div>
                        <p className="mb-3 text-sm text-gray-600">{training.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {training.location_name}, {training.state}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(training.start_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {training.actual_participants}/{training.target_participants} participants
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {training.disaster_types.map((type) => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-600">No training programs found</p>
                {canCreateTraining && (
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/trainings/new">Create First Program</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
