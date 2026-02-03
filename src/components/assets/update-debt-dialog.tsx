"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch" // Pastikan sudah install: npx shadcn@latest add switch
import { Loader2 } from "lucide-react"
import type { Asset, Category } from "@/lib/types"

interface UpdateDebtDialogProps {
  asset: Asset
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateDebtDialog({ asset, open, onOpenChange }: UpdateDebtDialogProps) {
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState("")
  const [paymentType, setPaymentType] = useState<string>("partial")
  const [recordTransaction, setRecordTransaction] = useState(true)
  const [categoryId, setCategoryId] = useState<string>("")
  const [categories, setCategories] = useState<Category[]>([])
  
  const router = useRouter()
  const supabase = createClient()
  const isDebt = asset.type === "debt"

  // Ambil kategori untuk pilihan transaksi
  useEffect(() => {
    async function fetchCategories() {
      const type = isDebt ? "expense" : "income"
      const { data } = await supabase
        .from("categories")
        .select("*")
        .eq("type", type)
        .order("name")
      if (data) setCategories(data)
    }
    if (open) fetchCategories()
  }, [open, isDebt, supabase])

  const handleUpdate = async () => {
    setLoading(true)
    const payAmount = paymentType === "full" ? Number(asset.value) : Number(amount)
    const newValue = Number(asset.value) - payAmount

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Update saldo Assets
      await supabase.from("assets").update({ 
        value: newValue <= 0 ? 0 : newValue, 
        updated_at: new Date().toISOString() 
      }).eq("id", asset.id)

      // 2. Catat Transaksi jika opsi diaktifkan
      if (recordTransaction) {
        await supabase.from("transactions").insert({
          user_id: user.id,
          type: isDebt ? "expense" : "income",
          amount: payAmount,
          category_id: categoryId || null,
          description: `${isDebt ? 'Bayar' : 'Terima'} ${asset.name} (${paymentType === 'full' ? 'Lunas' : 'Cicil'})`,
          date: new Date().toISOString().split('T')[0],
        })
      }

      onOpenChange(false)
      router.refresh()
    } catch (_error) {
      alert("Gagal memperbarui data.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isDebt ? "Update Utang" : "Update Piutang"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 py-4">
          <div className="bg-muted/50 p-4 rounded-xl border border-dashed text-center">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Sisa Saldo Saat Ini</p>
            <p className="text-xl font-bold">{formatCurrency(Number(asset.value))}</p>
          </div>
          
          <div className="space-y-2">
            <Label>Metode Update</Label>
            <Select value={paymentType} onValueChange={setPaymentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="partial">Bayar Sebagian (Cicil)</SelectItem>
                <SelectItem value="full">Pelunasan (Full)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentType === "partial" && (
            <div className="space-y-2">
              <Label htmlFor="amount">Nominal yang {isDebt ? "Dibayar" : "Diterima"}</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center justify-between p-3 border rounded-lg bg-accent/50">
            <div className="space-y-0.5">
              <Label className="text-sm">Catat sebagai Transaksi</Label>
              <p className="text-[10px] text-muted-foreground">Masukkan dalam laporan pengeluaran/pemasukan</p>
            </div>
            <Switch 
              checked={recordTransaction} 
              onCheckedChange={setRecordTransaction} 
            />
          </div>

          {recordTransaction && (
            <div className="space-y-2">
              <Label>Pilih Kategori Transaksi</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            className="w-full" 
            onClick={handleUpdate} 
            disabled={loading || (paymentType === 'partial' && !amount) || (recordTransaction && !categoryId)}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Konfirmasi Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}