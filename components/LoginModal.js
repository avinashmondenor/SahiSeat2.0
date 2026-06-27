'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { X, Mail, Check, ArrowLeft, GraduationCap, ShieldCheck } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

export default function LoginModal() {
  const { loginModalOpen, setLoginModalOpen, signInWithGoogle, signInWithOtp, authError, setAuthError } = useAuth()
  const [role, setRole] = useState(null) // 'student' or 'senior'
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Sync context error with local state
  useEffect(() => {
    if (authError) {
      setError(authError)
      if (typeof setAuthError === 'function') {
        setAuthError(null)
      }
    }
  }, [authError, setAuthError])

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLoginModalOpen(false)
      }
    }
    if (loginModalOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [loginModalOpen, setLoginModalOpen])

  // Reset state when modal closes/opens
  useEffect(() => {
    if (loginModalOpen) {
      setRole(null)
      setEmail('')
      setSent(false)
      setError('')
      setLoading(false)
    }
  }, [loginModalOpen])

  if (!loginModalOpen) return null

  const handleGoogleLogin = async () => {
    setError('')
    try {
      localStorage.setItem('sahi_seat_login_role', role)
      await signInWithGoogle(role)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to initialize Google Login')
    }
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    setError('')
    setLoading(true)
    try {
      localStorage.setItem('sahi_seat_login_role', 'student')
      await signInWithOtp(email)
      setSent(true)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={() => setLoginModalOpen(false)}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-sm bg-[#13131A]/95 border border-border-custom rounded-2xl shadow-2xl p-8 overflow-hidden animate-in zoom-in-95 duration-200 text-left backdrop-blur-xl">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[80%] -translate-x-1/2 rounded-full bg-primary-purple/15 blur-3xl" />
        
        {/* Close Icon Button */}
        <button
          onClick={() => setLoginModalOpen(false)}
          className="absolute right-4 top-4 text-[#A1A1AA] hover:text-white transition cursor-pointer focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>

        {/* STEP 1: ROLE SELECTION */}
        {role === null && (
          <div className="space-y-8 py-4">
            <div className="text-center space-y-1.5">
              <h3 className="text-xl font-bold text-[#FAFAFA]">Welcome to SahiSeat</h3>
              <p className="text-xs text-secondary-text">Choose your role</p>
            </div>

            <div className="space-y-4">
              {/* Option A: Student */}
              <button
                onClick={() => setRole('student')}
                className="w-full h-12 rounded-xl border border-border-custom bg-[#09090B]/60 hover:bg-[#13131A] hover:border-primary-purple/50 transition duration-200 text-center font-bold text-sm text-[#FAFAFA] flex items-center justify-center gap-2 group cursor-pointer"
              >
                <GraduationCap className="h-4 w-4 text-[#A1A1AA] group-hover:text-primary-purple transition" />
                Student
              </button>

              {/* Option B: Verified Senior */}
              <button
                onClick={() => setRole('senior')}
                className="w-full h-12 rounded-xl border border-border-custom bg-[#09090B]/60 hover:bg-[#13131A] hover:border-accent-blue/50 transition duration-200 text-center font-bold text-sm text-[#FAFAFA] flex items-center justify-center gap-2 group cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4 text-[#A1A1AA] group-hover:text-accent-blue transition" />
                Verified Senior
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: LOGIN FLOWS */}
        {role !== null && !sent && (
          <div className="space-y-6">
            {/* Header with Back button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRole(null)}
                className="p-1.5 rounded-lg border border-border-custom hover:bg-[#13131A] text-secondary-text hover:text-white transition cursor-pointer"
                title="Go back"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
              <div className="text-left">
                <h3 className="text-sm font-bold text-[#FAFAFA]">
                  {role === 'student' ? 'Student Login' : 'Verified Senior Onboarding'}
                </h3>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            {/* Google Sign-In */}
            <div className="space-y-3">
              <Button
                onClick={handleGoogleLogin}
                className="w-full h-11 rounded-xl bg-[#FAFAFA] hover:bg-[#FAFAFA]/90 text-[#09090B] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>

            {/* Email OTP (Student Only) */}
            {role === 'student' ? (
              <div className="space-y-4">
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-border-custom/50"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-secondary-text font-mono uppercase">or email OTP</span>
                  <div className="flex-grow border-t border-border-custom/50"></div>
                </div>

                <form onSubmit={handleEmailLogin} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-[#A1A1AA]">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full h-11 px-4 bg-[#09090B] border border-border-custom rounded-xl text-xs text-primary-text placeholder:text-[#A1A1AA]/30 focus:border-[#7C3AED] transition"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-primary-purple to-accent-blue text-white text-xs font-bold shadow-md hover:shadow-primary-purple/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="h-4 w-4" />
                    {loading ? 'Sending Magic Link...' : 'Continue with Email'}
                  </Button>
                </form>
              </div>
            ) : (
              // Senior Signup Domain Reminder
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-secondary-text text-left leading-relaxed">
                💡 <strong>Important Note:</strong> To be approved quickly, we request you to sign up with your official college email ID.
              </div>
            )}
          </div>
        )}

        {/* STEP 3: OTP SENT STATE */}
        {sent && (
          <div className="text-center py-4 space-y-4 animate-in fade-in duration-150">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/35 text-emerald-500 flex items-center justify-center mx-auto mb-2 animate-bounce">
              <Check className="h-6 w-6" />
            </div>

            <h3 className="text-base font-bold text-[#FAFAFA]">Magic Link Sent!</h3>
            <p className="text-xs text-secondary-text leading-relaxed max-w-sm mx-auto">
              We have sent a secure magic link to <strong className="text-primary-text">{email}</strong>. Check your inbox and click the link to log in.
            </p>

            <Button
              onClick={() => {
                setSent(false)
                setLoginModalOpen(false)
              }}
              className="w-full mt-6 py-2.5 rounded-xl border border-border-custom bg-[#09090B] hover:bg-border-custom/50 text-xs text-[#FAFAFA] hover:text-white transition font-bold cursor-pointer"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
