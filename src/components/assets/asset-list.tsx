"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, Wallet, TrendingUp, Bitcoin, Home, MoreHorizontal } from "lucide-react"
import type { Asset } from "@/lib/types"

const ASSET_CONFIG = {
  cash: { label: "Tunai", icon: Wallet, color: "bg-blue-100 text-blue-600" },
  investment: { label: "Investasi", icon: TrendingUp, color: "bg-green-100 text-green-600" },
  crypto: { label: "Crypto", icon: Bitcoin, color: "bg-orange-100 text-orange-600" },
  property: { label: "Properti", icon: Home, color: "bg-purple-100 text-purple-600" },
  other: { label: "Lainnya", icon: MoreHorizontal, color: "bg-gray-100 text-gray-600" },
}

interface AssetListProps {
  assets: Asset[]
}

export function AssetList({ assets }: AssetListProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    await supabase.from("assets").delete().eq("id", id)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daftar Aset</CardTitle>
      </CardHeader>
      <CardContent>
        {assets.length > 0 ? (
          <div className="space-y-3">
            {assets.map((asset) => {
              const config = ASSET_CONFIG[asset.type as keyof typeof ASSET_CONFIG] || ASSET_CONFIG.other
              const Icon = config.icon
              return (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{asset.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">{config.label}</Badge>
                        {asset.description && (
                          <>
                            <span>•</span>
                            <span>{asset.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-lg">{formatCurrency(Number(asset.value))}</p>
                      <p className="text-xs text-muted-foreground">
                        Updated {formatDate(asset.updated_at)}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Aset?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Aset akan dihapus secara permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(asset.id)}>
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Belum ada aset. Tambahkan aset pertama Anda!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
