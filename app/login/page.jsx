"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState("")

  async function fetchRoleAndRedirect() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const role = profile?.role
    if (role === "admin") router.replace("/admin/dashboard")
    else if (role === "analyst") router.replace("/analyst/dashboard")
    else if (role === "official") router.replace("/official/dashboard")
    else router.replace("/user/dashboard")
  }

  async function ensureProfile(userId) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle()
    if (!existing) {
      await supabase.from("profiles").insert({ id: userId, role: "user" })
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) throw signUpError
        const userId = data.user?.id
        if (userId) await ensureProfile(userId)
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
      }
      await fetchRoleAndRedirect()
    } catch (err) {
      setError(err.message ?? "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!isMounted) return
      if (data.session) {
        await fetchRoleAndRedirect()
      }
    })
    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return
      if (session) {
        await fetchRoleAndRedirect()
      }
    })
    return () => {
      isMounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="w-full max-w-md bg-gray-900/70 backdrop-blur-lg rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          {isSignUp ? "Create an account" : "Welcome back"}
        </h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md disabled:opacity-50 transition"
          >
            {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
            {loading
              ? isSignUp
                ? "Creating account..."
                : "Signing in..."
              : isSignUp
              ? "Sign up"
              : "Sign in"}
          </button>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-6 w-full text-sm text-gray-400 hover:text-white transition"
        >
          {isSignUp ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </div>
    </main>
  )
}
