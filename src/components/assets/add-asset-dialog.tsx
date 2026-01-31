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

const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: "cash", label: "Tunai" },
  { value: "investment", label: "Investasi" },
  { value: "crypto", label: "Crypto" },
  { value: "property", label: "Properti" },
  { value: "other", label: "Lainnya" },
]

export function AddAssetDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<AssetType>("cash")
  const [value, setValue] = useState("")
  const [description, setDescription] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("assets").insert({
      user_id: user.id,
      name,
      type,
      value: parseFloat(value),
      description: description || null,
    })

    setLoading(false)
    setOpen(false)
    resetForm()
    router.refresh()
  }

  const resetForm = () => {
    setName("")
    setType("cash")
    setValue("")
    setDescription("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Aset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Aset Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Aset</Label>
            <Input
              id="name"
              placeholder="Contoh: Tabungan BCA, Bitcoin, Rumah"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Jenis Aset</Label>
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

          <div className="space-y-2">
            <Label htmlFor="value">Nilai (Rp)</Label>
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
              placeholder="Masukkan keterangan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Aset"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
