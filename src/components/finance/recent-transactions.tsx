import { createClient } from "@/lib/supabase/server"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export async function RecentTransactions() {
  const supabase = await createClient()
  
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .order("date", { ascending: false })
    .limit(5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Transaksi Terbaru</CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link href="/transactions">
            Lihat Semua
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {transactions && transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">
                    {transaction.description || transaction.category?.name || "Transaksi"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(transaction.date)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={transaction.type === "income" ? "default" : "destructive"}>
                    {transaction.type === "income" ? "Pemasukan" : "Pengeluaran"}
                  </Badge>
                  <span
                    className={`font-semibold ${
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(Number(transaction.amount))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Belum ada transaksi. Mulai catat transaksi pertama Anda!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
