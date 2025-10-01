"use client"

import { useEffect, useRef, useState } from "react"
import type { TrainingProgram } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin, Calendar, Users, X, Layers, Satellite, Map as MapIcon } from "lucide-react"

// OpenLayers imports
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import OSM from 'ol/source/OSM'
import XYZ from 'ol/source/XYZ'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { fromLonLat } from 'ol/proj'
import { Style, Circle, Fill, Stroke, Text } from 'ol/style'
import { Select } from 'ol/interaction'
import { click } from 'ol/events/condition'
import { defaults as defaultControls, FullScreen, ZoomToExtent } from 'ol/control'
import 'ol/ol.css'

interface MapViewProps {
  trainings: TrainingProgram[]
}

type BaseLayer = 'osm' | 'satellite' | 'terrain'

export function MapView({ trainings }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Map | null>(null)
  const vectorSourceRef = useRef<VectorSource | null>(null)
  const osmLayerRef = useRef<TileLayer<OSM> | null>(null)
  const satelliteLayerRef = useRef<TileLayer<XYZ> | null>(null)
  const terrainLayerRef = useRef<TileLayer<XYZ> | null>(null)
  
  const [selectedTraining, setSelectedTraining] = useState<TrainingProgram | null>(null)
  const [currentBaseLayer, setCurrentBaseLayer] = useState<BaseLayer>('osm')
  const [showLayerControls, setShowLayerControls] = useState(false)

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Create vector source for markers
    const vectorSource = new VectorSource()
    vectorSourceRef.current = vectorSource

    // Create base layers
    const osmLayer = new TileLayer({
      source: new OSM(),
      visible: true,
    })
    osmLayerRef.current = osmLayer

    const satelliteLayer = new TileLayer({
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attributions: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }),
      visible: false,
    })
    satelliteLayerRef.current = satelliteLayer

    const terrainLayer = new TileLayer({
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        attributions: 'Tiles © Esri — Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
      }),
      visible: false,
    })
    terrainLayerRef.current = terrainLayer

    // Create vector layer for markers
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    })

    // Get map configuration from environment or use defaults
    const centerLat = Number(process.env.NEXT_PUBLIC_DEFAULT_MAP_CENTER_LAT) || 20.5937
    const centerLng = Number(process.env.NEXT_PUBLIC_DEFAULT_MAP_CENTER_LNG) || 78.9629
    const defaultZoom = Number(process.env.NEXT_PUBLIC_DEFAULT_MAP_ZOOM) || 5

    // Create the map
    const map = new Map({
      target: mapRef.current,
      layers: [osmLayer, satelliteLayer, terrainLayer, vectorLayer],
      controls: defaultControls().extend([
        new FullScreen(),
        new ZoomToExtent({
          extent: [
            ...fromLonLat([68.0, 6.0]), // Southwest corner of India
            ...fromLonLat([97.0, 37.0])  // Northeast corner of India
          ]
        })
      ]),
      view: new View({
        center: fromLonLat([centerLng, centerLat]),
        zoom: defaultZoom,
        minZoom: 4,
        maxZoom: 18,
      }),
    })

    // Add click interaction for selecting features
    const selectInteraction = new Select({
      condition: click,
      layers: [vectorLayer],
      style: new Style({
        image: new Circle({
          radius: 10,
          fill: new Fill({
            color: 'rgba(255, 255, 0, 0.8)',
          }),
          stroke: new Stroke({
            color: '#ffffff',
            width: 3,
          }),
        }),
      }),
    })

    selectInteraction.on('select', (event) => {
      if (event.selected.length > 0) {
        const feature = event.selected[0]
        const trainingData = feature.get('trainingData') as TrainingProgram
        setSelectedTraining(trainingData)
        
        // Center map on selected feature with smooth animation
        const coordinates = (feature.getGeometry() as Point).getCoordinates()
        map.getView().animate({
          center: coordinates,
          zoom: Math.max(map.getView().getZoom() || 5, 10),
          duration: 1000,
        })
      } else {
        setSelectedTraining(null)
      }
    })

    map.addInteraction(selectInteraction)
    mapInstanceRef.current = map

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined)
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update markers when trainings data changes
  useEffect(() => {
    if (!vectorSourceRef.current) return

    // Clear existing features
    vectorSourceRef.current.clear()

    // Add new features
    const features = trainings
      .filter(training => training.latitude && training.longitude)
      .map(training => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([training.longitude!, training.latitude!])),
          trainingData: training,
        })

        // Set marker style based on status
        feature.setStyle(new Style({
          image: new Circle({
            radius: 10,
            fill: new Fill({
              color: getMarkerColor(training.status),
            }),
            stroke: new Stroke({
              color: '#ffffff',
              width: 2,
            }),
          }),
          text: new Text({
            text: training.actual_participants.toString(),
            fill: new Fill({
              color: '#ffffff',
            }),
            font: 'bold 12px Arial',
          }),
        }))

        return feature
      })

    if (features.length > 0) {
      vectorSourceRef.current.addFeatures(features)
      
      // Fit map to show all markers with padding
      if (mapInstanceRef.current && features.length > 1) {
        const extent = vectorSourceRef.current.getExtent()
        mapInstanceRef.current.getView().fit(extent, {
          padding: [80, 80, 80, 80],
          maxZoom: 12,
          duration: 1000,
        })
      }
    }
  }, [trainings])

  // Switch base layer
  const switchBaseLayer = (layerType: BaseLayer) => {
    if (!osmLayerRef.current || !satelliteLayerRef.current || !terrainLayerRef.current) return

    // Hide all layers
    osmLayerRef.current.setVisible(false)
    satelliteLayerRef.current.setVisible(false)
    terrainLayerRef.current.setVisible(false)

    // Show selected layer
    switch (layerType) {
      case 'osm':
        osmLayerRef.current.setVisible(true)
        break
      case 'satellite':
        satelliteLayerRef.current.setVisible(true)
        break
      case 'terrain':
        terrainLayerRef.current.setVisible(true)
        break
    }

    setCurrentBaseLayer(layerType)
    setShowLayerControls(false)
  }

  const getMarkerColor = (status: string) => {
    switch (status) {
      case "ongoing": return "rgba(34, 197, 94, 0.9)"
      case "planned": return "rgba(59, 130, 246, 0.9)"
      case "completed": return "rgba(107, 114, 128, 0.9)"
      case "cancelled": return "rgba(239, 68, 68, 0.9)"
      default: return "rgba(107, 114, 128, 0.9)"
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

  const getLayerIcon = (layerType: BaseLayer) => {
    switch (layerType) {
      case 'satellite': return <Satellite className="h-4 w-4" />
      case 'terrain': return <MapIcon className="h-4 w-4" />
      default: return <Layers className="h-4 w-4" />
    }
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />

      {/* Layer Control */}
      <div className="absolute left-4 bottom-4">
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowLayerControls(!showLayerControls)}
            className="shadow-lg"
          >
            {getLayerIcon(currentBaseLayer)}
            <span className="ml-2">Layers</span>
          </Button>
          
          {showLayerControls && (
            <Card className="absolute bottom-full mb-2 w-48 shadow-lg">
              <CardContent className="p-2">
                <div className="space-y-1">
                  <Button
                    variant={currentBaseLayer === 'osm' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => switchBaseLayer('osm')}
                    className="w-full justify-start"
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    OpenStreetMap
                  </Button>
                  <Button
                    variant={currentBaseLayer === 'satellite' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => switchBaseLayer('satellite')}
                    className="w-full justify-start"
                  >
                    <Satellite className="h-4 w-4 mr-2" />
                    Satellite
                  </Button>
                  <Button
                    variant={currentBaseLayer === 'terrain' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => switchBaseLayer('terrain')}
                    className="w-full justify-start"
                  >
                    <MapIcon className="h-4 w-4 mr-2" />
                    Terrain
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Legend Card */}
      <Card className="absolute left-4 top-4 w-64 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Map Legend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span>Ongoing Training</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span>Planned Training</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full bg-gray-500" />
            <span>Completed Training</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span>Cancelled Training</span>
          </div>
          <div className="text-xs text-gray-500 pt-2 border-t">
            Numbers on markers show participant count
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
            <div className="text-sm text-gray-600">
              <strong>Organizing Body:</strong> {selectedTraining.organizing_body}
            </div>
            {selectedTraining.budget && (
              <div className="text-sm text-gray-600">
                <strong>Budget:</strong> ₹{selectedTraining.budget.toLocaleString()}
              </div>
            )}
            <Button asChild className="w-full" size="sm">
              <Link href={`/dashboard/trainings/${selectedTraining.id}`}>View Full Details</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Stats Summary Card */}
      <Card className="absolute right-4 top-4 w-80 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Training Programs Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-2xl font-bold">{trainings.length}</div>
              <div className="text-xs text-gray-600">Total Programs</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">
                {trainings.filter((t) => t.status === "ongoing").length}
              </div>
              <div className="text-xs text-gray-600">Ongoing</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Planned:</span>
              <span className="font-semibold text-blue-600">
                {trainings.filter((t) => t.status === "planned").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed:</span>
              <span className="font-semibold text-gray-600">
                {trainings.filter((t) => t.status === "completed").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Participants:</span>
              <span className="font-semibold">
                {trainings.reduce((sum, t) => sum + t.actual_participants, 0)}
              </span>
            </div>
          </div>
          
          <div className="pt-2 border-t text-xs text-gray-500">
            Click on markers to view training details
          </div>
        </CardContent>
      </Card>
    </div>
  )
}