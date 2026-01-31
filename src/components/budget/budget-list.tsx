"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import type { Budget, Category } from "@/lib/types"

interface BudgetListProps {
  budgets: (Budget & { category: Category | null; spent: number })[]
}

export function BudgetList({ budgets }: BudgetListProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    await supabase.from("budgets").delete().eq("id", id)
    router.refresh()
  }

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ringkasan Budget Bulan Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Terpakai</p>
              <p className="text-2xl font-bold">
                {formatCurrency(totalSpent)} <span className="text-base font-normal text-muted-foreground">/ {formatCurrency(totalBudget)}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Sisa Budget</p>
              <p className={`text-xl font-semibold ${totalBudget - totalSpent >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(totalBudget - totalSpent)}
              </p>
            </div>
          </div>
          <Progress
            value={Math.min(overallPercentage, 100)}
            className="h-3"
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const percentage = budget.amount > 0 ? (budget.spent / Number(budget.amount)) * 100 : 0
          const isOverBudget = percentage > 100

          return (
            <Card key={budget.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{budget.name}</CardTitle>
                    {budget.category && (
                      <p className="text-sm text-muted-foreground">{budget.category.name}</p>
                    )}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Budget?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tindakan ini tidak dapat dibatalkan. Budget akan dihapus secara permanen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(budget.id)}>
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm mb-2">
                  <span className={isOverBudget ? "text-red-600 font-medium" : ""}>
                    {formatCurrency(budget.spent)}
                  </span>
                  <span className="text-muted-foreground">{formatCurrency(Number(budget.amount))}</span>
                </div>
                <Progress
                  value={Math.min(percentage, 100)}
                  className={`h-2 ${isOverBudget ? "[&>div]:bg-red-500" : ""}`}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {isOverBudget
                    ? `Melebihi budget ${formatCurrency(budget.spent - Number(budget.amount))}`
                    : `Sisa ${formatCurrency(Number(budget.amount) - budget.spent)}`}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {budgets.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            Belum ada budget. Tambahkan budget pertama Anda untuk mulai mengontrol pengeluaran!
          </CardContent>
        </Card>
      )}
    </div>
  )
}
