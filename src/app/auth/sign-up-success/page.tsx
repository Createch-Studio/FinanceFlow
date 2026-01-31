import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Wallet } from "lucide-react"

export default function SignUpSuccessPage() {
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
            <div className="p-3 bg-primary/10 rounded-full">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Cek Email Anda</CardTitle>
          <CardDescription>
            Kami telah mengirim link konfirmasi ke email Anda. Silakan cek inbox dan klik link tersebut untuk mengaktifkan akun Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-6">
            Tidak menerima email? Cek folder spam atau coba daftar lagi.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">Kembali ke Halaman Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
