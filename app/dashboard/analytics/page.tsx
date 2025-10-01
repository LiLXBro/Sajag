import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { TrendingUp, Users, MapPin, Calendar } from "lucide-react"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all training programs
  const { data: trainings } = await supabase.from("training_programs").select("*")

  // Calculate statistics
  const totalTrainings = trainings?.length || 0
  const ongoingTrainings = trainings?.filter((t) => t.status === "ongoing").length || 0
  const completedTrainings = trainings?.filter((t) => t.status === "completed").length || 0
  const plannedTrainings = trainings?.filter((t) => t.status === "planned").length || 0

  const totalParticipants = trainings?.reduce((sum, t) => sum + (t.actual_participants || 0), 0) || 0
  const targetParticipants = trainings?.reduce((sum, t) => sum + (t.target_participants || 0), 0) || 0
  const participationRate = targetParticipants > 0 ? ((totalParticipants / targetParticipants) * 100).toFixed(1) : 0

  const totalBudget = trainings?.reduce((sum, t) => sum + (t.budget || 0), 0) || 0

  // Get unique states
  const uniqueStates = new Set(trainings?.map((t) => t.state))
  const statesCovered = uniqueStates.size

  // Training by type
  const trainingsByType = trainings?.reduce(
    (acc, t) => {
      acc[t.training_type] = (acc[t.training_type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Training by disaster type
  const disasterTypeCounts = trainings?.reduce(
    (acc, t) => {
      t.disaster_types.forEach((type: string) => {
        acc[type] = (acc[type] || 0) + 1
      })
      return acc
    },
    {} as Record<string, number>,
  )

  // Training by state
  const trainingsByState = trainings?.reduce(
    (acc, t) => {
      acc[t.state] = (acc[t.state] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Monthly trend (last 6 months)
  const monthlyData = trainings?.reduce(
    (acc, t) => {
      const month = new Date(t.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      acc[month] = (acc[month] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-sm text-gray-600">Comprehensive insights and performance metrics</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Programs</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalTrainings}</div>
              <p className="mt-1 text-xs text-gray-500">
                {completedTrainings} completed, {ongoingTrainings} ongoing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalParticipants.toLocaleString()}</div>
              <p className="mt-1 text-xs text-gray-500">{participationRate}% of target reached</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">States Covered</CardTitle>
              <MapPin className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statesCovered}</div>
              <p className="mt-1 text-xs text-gray-500">Across India</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Budget</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{(totalBudget / 10000000).toFixed(1)}Cr</div>
              <p className="mt-1 text-xs text-gray-500">Allocated funds</p>
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Planned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{plannedTrainings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Ongoing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{ongoingTrainings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{completedTrainings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalTrainings > 0 ? ((completedTrainings / totalTrainings) * 100).toFixed(0) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <AnalyticsCharts
          trainingsByType={trainingsByType || {}}
          disasterTypeCounts={disasterTypeCounts || {}}
          trainingsByState={trainingsByState || {}}
          monthlyData={monthlyData || {}}
        />

        {/* Top Performing States */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Top Performing States</CardTitle>
            <CardDescription>States with most training programs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(trainingsByState || {})
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 10)
                .map(([state, count]) => (
                  <div key={state} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{state}</span>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-blue-600"
                          style={{
                            width: `${((count as number) / Math.max(...Object.values(trainingsByState || {}))) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="w-8 text-right text-sm font-semibold">{count as number}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
