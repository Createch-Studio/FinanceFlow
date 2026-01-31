import { createClient } from "@/lib/supabase/server"
import { BudgetList } from "@/components/budget/budget-list"
import { AddBudgetDialog } from "@/components/budget/add-budget-dialog"

export default async function BudgetPage() {
  const supabase = await createClient()
  
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const [budgetsResult, categoriesResult, transactionsResult] = await Promise.all([
    supabase
      .from("budgets")
      .select("*, category:categories(*)")
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").eq("type", "expense").order("name"),
    supabase
      .from("transactions")
      .select("*")
      .eq("type", "expense")
      .gte("date", startOfMonth)
      .lte("date", endOfMonth),
  ])

  const budgets = budgetsResult.data || []
  const categories = categoriesResult.data || []
  const transactions = transactionsResult.data || []

  const budgetsWithSpent = budgets.map((budget) => {
    const spent = transactions
      .filter((t) => t.category_id === budget.category_id)
      .reduce((sum, t) => sum + Number(t.amount), 0)
    return { ...budget, spent }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Budget</h1>
          <p className="text-muted-foreground">Atur dan pantau anggaran pengeluaran bulanan</p>
        </div>
        <AddBudgetDialog categories={categories} />
      </div>

      <BudgetList budgets={budgetsWithSpent} />
    </div>
  )
}
