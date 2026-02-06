import { createClient } from "@/lib/supabase/server"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardCharts } from "@/components/finance/dashboard-charts"
import { RecentTransactions } from "@/components/finance/recent-transactions"
import { ArrowDownLeft, ArrowUpRight, Wallet, TrendingUp, PieChart } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default async function DashboardPage() {
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const [transactionsResult, assetsResult, budgetsResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .gte("date", startOfMonth)
      .lte("date", endOfMonth),
    supabase.from("assets").select("*"),
    supabase
      .from("budgets")
      .select("*, category:categories(*)")
      .order("created_at", { ascending: false }),
  ])

  const transactions = transactionsResult.data || []
  const assets = assetsResult.data || []
  const budgets = budgetsResult.data || []

  // Menghitung arus kas bulan ini
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const balance = totalIncome - totalExpense

  /**
   * PERBAIKAN LOGIKA:
   * Menghitung Kekayaan Bersih (Net Worth).
   * Nilai dengan tipe 'debt' akan mengurangi total.
   */
  const netWorth = assets.reduce((sum, a) => {
    if (a.type === 'debt') return sum - Number(a.value)
    return sum + Number(a.value)
  }, 0)

  // Menghitung ringkasan budget
  const budgetsWithSpent = budgets.map((budget) => {
    const spent = transactions
      .filter((t) => t.category_id === budget.category_id)
      .reduce((sum, t) => sum + Number(t.amount), 0)
    return { ...budget, spent }
  })

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0)
  const totalSpent = budgetsWithSpent.reduce((sum, b) => sum + b.spent, 0)
  const budgetPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Ringkasan keuangan dan kekayaan bersih Anda</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pemasukan Bulan Ini
            </CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pengeluaran Bulan Ini
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpense)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sisa Saldo (Arus Kas)
            </CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kekayaan Bersih
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netWorth < 0 ? "text-red-600" : ""}`}>
              {formatCurrency(netWorth)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCharts transactions={transactions} assets={assets} />
      </div>

      {/* Budget Summary Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg font-semibold">Ringkasan Budget Bulan Ini</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {budgets.length} kategori budget
            </p>
          </div>
          <PieChart className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Terpakai</p>
                <p className={`text-2xl font-bold ${budgetPercentage > 100 ? "text-red-600" : "text-primary"}`}>
                  {formatCurrency(totalSpent)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Penggunaan Budget</span>
                <span className={`font-medium ${budgetPercentage > 100 ? "text-red-600" : budgetPercentage > 80 ? "text-orange-600" : "text-green-600"}`}>
                  {budgetPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={Math.min(budgetPercentage, 100)} 
                className="h-2"
              />
              {budgetPercentage > 100 && (
                <p className="text-xs text-red-600 font-medium">
                  ⚠️ Budget terlampaui sebesar {formatCurrency(totalSpent - totalBudget)}
                </p>
              )}
            </div>

            {budgetsWithSpent.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">Top 3 Kategori</p>
                <div className="space-y-3">
                  {budgetsWithSpent
                    .sort((a, b) => b.spent - a.spent)
                    .slice(0, 3)
                    .map((budget) => {
                      const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0
                      return (
                        <div key={budget.id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{budget.category?.name}</span>
                            <span className="text-muted-foreground">
                              {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                            </span>
                          </div>
                          <Progress 
                            value={Math.min(percentage, 100)} 
                            className="h-1.5"
                          />
                        </div>
                      )
                    })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <RecentTransactions />
    </div>
  )
}