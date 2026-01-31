import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Wallet, TrendingUp, PieChart, CheckSquare, ArrowRight } from "lucide-react"

// Landing page for FinanceFlow
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Wallet className="h-6 w-6" />
            <span className="text-xl font-bold">FinanceFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Masuk</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Daftar</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6">
              Kelola Keuangan Pribadi
              <span className="text-primary block mt-2">Dengan Mudah</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
              Lacak transaksi, atur budget, kelola aset, dan selesaikan tugas keuangan Anda dalam satu platform yang simpel dan powerful.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/auth/sign-up">
                  Mulai Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link href="/auth/login">Sudah Punya Akun</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Fitur Utama</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={<Wallet className="h-8 w-8" />}
                title="Transaksi"
                description="Catat semua pemasukan dan pengeluaran dengan kategori yang terorganisir"
              />
              <FeatureCard
                icon={<PieChart className="h-8 w-8" />}
                title="Budget"
                description="Atur dan pantau anggaran bulanan untuk setiap kategori pengeluaran"
              />
              <FeatureCard
                icon={<TrendingUp className="h-8 w-8" />}
                title="Aset"
                description="Kelola berbagai jenis aset: tunai, investasi, crypto, dan properti"
              />
              <FeatureCard
                icon={<CheckSquare className="h-8 w-8" />}
                title="Task Board"
                description="Kelola tugas-tugas keuangan dengan papan kanban yang intuitif"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2026 FinanceFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 bg-card rounded-lg border">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}
