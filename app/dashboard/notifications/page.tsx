import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Bell, MapPin, ArrowLeft } from "lucide-react"

export default async function NotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all recent updates as notifications
  const { data: updates } = await supabase
    .from("training_updates")
    .select("*, training_programs(title, location_name, state), profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost" size="sm" className="mb-2">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          </div>
          <p className="text-sm text-gray-600">All updates and alerts from training programs</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {updates && updates.length > 0 ? (
            updates.map((update: any) => (
              <Card key={update.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="secondary">{update.update_type}</Badge>
                        <span className="text-sm text-gray-500">{new Date(update.created_at).toLocaleString()}</span>
                      </div>
                      {update.training_programs && (
                        <CardTitle className="text-lg">{update.training_programs.title}</CardTitle>
                      )}
                      {update.profiles && <CardDescription>Posted by {update.profiles.full_name}</CardDescription>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-gray-700">{update.message}</p>
                  {update.training_programs && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      {update.training_programs.location_name}, {update.training_programs.state}
                    </div>
                  )}
                  <Button asChild size="sm" variant="outline" className="mt-3 bg-transparent">
                    <Link href={`/dashboard/trainings/${update.training_id}`}>View Training Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-600">No notifications yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
