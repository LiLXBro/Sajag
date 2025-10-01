"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User } from "lucide-react"
import Image from "next/image"

interface Update {
  id: string
  update_type: string
  message: string
  images?: string[]
  created_at: string
  profiles?: {
    full_name: string
    role: string
  }
}

interface UpdatesListProps {
  updates: Update[]
}

export function UpdatesList({ updates }: UpdatesListProps) {
  if (updates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-600">No updates posted yet</p>
          <p className="mt-2 text-sm text-gray-500">Be the first to post an update from the field</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {updates.map((update) => (
        <Card key={update.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <CardTitle className="text-lg">{update.update_type}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    Field Report
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  {update.profiles && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {update.profiles.full_name}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(update.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-700">{update.message}</p>
            {update.images && update.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {update.images.map((image, index) => (
                  <div key={index} className="relative aspect-video overflow-hidden rounded-lg">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Update image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
