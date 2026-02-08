"use client"

import { useEffect, useMemo, useState } from "react"
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
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Loader2, RefreshCw } from "lucide-react"
import type { Asset, AssetType } from "@/lib/types"

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
  { id: "none1", name: "Saham", symbol: "Saham" },
  { id: "none2", name: "Reksadana", symbol: "REKSADANA" },
  { id: "none3", name: "Emas", symbol: "EMAS" },
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

interface EditAssetDialogProps {
  asset: Asset
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditAssetDialog({ asset, open, onOpenChange }: EditAssetDialogProps) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [fetchingPrice, setFetchingPrice] = useState(false)

  const [type, setType] = useState<AssetType>("cash")
  const [isCryptoBased, setIsCryptoBased] = useState(false) // State untuk mendeteksi mode crypto
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [quantity, setQuantity] = useState("")
  const [buyPrice, setBuyPrice] = useState("")
  const [currentPrice, setCurrentPrice] = useState("")
  const [manualValue, setManualValue] = useState("")
  const [coinId, setCoinId] = useState("")

  const isCrypto = type === "crypto"
  const isInvestment = type === "investment"
  const isDebt = type === "debt"
  const isReceivable = type === "receivable"

  // Logika penentuan apakah field koin harus muncul
  const showCryptoFields = isCrypto || isInvestment || ((isDebt || isReceivable) && isCryptoBased)

  /* ================= INIT STATE ================= */

  useEffect(() => {
    if (!open) return

    setType(asset.type)
    setName(asset.name)
    setDescription(asset.description ?? "")
    setQuantity(asset.quantity?.toString() ?? "")
    setBuyPrice(asset.buy_price?.toString() ?? "")
    setCurrentPrice(asset.current_price?.toString() ?? "")
    setManualValue(asset.value?.toString() ?? "")
    setCoinId(asset.coin_id ?? "")
    
    // Aktifkan mode crypto based jika data yang diedit punya coin_id (DeFi)
    setIsCryptoBased(!!asset.coin_id)
  }, [asset, open])

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
      const prefix = isDebt ? "Pinjaman" : isReceivable ? "Piutang" : ""
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
      alert("Gagal mengambil harga terbaru")
    } finally {
      setFetchingPrice(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        name,
        type,
        description: description || null,
        quantity: showCryptoFields ? qty : null,
        buy_price: showCryptoFields ? buy || null : null,
        current_price: showCryptoFields ? current || null : null,
        initial_value: showCryptoFields ? initialValue : null,
        value: currentValue,
        coin_id: showCryptoFields ? coinId : null,
        updated_at: new Date().toISOString(),
      }

      const { error: updateError } = await supabase
        .from("assets")
        .update(payload)
        .eq("id", asset.id)

      if (updateError) throw updateError

      onOpenChange(false)
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan perubahan"
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  /* ================= UI ================= */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {isDebt ? "Kewajiban" : "Aset"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Kategori</Label>
            <Select value={type} onValueChange={v => {
              setType(v as AssetType)
              if (v !== "debt" && v !== "receivable") setIsCryptoBased(false)
            }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ASSET_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(isDebt || isReceivable) && (
            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
              <input 
                type="checkbox" 
                id="edit-crypto-toggle" 
                checked={isCryptoBased} 
                onChange={(e) => setIsCryptoBased(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="edit-crypto-toggle" className="text-xs cursor-pointer">
                Ubah ke mode pinjaman Crypto (Aave/DeFi)
              </Label>
            </div>
          )}

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
                  <Label className="text-[10px] uppercase text-muted-foreground">Qty</Label>
                  <Input type="number" step="any" value={quantity} onChange={e => setQuantity(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground">Harga Modal</Label>
                  <Input type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-muted-foreground">Harga Saat Ini</Label>
                <div className="flex gap-2">
                  <Input type="number" value={currentPrice} onChange={e => setCurrentPrice(e.target.value)} />
                  <Button type="button" size="icon" variant="outline" onClick={fetchCryptoPrice} disabled={!coinId || fetchingPrice}>
                    {fetchingPrice ? <Loader2 className="animate-spin h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {qty > 0 && (
                <div className="text-xs border rounded p-3 bg-muted/50 space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Modal Awal:</span>
                    <span>Rp {initialValue.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Nilai Sekarang:</span>
                    <span className={profitLoss >= 0 ? "text-green-600" : "text-red-600"}>
                      Rp {currentValue.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="space-y-1">
            <Label>{isDebt ? "Nama Kreditur / Protokol" : "Nama Aset"}</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required />
          </div>

          {!showCryptoFields && (
            <div className="space-y-1">
              <Label>Total Nilai (Rp)</Label>
              <Input type="number" value={manualValue} onChange={e => setManualValue(e.target.value)} required />
            </div>
          )}

          <div className="space-y-1">
            <Label>Keterangan</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}