"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Plus, Loader2, AlertCircle, Wallet } from "lucide-react"
import type { Category, Asset } from "@/lib/types"

interface AddTransactionDialogProps {
  categories: Category[]
}

export function AddTransactionDialog({ categories }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<"income" | "expense">("expense")
  const [amount, setAmount] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [assetId, setAssetId] = useState("") // State baru untuk Asset
  const [assets, setAssets] = useState<Asset[]>([]) // State untuk daftar aset
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  
  const router = useRouter()
  const supabase = createClient()

  // Ambil daftar aset saat dialog dibuka
  useEffect(() => {
    async function fetchAssets() {
      const { data } = await supabase
        .from("assets")
        .select("*")
        .order("name", { ascending: true })
      if (data) setAssets(data)
    }
    if (open) fetchAssets()
  }, [open, supabase])

  const hasIncomeCategories = categories.some((c) => c.type === "income")
  const hasExpenseCategories = categories.some((c) => c.type === "expense")
  const hasAssets = assets.length > 0
  const canAddTransaction = hasIncomeCategories && hasExpenseCategories && hasAssets
  
  const filteredCategories = categories.filter((c) => c.type === type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!categoryId || !assetId) {
      alert("Silakan lengkapi kategori dan aset terlebih dahulu")
      return
    }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type,
      amount: parseFloat(amount),
      category_id: categoryId,
      asset_id: assetId, // Kirim asset_id ke database
      description: description || null,
      date,
    })

    if (error) {
      alert("Gagal menyimpan transaksi")
    } else {
      setOpen(false)
      resetForm()
      router.refresh()
    }
    setLoading(false)
  }

  const resetForm = () => {
    setType("expense")
    setAmount("")
    setCategoryId("")
    setAssetId("")
    setDescription("")
    setDate(new Date().toISOString().split("T")[0])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="inline-block"> 
          <Button disabled={!canAddTransaction}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Transaksi
          </Button>
          {!canAddTransaction && (
            <p className="text-[10px] text-destructive mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Lengkapi kategori & aset dulu
            </p>
          )}
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipe Transaksi */}
          <div className="space-y-2">
            <Label>Tipe Transaksi</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === "income" ? "default" : "outline"}
                className="flex-1"
                onClick={() => {
                  setType("income")
                  setCategoryId("")
                }}
              >
                Pemasukan
              </Button>
              <Button
                type="button"
                variant={type === "expense" ? "default" : "outline"}
                className="flex-1"
                onClick={() => {
                  setType("expense")
                  setCategoryId("")
                }}
              >
                Pengeluaran
              </Button>
            </div>
          </div>

          {/* Nominal */}
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah (Rp)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Pilih Aset (Wajib) */}
          <div className="space-y-2">
            <Label htmlFor="asset">Sumber Dana / Akun</Label>
            <Select value={assetId} onValueChange={setAssetId} required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih rekening/dompet" />
              </SelectTrigger>
              <SelectContent>
                {assets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    <div className="flex items-center gap-2">
                      <Wallet className="h-3 w-3 opacity-50" />
                      <span>{asset.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Kategori */}
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tanggal */}
          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Keterangan */}
          <div className="space-y-2">
            <Label htmlFor="description">Keterangan (Opsional)</Label>
            <Textarea
              id="description"
              placeholder="Masukkan keterangan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !categoryId || !assetId}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Simpan Transaksi"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}