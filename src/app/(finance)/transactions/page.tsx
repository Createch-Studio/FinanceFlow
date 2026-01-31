import { createClient } from "@/lib/supabase/server"
import { TransactionList } from "@/components/transactions/transaction-list"
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog"
import { CategoryManager } from "@/components/transactions/category-manager"

export default async function TransactionsPage() {
  const supabase = await createClient()
  
  const [transactionsResult, categoriesResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("*, category:categories(*)")
      .order("date", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
  ])

  const transactions = transactionsResult.data || []
  const categories = categoriesResult.data || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transaksi</h1>
          <p className="text-muted-foreground">Kelola semua pemasukan dan pengeluaran</p>
        </div>
        <div className="flex gap-2">
          <CategoryManager categories={categories} />
          <AddTransactionDialog categories={categories} />
        </div>
      </div>

      <TransactionList transactions={transactions} categories={categories} />
    </div>
  )
}
