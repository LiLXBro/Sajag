"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts"

interface AnalyticsChartsProps {
  trainingsByType: Record<string, number>
  disasterTypeCounts: Record<string, number>
  trainingsByState: Record<string, number>
  monthlyData: Record<string, number>
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"]

export function AnalyticsCharts({
  trainingsByType,
  disasterTypeCounts,
  trainingsByState,
  monthlyData,
}: AnalyticsChartsProps) {
  // Prepare data for charts
  const typeData = Object.entries(trainingsByType).map(([name, value]) => ({
    name: name.replace(/_/g, " "),
    value,
  }))

  const disasterData = Object.entries(disasterTypeCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))

  const stateData = Object.entries(trainingsByState)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([name, value]) => ({
      name,
      programs: value,
    }))

  const monthData = Object.entries(monthlyData).map(([name, value]) => ({
    month: name,
    programs: value,
  }))

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Training by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Training Programs by Type</CardTitle>
          <CardDescription>Distribution of training types</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Disaster Types Coverage */}
      <Card>
        <CardHeader>
          <CardTitle>Disaster Types Coverage</CardTitle>
          <CardDescription>Training programs by disaster type</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={disasterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* State-wise Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>State-wise Distribution</CardTitle>
          <CardDescription>Top 10 states by training programs</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stateData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="programs" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Training Trend</CardTitle>
          <CardDescription>Programs over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="programs" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
