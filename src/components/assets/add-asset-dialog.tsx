"use client"

import { useState } from "react"
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
import { Plus, Loader2 } from "lucide-react" // Hapus Wallet, Coins, Landmark, TrendingUp karena tidak dipakai
import type { AssetType } from "@/lib/types"

export function AddAssetDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<AssetType>("spending_account")
  const [name, setName] = useState("")
  const [value, setValue] = useState("")
  const [quantity, setQuantity] = useState("") 
  const [coinId, setCoinId] = useState("")     
  const [description, setDescription] = useState("")

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Silakan login kembali")

      const rawValue = parseFloat(value) || 0
      const finalValue = type === "debt" ? -Math.abs(rawValue) : rawValue

      const { error } = await supabase.from("assets").insert({
        user_id: user.id,
        name,
        type,
        value: finalValue,
        quantity: type === "crypto" ? parseFloat(quantity) : null,
        coin_id: type === "crypto" ? coinId : null,
        description: description || null,
        currency: "IDR"
      })

      if (error) throw error

      setOpen(false)
      setName("")
      setValue("")
      setQuantity("")
      router.refresh()
    } catch (err: unknown) { // Ganti 'any' menjadi 'unknown'
      const errorMessage = err instanceof Error ? err.message : "Gagal menyimpan aset"
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Tambah Aset / Utang
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Data Keuangan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={type} onValueChange={(v: AssetType) => setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spending_account">Spending (Dompet/Bank)</SelectItem>
                <SelectItem value="cash">Simpanan (Tabungan)</SelectItem>
                <SelectItem value="investment">Investasi (Saham/Reksadana)</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="property">Properti</SelectItem>
                <SelectItem value="receivable">Piutang (Orang Utang ke Kita)</SelectItem>
                <SelectItem value="debt">Utang (Kewajiban)</SelectItem>
                <SelectItem value="other">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nama Aset</Label>
            <Input 
              placeholder="Contoh: BCA, Wallet, Toko Crypto" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          {type === "crypto" && (
            <div className="p-3 bg-slate-50 rounded-lg space-y-3 border">
              <div className="space-y-2">
                <Label>Pilih Koin</Label>
                <Select value={coinId} onValueChange={setCoinId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih koin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                    <SelectItem value="solana">Solana (SOL)</SelectItem>
                    <SelectItem value="tether">Tether (USDT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Jumlah Koin (Quantity)</Label>
                <Input 
                  type="number" 
                  step="any" 
                  placeholder="0.0001" 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)} 
                  required 
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>{type === "debt" ? "Jumlah Utang (Rp)" : "Total Nilai / Saldo (Rp)"}</Label>
            <Input 
              type="number" 
              placeholder="Masukkan nominal" 
              value={value} 
              onChange={(e) => setValue(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label>Keterangan</Label>
            <Textarea 
              placeholder="Catatan tambahan..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Simpan Data"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}