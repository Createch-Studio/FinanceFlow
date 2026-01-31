"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import type { Category } from "@/lib/types"

interface AddBudgetDialogProps {
  categories: Category[]
}

export function AddBudgetDialog({ categories }: AddBudgetDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [period, setPeriod] = useState<"monthly" | "weekly" | "yearly">("monthly")
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]

    await supabase.from("budgets").insert({
      user_id: user.id,
      name,
      amount: parseFloat(amount),
      category_id: categoryId || null,
      period,
      start_date: startDate,
    })

    setLoading(false)
    setOpen(false)
    resetForm()
    router.refresh()
  }

  const resetForm = () => {
    setName("")
    setAmount("")
    setCategoryId("")
    setPeriod("monthly")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Budget Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Budget</Label>
            <Input
              id="name"
              placeholder="Contoh: Makan & Minum"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah Budget (Rp)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori (Opsional)</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    Belum ada kategori pengeluaran
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Periode</Label>
            <Select value={period} onValueChange={(v) => setPeriod(v as "monthly" | "weekly" | "yearly")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Mingguan</SelectItem>
                <SelectItem value="monthly">Bulanan</SelectItem>
                <SelectItem value="yearly">Tahunan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Budget"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
