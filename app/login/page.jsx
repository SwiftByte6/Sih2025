// app/auth/page.jsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { supabase } from "../../lib/supabaseClient"

export default function AuthPage() {
  const router = useRouter() // ← fix router undefined
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  async function getUserProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
    if (error) throw error
    return data
  }

  function getRedirectPath(role) {
    switch (role) {
      case "admin":
        return "/admin/dashboard"
      case "driver":
        return "/driver/dashboard"
      default:
        return "/user/dashboard"
    }
  }

  async function clearProfileCache(userId) {
    // If you implement caching, clear it here
    // Placeholder: currently does nothing
  }

  async function ensureProfile(userId) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle()
    if (!existing) {
      await supabase.from("profiles").insert({ id: userId, role: "user" })
      clearProfileCache(userId)
    }
  }

  async function fetchRoleAndRedirect() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let profile = null
      try {
        profile = await getUserProfile(user.id)
      } catch {
        return router.replace("/user/dashboard")
      }

      const redirectPath = profile ? getRedirectPath(profile.role) : "/user/dashboard"
      router.replace(redirectPath)
    } catch (err) {
      console.error(err)
      router.replace("/user/dashboard")
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError("")
    setMessage("")
    setEmailError("")
    setPasswordError("")
    setLoading(true)

    try {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(email)) setEmailError("Enter a valid email address")
      if (password.length < 6) setPasswordError("Password must be at least 6 characters")
      if (!emailPattern.test(email) || password.length < 6) throw new Error("Please fix the form errors")

      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) throw signUpError
        if (data.user?.id) await ensureProfile(data.user.id)
        setMessage("Account created. Check your email to verify, then sign in.")
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        setMessage("Signed in! Redirecting...")
        await fetchRoleAndRedirect()
      }
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
      if (data.session) await fetchRoleAndRedirect()
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return
      if (event === "SIGNED_IN" && session) await fetchRoleAndRedirect()
    })

    return () => {
      isMounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  return (
    <main className="min-h-screen flex items-center md:justify-center bg-[#F4FEFF] md:px-4">
      <div className="w-full md:max-w-md h-[100vh] md:h-auto  shadow-lg md:rounded-2xl border border-gray-200 overflow-hidden">
        <div 
        onClick={()=>router.push('/')}
        className="p-4 text-xl h-[20vh] text-black cursor-pointer hover:underline md:hidden">
          &lt; Back
        </div>

        <div className="p-6 md:p-8 bg-[#E0F2FE] border border-gray-400 space-y-12 h-[80vh] md:h-auto rounded-t-[2rem] md:rounded-2xl">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-center text-gray-900">{isSignUp ? "Create Account" : "Welcome Back"}</h1>
            <p className="text-center text-gray-600 text-sm mb-6">{isSignUp ? "Enter your details to sign up" : "Enter your details"}</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-7" noValidate>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailError("")
                setError("")
              }}
              className="w-full px-4 py-3  rounded-2xl border border-gray-400 bg-[#93C5FD]/70 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            {emailError && <p className="text-red-500 text-xs">{emailError}</p>}

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setPasswordError("")
                setError("")
              }}
              className="w-full px-4 py-3 rounded-2xl border border-gray-400 bg-[#93C5FD]/70 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            {passwordError && <p className="text-red-500 text-xs">{passwordError}</p>}

            <div className="flex items-center justify-between text-xs text-gray-600">
              <label className="flex items-center space-x-1">
                <input type="checkbox" className="accent-blue-500" />
                <span>Remember me</span>
              </label>
              <button type="button" className="hover:underline">Forgot Password?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex text-xl border border-gray-300 items-center  justify-center px-4 py-3 rounded-full bg-white/70 hover:bg-blue-100 text-black tracking-widest font-semibold  disabled:opacity-50 transition"
            >
              {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              {loading ? (isSignUp ? "Creating..." : "Signing in...") : (isSignUp ? "Sign Up" : "Log In")}
            </button>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {message && <p className="text-green-600 text-sm text-center">{message}</p>}
          </form>

          <div className="flex items-center my-6">
            <hr className="flex-1 border-gray-300" />
            <span className="px-2 text-xs text-gray-500">Sign in with</span>
            <hr className="flex-1 border-gray-300" />
          </div>

          <div className="flex justify-center space-x-12">
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center rounded-full  hover:bg-gray-100"
              onClick={async () => {
                setLoading(true)
                setError("")
                const { error } = await supabase.auth.signInWithOAuth({ provider: "google" })
                if (error) setError(error.message)
                setLoading(false)
              }}
            >
              <img src="/google.png" alt="Google" className="w-15 h-10" />
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-black font-medium">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button onClick={() => setIsSignUp(false)} className="text-blue-600 font-medium hover:underline">Sign In</button>
              </>
            ) : (
              <>
                Don’t have an account?{" "}
                <button onClick={() => setIsSignUp(true)} className="text-blue-600 font-medium hover:underline">Sign Up</button>
              </>
            )}
          </p>
        </div>
      </div>
    </main>
  )
}
