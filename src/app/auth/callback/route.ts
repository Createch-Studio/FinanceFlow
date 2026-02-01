import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  // Jika ada 'next', arahkan ke sana setelah login (default ke dashboard)
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    
    // Menukar code dengan session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Jika terjadi error, arahkan kembali ke halaman login dengan pesan error
  return NextResponse.redirect(`${origin}/auth/login?error=Tidak dapat melakukan autentikasi`)
}