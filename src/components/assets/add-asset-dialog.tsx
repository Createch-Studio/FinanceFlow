"use client"

import { useState, useMemo } from "react"
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

/* ================= CONSTANT ================= */

const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: "spending_account", label: "Spending Account" },
  { value: "cash", label: "Simpanan (Tunai/Bank)" },
  { value: "investment", label: "Investasi" },
  { value: "crypto", label: "Crypto" },
  { value: "property", label: "Properti" },
  { value: "receivable", label: "Piutang" },
  { value: "debt", label: "Utang" },
  { value: "other", label: "Lainnya" },
]

const POPULAR_COINS = [
  { id: "none", name: "Saham", symbol: "Saham" },
  { id: "none", name: "Reksadana", symbol: "REKSADANA" },
  { id: "none", name: "Emas", symbol: "EMAS" },
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH" },
  { id: "binancecoin", name: "BNB", symbol: "BNB" },
  { id: "solana", name: "Solana", symbol: "SOL" },
  { id: "ripple", name: "XRP", symbol: "XRP" },
  { id: "polygon-ecosystem-token", name: "Polygon", symbol: "POL" },
  { id: "chainlink", name: "Chainlink", symbol: "LINK" },
  { id: "tether", name: "USDT", symbol: "USDT" },
  { id: "usd-coin", name: "USDC", symbol: "USDC" },
  { id: "aave", name: "Aave", symbol: "AAVE" },
  { id: "dai", name: "DAI", symbol: "DAI" },
  { id: "pax-gold", name: "PAX Gold", symbol: "PAXG" },
  { id: "tether-gold", name: "Tether Gold", symbol: "XAUT" },
  { id: "taiwan-semiconductor-manufacturing-ondo-tokenized-stock", name: "Taiwan Semiconductor Manufacturing (Ondo Tokenized Stock)", symbol: "TSMON" },
  { id: "alibaba-ondo-tokenized-stock", name: "Alibaba (Ondo Tokenized Stock)", symbol: "BABAON" },
  { id: "airbnb-ondo-tokenized-stock", name: "Airbnb (Ondo Tokenized Stock)", symbol: "ABNBON" },
  { id: "nvidia-ondo-tokenized-stock", name: "NVIDIA (Ondo Tokenized Stock)", symbol: "NVDAON" },
  { id: "amd-ondo-tokenized-stock", name: "AMD (Ondo Tokenized Stock)", symbol: "AMDON" },
  { id: "intel-ondo-tokenized-stock", name: "Intel (Ondo Tokenized Stock)", symbol: "INTCON" },
  { id: "amazon-ondo-tokenized-stock", name: "Amazon (Ondo Tokenized Stock)", symbol: "AMZNON" },
  { id: "apple-ondo-tokenized-stock", name: "Apple (Ondo Tokenized Stock)", symbol: "AAPLON" },
]

/* ================= COMPONENT ================= */

