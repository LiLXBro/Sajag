"use client"

import { useEffect, useRef, useState } from "react"
import type { TrainingProgram } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin, Calendar, Users, X } from "lucide-react"
import Script from "next/script"

// Bhuvan is loaded from the script tag, so we need to declare it for TypeScript
declare const Bhuvan: any

interface MapViewProps {
  trainings: TrainingProgram[]
}

export function MapView({ trainings }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const markersLayerRef = useRef<any>(null) // Use a ref to hold the markers layer
  const [map, setMap] = useState<any | null>(null)
  const [selectedTraining, setSelectedTraining] = useState<TrainingProgram | null>(null)
  const [isBhuvanReady, setIsBhuvanReady] = useState(false)

  // --- EFFECT 1: Initialize the map ONCE ---
  // This effect runs only when the Bhuvan script is ready.
  // It sets up the map, controls, and base layers.
  useEffect(() => {
    if (!isBhuvanReady || !mapRef.current || map) return

    const bhuvanMap = new Bhuvan.Map(mapRef.current.id, {
      controls: [
        new Bhuvan.Control.Navigation(),
        new Bhuvan.Control.PanZoomBar(),
        new Bhuvan.Control.LayerSwitcher({ roundedCorner: true }),
        new Bhuvan.Control.MousePosition(),
      ],
    })

    bhuvanMap.addLayer(new Bhuvan.Layer.BhuvanTile("Bhuvan Satellite", "SATELLITE", true))
    bhuvanMap.addLayer(new Bhuvan.Layer.BhuvanTile("Bhuvan Street", "STREET", false))

    const centerLonLat = new Bhuvan.LonLat(78.9629, 20.5937)
    const transformedCenter = centerLonLat.transform("EPSG:4326", bhuvanMap.getProjectionObject())
    bhuvanMap.setCenter(transformedCenter, 5)

    // Create the vector layer and store it in a ref
    const markersLayer = new Bhuvan.Layer.Vector("Training Programs")
    bhuvanMap.addLayer(markersLayer)
    markersLayerRef.current = markersLayer

    // Add a control to handle clicks on the markers
    const selectControl = new Bhuvan.Control.SelectFeature(markersLayer, {
      onSelect: (feature: any) => {
        setSelectedTraining(feature.attributes)
        bhuvanMap.panTo(feature.geometry.getBounds().getCenterLonLat())
      },
      onUnselect: () => {
        setSelectedTraining(null)
      },
    })
    bhuvanMap.addControl(selectControl)
    selectControl.activate()

    setMap(bhuvanMap)

    // --- CLEANUP ---
    // This function runs when the component is unmounted
    return () => {
      if (bhuvanMap) {
        bhuvanMap.destroy()
        setMap(null)
      }
    }
  }, [isBhuvanReady]) // Dependency array ensures this runs only once

  // --- EFFECT 2: Update markers when trainings data changes ---
  // This effect runs whenever the map is ready or the training data updates.
  // It clears and re-adds only the markers, without recreating the whole map.
  useEffect(() => {
    if (!map || !markersLayerRef.current) return

    const layer = markersLayerRef.current
    layer.removeAllFeatures() // Clear old markers first

    const features = trainings
      .map((training) => {
        if (!training.latitude || !training.longitude) return null

        const point = new Bhuvan.Geometry.Point(training.longitude, training.latitude).transform(
          "EPSG:4326",
          map.getProjectionObject()
        )
        const feature = new Bhuvan.Feature.Vector(point, training)
        feature.style = {
          fillColor: getMarkerColor(training.status),
          fillOpacity: 0.8,
          strokeColor: "#ffffff",
          strokeWidth: 2,
          pointRadius: 8,
        }
        return feature
      })
      .filter(Boolean) as any[]

    if (features.length > 0) {
      layer.addFeatures(features)
    }
  }, [map, trainings]) // Reruns only when map or trainings change

  const getMarkerColor = (status: string) => {
    switch (status) {
      case "ongoing": return "#22c55e"
      case "planned": return "#3b82f6"
      case "completed": return "#6b7280"
      case "cancelled": return "#ef4444"
      default: return "#6b7280"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing": return "bg-green-100 text-green-800 border-green-200"
      case "planned": return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed": return "bg-gray-100 text-gray-800 border-gray-200"
      case "cancelled": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} id="bhuvan-map-container" className="h-full w-full" />

      {/* Legend Card */}
      <Card className="absolute left-4 top-4 w-64 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Map Legend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span>Ongoing</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span>Planned</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full bg-gray-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span>Cancelled</span>
          </div>
        </CardContent>
      </Card>

      {/* Selected Training Details Card */}
      {selectedTraining && (
        <Card className="absolute bottom-4 right-4 w-96 shadow-lg animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-2">
                <div className="mb-2 flex items-center gap-2">
                  <CardTitle className="text-lg">{selectedTraining.title}</CardTitle>
                  <Badge className={getStatusColor(selectedTraining.status)}>{selectedTraining.status}</Badge>
                </div>
                <CardDescription>{selectedTraining.description}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => setSelectedTraining(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              {selectedTraining.location_name}, {selectedTraining.district}, {selectedTraining.state}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              {new Date(selectedTraining.start_date).toLocaleDateString()} -{" "}
              {new Date(selectedTraining.end_date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              {selectedTraining.actual_participants}/{selectedTraining.target_participants} participants
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTraining.disaster_types.map((type) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}
                </Badge>
              ))}
            </div>
            <Button asChild className="w-full" size="sm">
              <Link href={`/dashboard/trainings/${selectedTraining.id}`}>View Full Details</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Summary Card */}
      <Card className="absolute right-4 top-4 w-64 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Programs:</span>
            <span className="font-semibold">{trainings.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ongoing:</span>
            <span className="font-semibold text-green-600">
              {trainings.filter((t) => t.status === "ongoing").length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Planned:</span>
            <span className="font-semibold text-blue-600">
              {trainings.filter((t) => t.status === "planned").length}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Bhuvan Maps Script */}
      <Script
        src="https://bhuvan-api1.nrsc.gov.in/api/js/bhuvan-api.js"
        strategy="afterInteractive"
        onLoad={() => {
          setIsBhuvanReady(true)
        }}
      />
    </div>
  )
}