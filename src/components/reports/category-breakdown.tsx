"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Transaction, Category } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface CategoryBreakdownProps {
  title: string
  transactions: Transaction[]
  categories: Category[]
}

const COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-purple-500",
  "bg-red-500",
  "bg-teal-500",
  "bg-pink-500",
  "bg-indigo-500",
]

export function CategoryBreakdown({ title, transactions, categories }: CategoryBreakdownProps) {
  const categoryTotals = transactions.reduce((acc, t) => {
    const categoryId = t.category_id || "uncategorized"
    acc[categoryId] = (acc[categoryId] || 0) + Number(t.amount)
    return acc
  }, {} as Record<string, number>)

  const totalAmount = Object.values(categoryTotals).reduce((sum, v) => sum + v, 0)

  const breakdown = Object.entries(categoryTotals)
    .map(([categoryId, amount], index) => {
      const category = categories.find((c) => c.id === categoryId)
      return {
        name: category?.name || "Tanpa Kategori",
        amount,
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
        color: COLORS[index % COLORS.length],
      }
    })
    .sort((a, b) => b.amount - a.amount)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {breakdown.length > 0 ? (
          <div className="space-y-4">
            {breakdown.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatCurrency(item.amount)}</span>
                    <span className="text-muted-foreground text-xs">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Belum ada data
          </div>
        )}
      </CardContent>
    </Card>
  )
}
