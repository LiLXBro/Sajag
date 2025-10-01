import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, BarChart3, MapPin, Users } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            Ministry of Home Affairs - NDMA Initiative
          </div>
          <h1 className="mb-4 text-5xl font-bold text-gray-900 text-balance">Sajag</h1>
          <p className="mx-auto mb-2 max-w-2xl text-2xl font-semibold text-primary text-balance">
            Disaster Management Training Platform
          </p>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground text-pretty">
            Real-time tracking and analytics for disaster management training programs across India
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="text-lg">
              <Link href="/auth/login">Access Dashboard</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg bg-transparent">
              <Link href="/auth/sign-up">Register Now</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 transition-shadow hover:shadow-lg">
            <CardHeader>
              <MapPin className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Geographic Tracking</CardTitle>
              <CardDescription>Real-time location monitoring of training programs nationwide</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 transition-shadow hover:shadow-lg">
            <CardHeader>
              <BarChart3 className="mb-2 h-10 w-10 text-secondary" />
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>Comprehensive insights and performance metrics</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 transition-shadow hover:shadow-lg">
            <CardHeader>
              <Users className="mb-2 h-10 w-10 text-accent" />
              <CardTitle>Participant Management</CardTitle>
              <CardDescription>Track attendance, feedback, and engagement</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 transition-shadow hover:shadow-lg">
            <CardHeader>
              <AlertTriangle className="mb-2 h-10 w-10 text-destructive" />
              <CardTitle>Multi-Hazard Coverage</CardTitle>
              <CardDescription>Training for earthquakes, floods, cyclones, and more</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-20">
          <Card className="border-2 bg-card/80 backdrop-blur">
            <CardContent className="p-8">
              <div className="grid gap-8 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">500+</div>
                  <div className="mt-2 text-sm text-muted-foreground">Training Programs</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-secondary">50,000+</div>
                  <div className="mt-2 text-sm text-muted-foreground">Participants Trained</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-accent">28</div>
                  <div className="mt-2 text-sm text-muted-foreground">States Covered</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
