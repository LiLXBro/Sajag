"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, Phone, Building, User, Star } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Participant {
  id: string
  name: string
  email?: string
  phone?: string
  organization?: string
  designation?: string
  attendance_status: boolean
  feedback_rating?: number
  feedback_comments?: string
}

interface ParticipantsListProps {
  participants: Participant[]
  trainingId: string
}

export function ParticipantsList({ participants, trainingId }: ParticipantsListProps) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)

  const toggleAttendance = async (participantId: string, currentStatus: boolean) => {
    setUpdating(participantId)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("participants")
        .update({ attendance_status: !currentStatus })
        .eq("id", participantId)

      if (error) throw error

      // Update actual_participants count
      const newCount = participants.filter((p) =>
        p.id === participantId ? !currentStatus : p.attendance_status,
      ).length

      await supabase.from("training_programs").update({ actual_participants: newCount }).eq("id", trainingId)

      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating attendance:", error)
    } finally {
      setUpdating(null)
    }
  }

  if (participants.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-600">No participants registered yet</p>
          <p className="mt-2 text-sm text-gray-500">Add participants using the form on the right</p>
        </CardContent>
      </Card>
    )
  }

  const attendanceCount = participants.filter((p) => p.attendance_status).length
  const attendanceRate = ((attendanceCount / participants.length) * 100).toFixed(0)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Summary</CardTitle>
          <CardDescription>
            {attendanceCount} of {participants.length} participants present ({attendanceRate}%)
          </CardDescription>
        </CardHeader>
      </Card>

      {participants.map((participant) => (
        <Card key={participant.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <Checkbox
                    checked={participant.attendance_status}
                    onCheckedChange={() => toggleAttendance(participant.id, participant.attendance_status)}
                    disabled={updating === participant.id}
                  />
                  <CardTitle className="text-lg">{participant.name}</CardTitle>
                  {participant.attendance_status && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Present
                    </Badge>
                  )}
                </div>
                <div className="ml-8 space-y-1 text-sm text-gray-600">
                  {participant.designation && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {participant.designation}
                    </div>
                  )}
                  {participant.organization && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {participant.organization}
                    </div>
                  )}
                  {participant.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {participant.email}
                    </div>
                  )}
                  {participant.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {participant.phone}
                    </div>
                  )}
                </div>
              </div>
              {participant.feedback_rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold">{participant.feedback_rating}/5</span>
                </div>
              )}
            </div>
          </CardHeader>
          {participant.feedback_comments && (
            <CardContent>
              <p className="text-sm italic text-gray-600">"{participant.feedback_comments}"</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}
