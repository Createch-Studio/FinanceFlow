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
import { Plus, Loader2, RefreshCw } from "lucide-react"
import type { AssetType } from "@/lib/types"

// Update daftar tipe aset
const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: "cash", label: "Tunai" },
  { value: "investment", label: "Investasi" },
  { value: "crypto", label: "Crypto" },
  { value: "property", label: "Properti" },
  { value: "receivable", label: "Piutang" }, // Tambahan
  { value: "debt", label: "Utang" },       // Tambahan
  { value: "other", label: "Lainnya" },
]

const POPULAR_COINS = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH" },
  { id: "tether", name: "Tether", symbol: "USDT" },
  { id: "usd-coin", name: "USDC", symbol: "USDC" },
  { id: "pax-gold", name: "PAX Gold", symbol: "PAXG" },
  { id: "binancecoin", name: "BNB", symbol: "BNB" },
  { id: "solana", name: "Solana", symbol: "SOL" },
  { id: "ripple", name: "XRP", symbol: "XRP" },
  { id: "litecoin", name: "Litecoin", symbol: "LTC" },
  { id: "polygon-ecosystem-token", name: "POL (Polygon)", symbol: "POL" },
]

export function AddAssetDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchingPrice, setFetchingPrice] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<AssetType>("cash")
  const [value, setValue] = useState("")
  const [description, setDescription] = useState("")
  
  // Crypto specific fields
  const [quantity, setQuantity] = useState("")
  const [buyPrice, setBuyPrice] = useState("")
  const [currentPrice, setCurrentPrice] = useState("")
  const [coinId, setCoinId] = useState("")
  
  const router = useRouter()
  const supabase = createClient()

  const isCrypto = type === "crypto"
  const isDebtOrReceivable = type === "debt" || type === "receivable"

  const fetchCryptoPrice = async () => {
    if (!coinId) return
    setFetchingPrice(true)
    try {
      const response = await fetch(`/api/crypto/price?coinId=${coinId}`)
      const data = await response.json()
      if (data.price) {
        setCurrentPrice(data.price.toString())
        if (quantity) {
          const calculatedValue = parseFloat(quantity) * data.price
          setValue(calculatedValue.toString())
        }
      }
    } catch (error) {
      alert("Gagal mengambil harga terbaru.");
    }
    setFetchingPrice(false);
  }

  const handleCoinSelect = (selectedCoinId: string) => {
    setCoinId(selectedCoinId)
    const coin = POPULAR_COINS.find(c => c.id === selectedCoinId)
    if (coin) {
      setName(`${coin.name} (${coin.symbol})`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const assetData: Record<string, string | number | boolean | null> = {
    user_id: user.id,
    name,
    type,
    value: parseFloat(value) || 0,
    description: description || null,
    updated_at: new Date().toISOString(),
  }

    if (isCrypto) {
      assetData.quantity = quantity ? parseFloat(quantity) : null
      assetData.buy_price = buyPrice ? parseFloat(buyPrice) : null
      assetData.current_price = currentPrice ? parseFloat(currentPrice) : null
      assetData.coin_id = coinId || null
    }

    const { error } = await supabase.from("assets").insert(assetData)

    if (error) {
      alert("Error: " + error.message)
    } else {
      setOpen(false)
      resetForm()
      router.refresh()
    }
    setLoading(false)
  }

  const resetForm = () => {
    setName("")
    setType("cash")
    setValue("")
    setDescription("")
    setQuantity("")
    setBuyPrice("")
    setCurrentPrice("")
    setCoinId("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Aset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Aset / Kewajiban</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Jenis</Label>
            <Select value={type} onValueChange={(v) => setType(v as AssetType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSET_TYPES.map((assetType) => (
                  <SelectItem key={assetType.value} value={assetType.value}>
                    {assetType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isCrypto && (
            <div className="space-y-4 p-3 border rounded-lg bg-muted/30">
              <div className="space-y-2">
                <Label>Pilih Koin</Label>
                <Select value={coinId} onValueChange={handleCoinSelect}>
                  <SelectTrigger><SelectValue placeholder="Pilih koin..." /></SelectTrigger>
                  <SelectContent>
                    {POPULAR_COINS.map((coin) => (
                      <SelectItem key={coin.id} value={coin.id}>{coin.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Field quantity & refresh price tetap seperti sebelumnya */}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">
              {type === "debt" ? "Nama Utang (Pemberi Pinjaman)" : 
               type === "receivable" ? "Nama Piutang (Peminjam)" : "Nama Aset"}
            </Label>
            <Input
              id="name"
              placeholder={type === "debt" ? "Contoh: Pinjol, Bank BCA, Kartu Kredit" : "Contoh: Piutang Budi, Uang Teman"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">
              {type === "debt" ? "Sisa Utang (Rp)" : "Total Nilai (Rp)"}
            </Label>
            <Input
              id="value"
              type="number"
              placeholder="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Keterangan (Opsional)</Label>
            <Textarea
              id="description"
              placeholder="Masukkan catatan tambahan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Data"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}