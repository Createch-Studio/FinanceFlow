import { createClient } from "@/lib/supabase/server"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AssetList } from "@/components/assets/asset-list"
import { AddAssetDialog } from "@/components/assets/add-asset-dialog"
import { Wallet, TrendingUp, Bitcoin, Home, MoreHorizontal } from "lucide-react"

const ASSET_CONFIG = {
  cash: { label: "Tunai", icon: Wallet, color: "text-blue-500" },
  investment: { label: "Investasi", icon: TrendingUp, color: "text-green-500" },
  crypto: { label: "Crypto", icon: Bitcoin, color: "text-orange-500" },
  property: { label: "Properti", icon: Home, color: "text-purple-500" },
  other: { label: "Lainnya", icon: MoreHorizontal, color: "text-gray-500" },
}

export default async function AssetsPage() {
  const supabase = await createClient()
  
  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .order("value", { ascending: false })

  const assetsList = assets || []

  const totalAssets = assetsList.reduce((sum, a) => sum + Number(a.value), 0)

  const assetsByType: Record<string, number> = assetsList.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + Number(asset.value)
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Aset</h1>
          <p className="text-muted-foreground">Kelola semua aset dan kekayaan Anda</p>
        </div>
        <AddAssetDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Total Kekayaan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-primary">{formatCurrency(totalAssets)}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Object.entries(ASSET_CONFIG).map(([type, config]) => {
          const value = assetsByType[type] || 0
          const Icon = config.icon
          return (
            <Card key={type}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                    <p className="font-semibold">{formatCurrency(value)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <AssetList assets={assetsList} />
    </div>
  )
}
