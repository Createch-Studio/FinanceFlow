"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import type { Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface MonthlyChartProps {
  transactions: Transaction[]
}

export function MonthlyChart({ transactions }: MonthlyChartProps) {
  const monthlyData = transactions.reduce((acc, t) => {
    const month = t.date.substring(0, 7)
    if (!acc[month]) {
      acc[month] = { income: 0, expense: 0 }
    }
    if (t.type === "income") {
      acc[month].income += Number(t.amount)
    } else {
      acc[month].expense += Number(t.amount)
    }
    return acc
  }, {} as Record<string, { income: number; expense: number }>)

  const chartData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: new Date(month + "-01").toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense,
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tren Keuangan Bulanan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000000}M`} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="hsl(var(--chart-2))"
                  fill="url(#incomeGradient)"
                  strokeWidth={2}
                  name="Pemasukan"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="hsl(var(--chart-5))"
                  fill="url(#expenseGradient)"
                  strokeWidth={2}
                  name="Pengeluaran"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Belum ada data transaksi
            </div>
          )}
        </div>
        {chartData.length > 0 && (
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">Pemasukan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-muted-foreground">Pengeluaran</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
