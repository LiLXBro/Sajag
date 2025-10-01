"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface CreateTrainingFormProps {
  userId: string
}

export function CreateTrainingForm({ userId }: CreateTrainingFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    training_type: "workshop",
    status: "planned",
    start_date: "",
    end_date: "",
    location_name: "",
    latitude: "",
    longitude: "",
    state: "",
    district: "",
    organizing_body: "",
    target_participants: "",
    budget: "",
  })

  const [selectedDisasterTypes, setSelectedDisasterTypes] = useState<string[]>([])

  const disasterTypes = [
    "earthquake",
    "flood",
    "cyclone",
    "fire",
    "landslide",
    "drought",
    "tsunami",
    "industrial",
    "other",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (selectedDisasterTypes.length === 0) {
      setError("Please select at least one disaster type")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { error: insertError } = await supabase.from("training_programs").insert({
        ...formData,
        disaster_types: selectedDisasterTypes,
        latitude: formData.latitude ? Number.parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? Number.parseFloat(formData.longitude) : null,
        target_participants: Number.parseInt(formData.target_participants),
        budget: formData.budget ? Number.parseFloat(formData.budget) : null,
        created_by: userId,
      })

      if (insertError) throw insertError

      router.push("/dashboard/trainings")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create training program")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Program Details</CardTitle>
        <CardDescription>Fill in the information about the training program</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Program Title *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Earthquake Preparedness Workshop"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="training_type">Training Type *</Label>
              <Select
                value={formData.training_type}
                onValueChange={(value) => setFormData({ ...formData, training_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="drill">Drill</SelectItem>
                  <SelectItem value="seminar">Seminar</SelectItem>
                  <SelectItem value="field_exercise">Field Exercise</SelectItem>
                  <SelectItem value="simulation">Simulation</SelectItem>
                  <SelectItem value="awareness_campaign">Awareness Campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the training program"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Disaster Types Covered *</Label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {disasterTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={selectedDisasterTypes.includes(type)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDisasterTypes([...selectedDisasterTypes, type])
                      } else {
                        setSelectedDisasterTypes(selectedDisasterTypes.filter((t) => t !== type))
                      }
                    }}
                  />
                  <Label htmlFor={type} className="cursor-pointer text-sm font-normal">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="datetime-local"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="datetime-local"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_name">Location Name *</Label>
            <Input
              id="location_name"
              required
              value={formData.location_name}
              onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
              placeholder="e.g., Delhi Administrative Training Institute"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g., Delhi"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District *</Label>
              <Input
                id="district"
                required
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="e.g., New Delhi"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="e.g., 28.6139"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="e.g., 77.2090"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="organizing_body">Organizing Body *</Label>
              <Input
                id="organizing_body"
                required
                value={formData.organizing_body}
                onChange={(e) => setFormData({ ...formData, organizing_body: e.target.value })}
                placeholder="e.g., NDMA, State SDMA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_participants">Target Participants *</Label>
              <Input
                id="target_participants"
                type="number"
                required
                value={formData.target_participants}
                onChange={(e) => setFormData({ ...formData, target_participants: e.target.value })}
                placeholder="e.g., 150"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget (INR)</Label>
            <Input
              id="budget"
              type="number"
              step="0.01"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder="e.g., 500000"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Training Program
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
