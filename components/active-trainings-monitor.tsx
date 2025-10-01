"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Users, MapPin, Calendar } from "lucide-react"
import Link from "next/link"

interface ActiveTraining {
  id: string
  title: string
  location_name: string
  state: string
  start_date: string
  end_date: string
  actual_participants: number
  target_participants: number
  status: string
}

export function ActiveTrainingsMonitor() {
  const [trainings, setTrainings] = useState<ActiveTraining[]>([])

  useEffect(() => {
    const supabase = createClient()

    const fetchActiveTrainings = async () => {
      const { data } = await supabase
        .from("training_programs")
        .select("*")
        .eq("status", "ongoing")
        .order("start_date", { ascending: false })

      if (data) {
        setTrainings(data as ActiveTraining[])
      }
    }

    fetchActiveTrainings()

    // Subscribe to changes in training programs
    const channel = supabase
      .channel("training_programs_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "training_programs",
          filter: "status=eq.ongoing",
        },
        () => {
          console.log("[v0] Training program updated")
          fetchActiveTrainings()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            <CardTitle>Active Trainings</CardTitle>
            <Badge className="bg-green-100 text-green-800">{trainings.length} ongoing</Badge>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/trainings">View All</Link>
          </Button>
        </div>
        <CardDescription>Currently running training programs</CardDescription>
      </CardHeader>
      <CardContent>
        {trainings.length > 0 ? (
          <div className="space-y-3">
            {trainings.map((training) => (
              <Link
                key={training.id}
                href={`/dashboard/trainings/${training.id}`}
                className="block rounded-lg border p-3 transition-colors hover:bg-gray-50"
              >
                <div className="mb-2 font-medium text-sm">{training.title}</div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {training.location_name}, {training.state}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(training.start_date).toLocaleDateString()} -{" "}
                    {new Date(training.end_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {training.actual_participants}/{training.target_participants} participants
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500">No active trainings at the moment</p>
        )}
      </CardContent>
    </Card>
  )
}
