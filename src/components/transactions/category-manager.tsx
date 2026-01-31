"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Settings, Plus, Loader2, Trash2 } from "lucide-react"
import type { Category } from "@/lib/types"

interface CategoryManagerProps {
  categories: Category[]
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const router = useRouter()
  const supabase = createClient()

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("categories").insert({
      user_id: user.id,
      name: name.trim(),
      type,
    })

    setLoading(false)
    setName("")
    router.refresh()
  }

  const handleDeleteCategory = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id)
    router.refresh()
  }

  const incomeCategories = categories.filter((c) => c.type === "income")
  const expenseCategories = categories.filter((c) => c.type === "expense")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Kategori
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Kelola Kategori</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleAddCategory} className="space-y-4 pb-4 border-b">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="categoryName" className="sr-only">
                Nama Kategori
              </Label>
              <Input
                id="categoryName"
                placeholder="Nama kategori baru"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Select value={type} onValueChange={(v) => setType(v as "income" | "expense")}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Pemasukan</SelectItem>
                <SelectItem value="expense">Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" size="icon" disabled={loading || !name.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </form>

        <div className="space-y-4 max-h-64 overflow-y-auto">
          {expenseCategories.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Pengeluaran</h4>
              <div className="space-y-2">
                {expenseCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <span className="text-sm">{cat.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteCategory(cat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {incomeCategories.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Pemasukan</h4>
              <div className="space-y-2">
                {incomeCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <span className="text-sm">{cat.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteCategory(cat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {categories.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Belum ada kategori. Tambahkan kategori pertama Anda!
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
