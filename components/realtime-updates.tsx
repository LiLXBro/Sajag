"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, MapPin } from "lucide-react"
import Link from "next/link"

interface RealtimeUpdate {
  id: string
  training_id: string
  update_type: string
  message: string
  created_at: string
  training_programs?: {
    title: string
    location_name: string
    state: string
  }
}

export function RealtimeUpdates() {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([])
  const [newUpdateCount, setNewUpdateCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    // Fetch initial updates
    const fetchUpdates = async () => {
      const { data } = await supabase
        .from("training_updates")
        .select("*, training_programs(title, location_name, state)")
        .order("created_at", { ascending: false })
        .limit(5)

      if (data) {
        setUpdates(data as RealtimeUpdate[])
      }
    }

    fetchUpdates()

    // Subscribe to real-time changes
    const channel = supabase
      .channel("training_updates_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "training_updates",
        },
        async (payload) => {
          console.log("[v0] New update received:", payload)

          // Fetch the complete update with training info
          const { data } = await supabase
            .from("training_updates")
            .select("*, training_programs(title, location_name, state)")
            .eq("id", payload.new.id)
            .single()

          if (data) {
            setUpdates((prev) => [data as RealtimeUpdate, ...prev.slice(0, 4)])
            setNewUpdateCount((prev) => prev + 1)

            // Show browser notification if permitted
            if (Notification.permission === "granted") {
              new Notification("New Training Update", {
                body: data.message,
                icon: "/favicon.ico",
              })
            }
          }
        },
      )
      .subscribe()

    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission()
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const clearNewCount = () => {
    setNewUpdateCount(0)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <CardTitle>Live Updates</CardTitle>
            {newUpdateCount > 0 && (
              <Badge className="bg-red-500 text-white" onClick={clearNewCount}>
                {newUpdateCount} new
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>Real-time field reports from ongoing trainings</CardDescription>
      </CardHeader>
      <CardContent>
        {updates.length > 0 ? (
          <div className="space-y-4">
            {updates.map((update) => (
              <Link
                key={update.id}
                href={`/dashboard/trainings/${update.training_id}/updates`}
                className="block rounded-lg border p-3 transition-colors hover:bg-gray-50"
              >
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {update.update_type}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(update.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {update.training_programs && (
                  <div className="mb-1 font-medium text-sm">{update.training_programs.title}</div>
                )}
                <p className="mb-2 text-sm text-gray-600 line-clamp-2">{update.message}</p>
                {update.training_programs && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {update.training_programs.location_name}, {update.training_programs.state}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500">No recent updates</p>
        )}
      </CardContent>
    </Card>
  )
}
