'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { content } from '@/lib/content'

type Step = 'choose' | 'create' | 'join'

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [step, setStep] = useState<Step>('choose')
  const [familyName, setFamilyName] = useState('')
  const [mode, setMode] = useState<'SOLO' | 'COUPLE'>('COUPLE')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isSolo = mode === 'SOLO'
  const nameLabel = isSolo
    ? content.onboarding.create.soloName
    : content.onboarding.create.familyName
  const namePlaceholder = isSolo
    ? content.onboarding.create.soloNamePlaceholder
    : content.onboarding.create.familyNamePlaceholder

  useEffect(() => {
    if (status !== 'authenticated') return
    if (session?.user?.familyId) router.replace('/dashboard')
  }, [status, session?.user?.familyId, router])

  const createFamily = async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/family', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: familyName, mode }),
    })
    if (!res.ok) {
      setError((await res.json()).error)
      setLoading(false)
      return
    }
    await update()
    router.push('/dashboard')
  }

  const joinFamily = async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/family/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode: inviteCode.toUpperCase() }),
    })
    if (!res.ok) {
      setError((await res.json()).error)
      setLoading(false)
      return
    }
    await update()
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-sm border p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-3">
            <span className="text-primary-foreground text-xl font-bold">₹</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{content.onboarding.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{content.onboarding.subtitle}</p>
        </div>

        {step === 'choose' && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setStep('create')}
              className="border-2 border-dashed rounded-xl p-6 text-center hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="text-3xl mb-2">🏠</div>
              <div className="font-semibold text-foreground group-hover:text-primary">
                {content.onboarding.choose.createTitle}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {content.onboarding.choose.createSubtitle}
              </div>
            </button>
            <button
              onClick={() => setStep('join')}
              className="border-2 border-dashed rounded-xl p-6 text-center hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="text-3xl mb-2">🔗</div>
              <div className="font-semibold text-foreground group-hover:text-primary">
                {content.onboarding.choose.joinTitle}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {content.onboarding.choose.joinSubtitle}
              </div>
            </button>
          </div>
        )}

        {step === 'create' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{nameLabel}</label>
              <input
                value={familyName}
                onChange={e => setFamilyName(e.target.value)}
                placeholder={namePlaceholder}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {content.onboarding.create.budgetType}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['COUPLE', 'SOLO'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`border-2 rounded-lg p-3 text-sm font-medium transition-all ${
                      mode === m
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {m === 'COUPLE'
                      ? `👫 ${content.onboarding.create.coupleMode}`
                      : `🧑 ${content.onboarding.create.soloMode}`}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-primary">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('choose')}
                className="flex-1 border rounded-lg py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                {content.common.buttons.back}
              </button>
              <button
                onClick={createFamily}
                disabled={!familyName.trim() || loading}
                className="flex-1 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
              >
                {loading ? content.onboarding.create.submitLoading : content.onboarding.create.submitIdle}
              </button>
            </div>
          </div>
        )}

        {step === 'join' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {content.onboarding.join.inviteCode}
              </label>
              <input
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                placeholder={content.onboarding.join.inviteCodePlaceholder}
                className="w-full border rounded-lg px-3 py-2.5 text-sm font-sans tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            {error && <p className="text-sm text-primary">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('choose')}
                className="flex-1 border rounded-lg py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                {content.common.buttons.back}
              </button>
              <button
                onClick={joinFamily}
                disabled={!inviteCode.trim() || loading}
                className="flex-1 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
              >
                {loading ? content.onboarding.join.submitLoading : content.onboarding.join.submitIdle}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
