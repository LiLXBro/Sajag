import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, MapPin, Users, DollarSign, Building, ArrowLeft } from "lucide-react"

export default async function TrainingDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
    notFound()
  }

  const { data: participants } = await supabase.from("participants").select("*").eq("training_id", id)

  const { data: updates } = await supabase
    .from("training_updates")
    .select("*, profiles(full_name)")
    .eq("training_id", id)
    .order("created_at", { ascending: false })
    .limit(5)

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost" size="sm" className="mb-2">
            <Link href="/dashboard/trainings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Programs
            </Link>
          </Button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900">{training.title}</h1>
                <Badge className={getStatusColor(training.status)}>{training.status}</Badge>
              </div>
              <p className="text-gray-600">{training.description}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Details */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Program Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-1 h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-600">Duration</div>
                      <div className="text-sm">
                        {new Date(training.start_date).toLocaleDateString()} -{" "}
                        {new Date(training.end_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-600">Location</div>
                      <div className="text-sm">
                        {training.location_name}
                        <br />
                        {training.district}, {training.state}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building className="mt-1 h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-600">Organizing Body</div>
                      <div className="text-sm">{training.organizing_body}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="mt-1 h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-600">Participants</div>
                      <div className="text-sm">
                        {training.actual_participants} / {training.target_participants}
                      </div>
                    </div>
                  </div>

                  {training.budget && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="mt-1 h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-600">Budget</div>
                        <div className="text-sm">₹{training.budget.toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="mb-2 text-sm font-medium text-gray-600">Training Type</div>
                  <Badge variant="outline">{training.training_type}</Badge>
                </div>

                <div>
                  <div className="mb-2 text-sm font-medium text-gray-600">Disaster Types Covered</div>
                  <div className="flex flex-wrap gap-2">
                    {training.disaster_types.map((type: string) => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Updates */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Updates</CardTitle>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/trainings/${id}/updates`}>View All</Link>
                  </Button>
                </div>
                <CardDescription>Latest activity from this training program</CardDescription>
              </CardHeader>
              <CardContent>
                {updates && updates.length > 0 ? (
                  <div className="space-y-4">
                    {updates.map((update: any) => (
                      <div key={update.id} className="border-b pb-4 last:border-0">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-medium">{update.update_type}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(update.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{update.message}</p>
                        {update.profiles && (
                          <p className="mt-1 text-xs text-gray-500">Posted by {update.profiles.full_name}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No updates yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full bg-transparent" variant="outline">
                  <Link href={`/dashboard/trainings/${id}/updates`}>Post Update</Link>
                </Button>
                <Button asChild className="w-full bg-transparent" variant="outline">
                  <Link href={`/dashboard/trainings/${id}/participants`}>Manage Participants</Link>
                </Button>
                {training.latitude && training.longitude && (
                  <Button asChild className="w-full bg-transparent" variant="outline">
                    <Link href={`/dashboard/map?focus=${id}`}>View on Map</Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Participants</CardTitle>
                <CardDescription>{participants?.length || 0} registered</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {participants && participants.length > 0 ? (
                    <>
                      {participants.slice(0, 5).map((participant: any) => (
                        <div key={participant.id} className="flex items-center justify-between text-sm">
                          <span>{participant.name}</span>
                          {participant.attendance_status && (
                            <Badge variant="secondary" className="text-xs">
                              Present
                            </Badge>
                          )}
                        </div>
                      ))}
                      {participants.length > 5 && (
                        <Button asChild variant="link" size="sm" className="w-full">
                          <Link href={`/dashboard/trainings/${id}/participants`}>
                            View all {participants.length} participants
                          </Link>
                        </Button>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No participants registered yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
