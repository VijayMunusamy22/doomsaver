'use client'

import { useState } from 'react'
import { Copy, Check, Users, Crown, User } from 'lucide-react'
import { content } from '@/lib/content'

interface Member {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
}

interface Family {
  id: string
  name: string
  inviteCode: string
  mode: string
  members: Member[]
}

interface Props {
  family: Family
  currentUserId: string
}

export function FamilyPanel({ family, currentUserId }: Props) {
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    await navigator.clipboard.writeText(family.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Family card */}
      <div className="bg-card rounded-2xl border p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Users className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-foreground">{family.name}</h2>
          <span className="inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
            {family.mode === 'SOLO'
              ? `🧑 ${content.family.panel.soloMode}`
              : `👫 ${content.family.panel.coupleMode}`}
          </span>
        </div>
      </div>

      {/* Invite code — COUPLE only */}
      {family.mode === 'COUPLE' && (
        <div className="bg-card rounded-2xl border p-4 sm:p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-foreground">{content.family.panel.inviteTitle}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{content.family.panel.inviteDescription}</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-muted border rounded-xl px-4 sm:px-5 py-4">
            <code className="flex-1 font-sans font-bold text-lg sm:text-2xl text-primary tracking-[0.15em] sm:tracking-[0.25em] break-all">
              {family.inviteCode}
            </code>
            <button
              onClick={copyCode}
              className="flex items-center justify-center gap-1.5 bg-card border rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors w-full sm:w-auto"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-primary" />
                  {content.common.buttons.copied}
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  {content.common.buttons.copy}
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{content.family.panel.inviteFootnote}</p>
        </div>
      )}

      {/* Members list */}
      <div className="bg-card rounded-2xl border overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b">
          <h3 className="font-semibold text-foreground">
            {content.family.panel.membersTitle}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({family.members.length})
            </span>
          </h3>
        </div>
        <div className="divide-y">
          {family.members.map(member => (
            <div key={member.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {member.name?.[0]?.toUpperCase() ?? member.email[0].toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">
                  {member.name ?? content.family.panel.unnamedUser}
                </p>
                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
                {member.id === currentUserId && (
                  <span className="text-xs bg-secondary/30 text-secondary-foreground px-2 py-0.5 rounded-full font-medium">
                    {content.family.panel.you}
                  </span>
                )}
                {member.role === 'ADMIN' ? (
                  <div
                    title={content.family.panel.admin}
                    className="flex items-center gap-1 text-primary text-xs font-medium"
                  >
                    <Crown className="w-4 h-4" />
                    {content.family.panel.admin}
                  </div>
                ) : (
                  <div
                    title={content.family.panel.member}
                    className="flex items-center gap-1 text-muted-foreground text-xs"
                  >
                    <User className="w-4 h-4" />
                    {content.family.panel.member}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
