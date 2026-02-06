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
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH" },
  { id: "binancecoin", name: "BNB", symbol: "BNB" },
  { id: "solana", name: "Solana", symbol: "SOL" },
  { id: "ripple", name: "XRP", symbol: "XRP" },
  { id: "cardano", name: "Cardano", symbol: "ADA" },
  { id: "dogecoin", name: "Dogecoin", symbol: "DOGE" },
  { id: "tether", name: "USDT", symbol: "USDT" },
  { id: "usd-coin", name: "USDC", symbol: "USDC" },
  { id: "chainlink", name: "Chainlink", symbol: "LINK" },
]

interface EditAssetDialogProps {
  asset: Asset
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditAssetDialog({ asset, open, onOpenChange }: EditAssetDialogProps) {
  const [loading, setLoading] = useState(false)
  const [fetchingPrice, setFetchingPrice] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<AssetType>("cash")
  const [value, setValue] = useState("")
  const [description, setDescription] = useState("")
  const [quantity, setQuantity] = useState("")
  const [buyPrice, setBuyPrice] = useState("")
  const [currentPrice, setCurrentPrice] = useState("")
  const [coinId, setCoinId] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const isCrypto = type === "crypto"

  useEffect(() => {
    if (asset && open) {
      setName(asset.name)
      setType(asset.type)
      setValue(asset.value?.toString() || "")
      setDescription(asset.description || "")
      setQuantity(asset.quantity?.toString() || "")
      setBuyPrice(asset.buy_price?.toString() || "")
      setCurrentPrice(asset.current_price?.toString() || "")
      setCoinId(asset.coin_id || "")
    }
  }, [asset, open])

  const fetchCryptoPrice = async () => {
    if (!coinId) return
    setFetchingPrice(true)
    try {
      const response = await fetch(`/api/crypto/price?coinId=${coinId}`)
      const data = await response.json()
      const price = data.prices ? data.prices[coinId] : data.price
      
      if (price) {
        setCurrentPrice(price.toString())
        if (quantity) {
          const calculatedValue = parseFloat(quantity) * (price as number)
          setValue(Math.round(calculatedValue).toString())
        }
      }
    } catch {
      alert("Gagal mengambil harga terbaru. Silakan coba input manual.")
    } finally {
      setFetchingPrice(false)
    }
  }

  const handleCoinSelect = (selectedCoinId: string) => {
    setCoinId(selectedCoinId)
    const coin = POPULAR_COINS.find(c => c.id === selectedCoinId)
    if (coin) {
      setName(`${coin.name} (${coin.symbol})`)
    }
  }

  const handleQuantityChange = (newQuantity: string) => {
    setQuantity(newQuantity)
    if (currentPrice && newQuantity) {
      const calculatedValue = parseFloat(newQuantity) * parseFloat(currentPrice)
      setValue(Math.round(calculatedValue).toString())
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
        // PERBAIKAN: Menentukan tipe data secara eksplisit, bukan 'any'
        const updateData: {
          name: string;
          type: AssetType;
          value: number;
          description: string | null;
          updated_at: string;
          quantity: number | null;
          buy_price: number | null;
          current_price: number | null;
          coin_id: string | null;
        } = {
          name,
          type,
          value: parseFloat(value) || 0,
          description: description || null,
          updated_at: new Date().toISOString(),
          quantity: isCrypto && quantity ? parseFloat(quantity) : null,
          buy_price: isCrypto && buyPrice ? parseFloat(buyPrice) : null,
          current_price: isCrypto && currentPrice ? parseFloat(currentPrice) : null,
          coin_id: isCrypto ? coinId : null,
        }
    
        const { error: updateError } = await supabase.from("assets").update(updateData).eq("id", asset.id)
        if (updateError) throw updateError

        onOpenChange(false)
        router.refresh()
    } catch {
        alert("Gagal menyimpan perubahan")
    } finally {
        setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {type === "debt" ? "Kewajiban" : "Aset"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-type">Jenis Aset</Label>
            <Select value={type} onValueChange={(v) => setType(v as AssetType)}>
              <SelectTrigger id="edit-type">
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
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-coin">Pilih Koin</Label>
                <Select value={coinId} onValueChange={handleCoinSelect}>
                  <SelectTrigger id="edit-coin">
                    <SelectValue placeholder="Pilih cryptocurrency..." />
                  </SelectTrigger>
                  <SelectContent>
                    {POPULAR_COINS.map((coin) => (
                      <SelectItem key={coin.id} value={coin.id}>
                        {coin.name} ({coin.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-quantity">Jumlah (Qty)</Label>
                    <Input
                      id="edit-quantity"
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-buyPrice">Harga Beli (Rp)</Label>
                    <Input
                      id="edit-buyPrice"
                      type="number"
                      placeholder="0"
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(e.target.value)}
                    />
                  </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-currentPrice">Harga Saat Ini (Rp)</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-currentPrice"
                    type="number"
                    placeholder="0"
                    value={currentPrice}
                    onChange={(e) => {
                      setCurrentPrice(e.target.value)
                      if (quantity && e.target.value) {
                        const calculatedValue = parseFloat(quantity) * parseFloat(e.target.value)
                        setValue(Math.round(calculatedValue).toString())
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={fetchCryptoPrice}
                    disabled={!coinId || fetchingPrice}
                  >
                    {fetchingPrice ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-name">{type === "debt" ? "Nama Kreditur" : "Nama Aset"}</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-value">Total Nilai (Rp)</Label>
            <Input
              id="edit-value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              readOnly={isCrypto && !!quantity && !!currentPrice}
              className={isCrypto && !!quantity && !!currentPrice ? "bg-muted" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Keterangan (Opsional)</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}