export function AddAssetDialog() {
  const router = useRouter()
  const supabase = createClient()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchingPrice, setFetchingPrice] = useState(false)

  const [type, setType] = useState<AssetType>("spending_account")
  const [isCryptoBased, setIsCryptoBased] = useState(false) // Toggle untuk Utang/Piutang Crypto
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [quantity, setQuantity] = useState("")
  const [buyPrice, setBuyPrice] = useState("")
  const [currentPrice, setCurrentPrice] = useState("")
  const [coinId, setCoinId] = useState("")
  const [manualValue, setManualValue] = useState("")

  const isCrypto = type === "crypto"
  const isInvestment = type === "investment"
  const isDebt = type === "debt"
  const isReceivable = type === "receivable"
  
  // Logic: Apakah form harus menampilkan input Qty & Coin?
  const showCryptoFields = isCrypto || isInvestment || ( (isDebt || isReceivable) && isCryptoBased );

  /* ================= DERIVED ================= */

  const qty = Number(quantity) || 0
  const buy = Number(buyPrice) || 0
  const current = Number(currentPrice) || 0

  const initialValue = useMemo(() => {
    if (!qty || !buy) return 0
    return Math.round(qty * buy)
  }, [qty, buy])

  const currentValue = useMemo(() => {
    if (showCryptoFields) {
      if (!qty || !current) return 0
      return Math.round(qty * current)
    }
    return Math.abs(Number(manualValue) || 0)
  }, [qty, current, manualValue, showCryptoFields])

  const profitLoss = currentValue - initialValue

  /* ================= HANDLERS ================= */

  const handleCoinSelect = (id: string) => {
    setCoinId(id)
    const coin = POPULAR_COINS.find(c => c.id === id)
    if (coin) {
        const prefix = isDebt ? "Pinjaman" : isReceivable ? "Piutang" : "";
        setName(`${prefix} ${coin.name} (${coin.symbol})`.trim())
    }
  }

  const fetchCryptoPrice = async () => {
    if (!coinId) return
    setFetchingPrice(true)
    try {
      const res = await fetch(`/api/crypto/price?coinId=${coinId}`)
      const data = await res.json()
      const price = (data.price ?? data.prices?.[coinId]) as number | undefined
      if (price) setCurrentPrice(String(price))
    } catch {
      alert("Gagal mengambil harga")
    } finally {
      setFetchingPrice(false)
    }
  }

  const resetForm = () => {
    setType("spending_account")
    setIsCryptoBased(false)
    setName("")
    setDescription("")
    setQuantity("")
    setBuyPrice("")
    setCurrentPrice("")
    setManualValue("")
    setCoinId("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) throw new Error("Session expired")

      const { error: insertError } = await supabase.from("assets").insert({
        user_id: authData.user.id,
        name,
        type,
        quantity: showCryptoFields ? qty : null,
        buy_price: buy || null,
        current_price: current || null,
        value: currentValue,
        coin_id: showCryptoFields ? coinId : null,
        description: description || null,
        currency: "IDR",
      })

      if (insertError) throw insertError

      setOpen(false)
      resetForm()
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan data"
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  /* ================= UI ================= */

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Tambah Data
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah {isDebt ? "Kewajiban" : "Aset"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Kategori</Label>
            <Select value={type} onValueChange={v => {
                setType(v as AssetType);
                if (v !== "debt" && v !== "receivable") setIsCryptoBased(false);
            }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ASSET_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Toggle Khusus Utang/Piutang Crypto */}
          {(isDebt || isReceivable) && (
            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
              <input 
                type="checkbox" 
                id="crypto-toggle" 
                checked={isCryptoBased} 
                onChange={(e) => setIsCryptoBased(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="crypto-toggle" className="text-xs cursor-pointer">
                Ini adalah {isDebt ? "utang" : "piutang"} dalam bentuk Crypto (DeFi/Aave)
              </Label>
            </div>
          )}

          {/* CRYPTO FIELDS */}
          {showCryptoFields && (
            <>
              <div>
                <Label>Pilih Koin</Label>
                <Select value={coinId} onValueChange={handleCoinSelect}>
                  <SelectTrigger><SelectValue placeholder="Pilih koin" /></SelectTrigger>
                  <SelectContent>
                    {POPULAR_COINS.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground">Qty Koin</Label>
                  <Input placeholder="0.00" type="number" step="any" value={quantity} onChange={e => setQuantity(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground">Harga Pinjam/Beli</Label>
                  <Input placeholder="0" type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-muted-foreground">Harga Koin Saat Ini</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="0"
                    type="number"
                    value={currentPrice}
                    onChange={e => setCurrentPrice(e.target.value)}
                  />
                  <Button type="button" size="icon" variant="outline" onClick={fetchCryptoPrice} disabled={fetchingPrice || !coinId}>
                    {fetchingPrice ? <Loader2 className="animate-spin h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {qty > 0 && (
                <div className="text-xs border rounded p-3 bg-muted/50 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nilai Awal:</span>
                    <span>Rp {initialValue.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1 mt-1">
                    <span>Nilai Sekarang:</span>
                    <span>Rp {currentValue.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="space-y-1">
            <Label>{isDebt ? "Nama Kreditur / Protokol" : "Nama Aset"}</Label>
            <Input placeholder={isDebt ? "Contoh: Aave V3 (Pinjaman)" : "Contoh: Tabungan BCA"} value={name} onChange={e => setName(e.target.value)} required />
          </div>

          {!showCryptoFields && (
            <div className="space-y-1">
              <Label>Total Nilai (Rp)</Label>
              <Input
                placeholder="0"
                type="number"
                value={manualValue}
                onChange={e => setManualValue(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <Label>Keterangan</Label>
            <Textarea placeholder="Catatan tambahan..." value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>

          <Button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Simpan Data"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}