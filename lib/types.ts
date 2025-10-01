export type UserRole =
  | "admin"
  | "ndma_official"
  | "sdma_official"
  | "ati_coordinator"
  | "ngo_coordinator"
  | "field_officer"

export type TrainingStatus = "planned" | "ongoing" | "completed" | "cancelled"

export type TrainingType = "workshop" | "drill" | "seminar" | "field_exercise" | "simulation" | "awareness_campaign"

export type DisasterType =
  | "earthquake"
  | "flood"
  | "cyclone"
  | "fire"
  | "landslide"
  | "drought"
  | "tsunami"
  | "industrial"
  | "other"

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  organization?: string
  state?: string
  district?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface TrainingProgram {
  id: string
  title: string
  description?: string
  training_type: TrainingType
  disaster_types: DisasterType[]
  status: TrainingStatus
  start_date: string
  end_date: string
  location_name: string
  latitude?: number
  longitude?: number
  state: string
  district: string
  organizing_body: string
  coordinator_id?: string
  target_participants: number
  actual_participants: number
  budget?: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Participant {
  id: string
  training_id: string
  name: string
  email?: string
  phone?: string
  organization?: string
  designation?: string
  attendance_status: boolean
  feedback_rating?: number
  feedback_comments?: string
  created_at: string
}

export interface TrainingUpdate {
  id: string
  training_id: string
  update_type: string
  message: string
  images?: string[]
  posted_by: string
  created_at: string
}

export interface TrainingMetric {
  id: string
  training_id: string
  metric_name: string
  metric_value: number
  recorded_at: string
}
