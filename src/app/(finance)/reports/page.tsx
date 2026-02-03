import { createClient } from "@/lib/supabase/server"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MonthlyChart } from "@/components/reports/monthly-chart"
import { CategoryBreakdown } from "@/components/reports/category-breakdown"
import { TrendingUp, TrendingDown, Wallet } from "lucide-react"

export default async function ReportsPage() {
  const supabase = await createClient()
  
  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  // Fetch data transaksi, kategori, dan aset secara paralel
  const [transactionsResult, categoriesResult, assetsResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .gte("date", sixMonthsAgo.toISOString().split("T")[0])
      .order("date", { ascending: true }),
    supabase.from("categories").select("*"),
    supabase.from("assets").select("*"),
  ])

  const transactions = transactionsResult.data || []
  const categories = categoriesResult.data || []
  const assets = assetsResult.data || []

  // Hitung total pemasukan & pengeluaran dari transaksi (6 bulan terakhir)
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  /**
   * LOGIKA NET WORTH (KEKAYAAN BERSIH):
   * Aset (Cash, Investasi, Piutang, dll) bersifat POSITIF.
   * Utang (Debt) bersifat NEGATIF (mengurangi kekayaan).
   */
  const netWorth = assets.reduce((sum, a) => {
    if (a.type === 'debt') {
      return sum - Number(a.value)
    }
    return sum + Number(a.value)
  }, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Laporan</h1>
        <p className="text-muted-foreground">Analisis keuangan dan posisi kekayaan bersih Anda</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Card Pemasukan */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pemasukan (6 Bulan)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>

        {/* Card Pengeluaran */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pengeluaran (6 Bulan)
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpense)}
            </div>
          </CardContent>
        </Card>

        {/* Card Net Worth (Kekayaan Bersih) */}
        <Card className="border-2 border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kekayaan Bersih Saat Ini
            </CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netWorth < 0 ? 'text-red-600' : 'text-primary'}`}>
              {formatCurrency(netWorth)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">
              Aset - Kewajiban (Utang)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visualisasi Grafik Bulanan */}
      <MonthlyChart transactions={transactions} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Breakdown Pengeluaran */}
        <CategoryBreakdown
          title="Pengeluaran per Kategori"
          transactions={transactions.filter((t) => t.type === "expense")}
          categories={categories}
        />
        {/* Breakdown Pemasukan */}
        <CategoryBreakdown
          title="Pemasukan per Kategori"
          transactions={transactions.filter((t) => t.type === "income")}
          categories={categories}
        />
      </div>
    </div>
  )
}