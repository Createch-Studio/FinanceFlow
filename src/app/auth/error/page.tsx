import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Wallet } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 text-primary">
              <Wallet className="h-8 w-8" />
              <span className="text-2xl font-bold">FinanceFlow</span>
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl">Terjadi Kesalahan</CardTitle>
          <CardDescription>
            Maaf, terjadi kesalahan saat memproses autentikasi. Silakan coba lagi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/login">Kembali ke Login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/sign-up">Daftar Akun Baru</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
