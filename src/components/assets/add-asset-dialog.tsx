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
import { Plus, Loader2 } from "lucide-react"
import type { AssetType } from "@/lib/types"

export function AddAssetDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<AssetType>("spending_account")
  
  // State Form
  const [name, setName] = useState("")
  const [value, setValue] = useState("")
  const [quantity, setQuantity] = useState("") // Wajib untuk Crypto
  const [coinId, setCoinId] = useState("")     // Wajib untuk Crypto
  const [description, setDescription] = useState("")

  const router = useRouter()
  const supabase = createClient()

  const resetForm = () => {
    setName("")
    setValue("")
    setQuantity("")
    setCoinId("")
    setDescription("")
    setType("spending_account")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User tidak ditemukan")

      // Logika: Jika Crypto, nilai total = quantity * current_price (opsional awal)
      // Tapi untuk pertama kali, kita simpan nominal yang diinput user
      const payload = {
        user_id: user.id,
        name,
        type,
        value: parseFloat(value) || 0,
        quantity: type === "crypto" ? parseFloat(quantity) : null,
        coin_id: type === "crypto" ? coinId : null,
        description: description || null,
        currency: "IDR",
      }

      const { error } = await supabase.from("assets").insert(payload)
      if (error) throw error

      setOpen(false)
      resetForm()
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menambah aset"
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Tambah Aset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Aset / Kewajiban</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Jenis Aset</Label>
            <Select value={type} onValueChange={(v: AssetType) => setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spending_account">Rekening / Dompet</SelectItem>
                <SelectItem value="cash">Uang Tunai</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="investment">Investasi</SelectItem>
                <SelectItem value="debt">Hutang (Kewajiban)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nama Aset</Label>
            <Input 
              placeholder={type === "crypto" ? "Contoh: Portofolio ETH" : "Contoh: Bank BCA"} 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          {type === "crypto" && (
            <>
              <div className="space-y-2">
                <Label>Pilih Koin (ID CoinGecko)</Label>
                <Select value={coinId} onValueChange={setCoinId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih koin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                    <SelectItem value="binancecoin">BNB</SelectItem>
                    <SelectItem value="solana">Solana (SOL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Jumlah Koin (Quantity)</Label>
                <Input 
                  type="number" 
                  step="any" 
                  placeholder="0.00" 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)} 
                  required 
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Total Nilai Saat Ini (Rp)</Label>
            <Input 
              type="number" 
              value={value} 
              onChange={(e) => setValue(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label>Keterangan (Opsional)</Label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Simpan Data"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}