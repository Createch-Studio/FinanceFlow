"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import type { Transaction, Asset } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface DashboardChartsProps {
  transactions: Transaction[]
  assets: Asset[]
}

const ASSET_COLORS = {
  cash: "hsl(var(--chart-1))",
  investment: "hsl(var(--chart-2))",
  crypto: "hsl(var(--chart-3))",
  property: "hsl(var(--chart-4))",
  other: "hsl(var(--chart-5))",
}

const ASSET_LABELS: Record<string, string> = {
  cash: "Tunai",
  investment: "Investasi",
  crypto: "Crypto",
  property: "Properti",
  other: "Lainnya",
}

export function DashboardCharts({ transactions, assets }: DashboardChartsProps) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split("T")[0]
  })

  const dailyData = last7Days.map((date) => {
    const dayTransactions = transactions.filter((t) => t.date === date)
    const income = dayTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0)
    const expense = dayTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    return {
      date: new Date(date).toLocaleDateString("id-ID", { weekday: "short" }),
      income,
      expense,
    }
  })

  const assetsByType = Object.entries(
    assets.reduce((acc, asset) => {
      acc[asset.type] = (acc[asset.type] || 0) + Number(asset.value)
      return acc
    }, {} as Record<string, number>)
  ).map(([type, value]) => ({
    name: ASSET_LABELS[type] || type,
    value,
    color: ASSET_COLORS[type as keyof typeof ASSET_COLORS] || ASSET_COLORS.other,
  }))

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transaksi 7 Hari Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="income" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Pemasukan" />
                <Bar dataKey="expense" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} name="Pengeluaran" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribusi Aset</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {assetsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {assetsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Belum ada data aset
              </div>
            )}
          </div>
          {assetsByType.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {assetsByType.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
