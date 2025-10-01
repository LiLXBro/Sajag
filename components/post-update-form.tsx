"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, Send } from "lucide-react"

interface PostUpdateFormProps {
  trainingId: string
  userId: string
}

export function PostUpdateForm({ trainingId, userId }: PostUpdateFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    update_type: "Progress Update",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()

      const { error: insertError } = await supabase.from("training_updates").insert({
        training_id: trainingId,
        update_type: formData.update_type,
        message: formData.message,
        posted_by: userId,
      })

      if (insertError) throw insertError

      setSuccess(true)
      setFormData({ update_type: "Progress Update", message: "" })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post update")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Post Update</CardTitle>
        <CardDescription>Share real-time information from the field</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="update_type">Update Type</Label>
            <Select
              value={formData.update_type}
              onValueChange={(value) => setFormData({ ...formData, update_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Progress Update">Progress Update</SelectItem>
                <SelectItem value="Attendance Report">Attendance Report</SelectItem>
                <SelectItem value="Activity Completion">Activity Completion</SelectItem>
                <SelectItem value="Issue/Challenge">Issue/Challenge</SelectItem>
                <SelectItem value="Resource Request">Resource Request</SelectItem>
                <SelectItem value="Safety Alert">Safety Alert</SelectItem>
                <SelectItem value="General Information">General Information</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Describe what's happening on the ground..."
              rows={6}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertDescription>Update posted successfully!</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Post Update
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
