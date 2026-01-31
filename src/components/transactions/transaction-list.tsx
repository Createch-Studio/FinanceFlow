"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Search, Trash2 } from "lucide-react"
import type { Transaction, Category } from "@/lib/types"

interface TransactionListProps {
  transactions: (Transaction & { category: Category | null })[]
  categories: Category[]
}

export function TransactionList({ transactions, categories }: TransactionListProps) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const router = useRouter()
  const supabase = createClient()

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.name.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === "all" || t.type === typeFilter
    const matchesCategory = categoryFilter === "all" || t.category_id === categoryFilter
    return matchesSearch && matchesType && matchesCategory
  })

  const handleDelete = async (id: string) => {
    await supabase.from("transactions").delete().eq("id", id)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daftar Transaksi</CardTitle>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="income">Pemasukan</SelectItem>
              <SelectItem value="expense">Pengeluaran</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">
                    {transaction.description || transaction.category?.name || "Transaksi"}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatDate(transaction.date)}</span>
                    {transaction.category && (
                      <>
                        <span>•</span>
                        <span>{transaction.category.name}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Badge variant={transaction.type === "income" ? "default" : "destructive"} className="mb-1">
                      {transaction.type === "income" ? "Pemasukan" : "Pengeluaran"}
                    </Badge>
                    <p
                      className={`font-semibold ${
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(Number(transaction.amount))}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tindakan ini tidak dapat dibatalkan. Transaksi akan dihapus secara permanen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(transaction.id)}>
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {transactions.length === 0
              ? "Belum ada transaksi. Tambahkan transaksi pertama Anda!"
              : "Tidak ada transaksi yang cocok dengan filter."}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
