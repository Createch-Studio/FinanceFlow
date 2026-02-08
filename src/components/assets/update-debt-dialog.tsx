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
import { Switch } from "@/components/ui/switch"
import { Loader2, Bitcoin } from "lucide-react"
import type { Asset, Category } from "@/lib/types"

interface UpdateDebtDialogProps {
  asset: Asset
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateDebtDialog({ asset, open, onOpenChange }: UpdateDebtDialogProps) {
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState("") // Input nominal IDR atau Qty koin
  const [updateMode, setUpdateMode] = useState<"idr" | "qty">("idr")
  const [paymentType, setPaymentType] = useState<string>("partial")
  const [recordTransaction, setRecordTransaction] = useState(true)
  const [categoryId, setCategoryId] = useState<string>("")
  const [categories, setCategories] = useState<Category[]>([])
  
  const router = useRouter()
  const supabase = createClient()
  
  const isDebt = asset.type === "debt"
  const isCryptoBased = !!asset.coin_id // Cek apakah ini utang Aave/Crypto

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
    if (open) {
      fetchCategories()
      // Reset state saat dialog dibuka
      setAmount("")
      setUpdateMode(isCryptoBased ? "qty" : "idr")
    }
  }, [open, isDebt, supabase, isCryptoBased])

  const handleUpdate = async () => {
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user session")

      const currentVal = Number(asset.value) || 0
      const currentQty = Number(asset.quantity) || 0
      const pricePerCoin = asset.current_price ? Number(asset.current_price) : 0

      let payAmountIDR = 0
      let newQty = currentQty
      let newValue = currentVal

      if (paymentType === "full") {
        payAmountIDR = currentVal
        newQty = 0
        newValue = 0
      } else {
        const inputNum = Number(amount)
        if (updateMode === "qty" && pricePerCoin > 0) {
          payAmountIDR = inputNum * pricePerCoin
          newQty = Math.max(0, currentQty - inputNum)
          newValue = newQty * pricePerCoin
        } else {
          payAmountIDR = inputNum
          newValue = Math.max(0, currentVal - inputNum)
          // Jika crypto-based tapi update via IDR, sesuaikan Qty-nya juga
          if (isCryptoBased && pricePerCoin > 0) {
            newQty = newValue / pricePerCoin
          }
        }
      }

      // 1. Update saldo Assets
      const { error: assetError } = await supabase
        .from("assets")
        .update({ 
          value: newValue,
          quantity: isCryptoBased ? newQty : null,
          updated_at: new Date().toISOString() 
        })
        .eq("id", asset.id)

      if (assetError) throw assetError

      // 2. Catat Transaksi jika opsi diaktifkan
      if (recordTransaction) {
        const { error: transError } = await supabase.from("transactions").insert({
          user_id: user.id,
          type: isDebt ? "expense" : "income",
          amount: payAmountIDR,
          category_id: categoryId || null,
          description: `${isDebt ? 'Bayar' : 'Terima'} ${asset.name} (${paymentType === 'full' ? 'Lunas' : 'Cicil'})`,
          date: new Date().toISOString().split('T')[0],
        })
        if (transError) throw transError
      }

      onOpenChange(false)
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui data"
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isDebt ? "Bayar Utang" : "Terima Piutang"}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-5 py-4">
          <div className="bg-muted/50 p-4 rounded-xl border border-dashed flex flex-col items-center justify-center">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Sisa Kewajiban</p>
            <p className="text-xl font-black text-primary">{formatCurrency(Number(asset.value))}</p>
            {isCryptoBased && asset.quantity && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground font-medium">
                <Bitcoin className="h-3 w-3" />
                {asset.quantity} {asset.name.split('(')[1]?.replace(')', '') || 'Units'}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs">Metode Pelunasan</Label>
            <Select value={paymentType} onValueChange={setPaymentType}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="partial">Bayar Sebagian (Cicil)</SelectItem>
                <SelectItem value="full">Pelunasan Penuh (Lunas)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentType === "partial" && (
            <div className="space-y-3 p-3 border rounded-lg bg-card shadow-sm">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Input Berdasarkan</Label>
                <div className="flex bg-muted p-0.5 rounded-md">
                  <button 
                    onClick={() => setUpdateMode("idr")}
                    className={`px-2 py-1 text-[10px] rounded ${updateMode === 'idr' ? 'bg-background shadow-sm' : ''}`}
                  >
                    Rupiah (IDR)
                  </button>
                  {isCryptoBased && (
                    <button 
                      onClick={() => setUpdateMode("qty")}
                      className={`px-2 py-1 text-[10px] rounded ${updateMode === 'qty' ? 'bg-background shadow-sm' : ''}`}
                    >
                      Koin (Qty)
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="relative">
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    className="pr-12"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase">
                    {updateMode === 'idr' ? 'IDR' : 'Units'}
                  </div>
                </div>
                {updateMode === "qty" && asset.current_price && (
                  <p className="text-[10px] text-muted-foreground italic">
                    Setara ± {formatCurrency(Number(amount) * Number(asset.current_price))}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3 border rounded-lg bg-accent/30">
            <div className="space-y-0.5">
              <Label className="text-sm">Catat Transaksi</Label>
              <p className="text-[10px] text-muted-foreground italic">Potong dari saldo cash/bank</p>
            </div>
            <Switch 
              checked={recordTransaction} 
              onCheckedChange={setRecordTransaction} 
            />
          </div>

          {recordTransaction && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
              <Label className="text-xs">Kategori {isDebt ? 'Pengeluaran' : 'Pemasukan'}</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="h-9">
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
            className="w-full bg-blue-600 hover:bg-blue-700" 
            onClick={handleUpdate} 
            disabled={loading || (paymentType === 'partial' && !amount) || (recordTransaction && !categoryId)}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Konfirmasi Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}