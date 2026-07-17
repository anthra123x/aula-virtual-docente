'use client'

import { useState, useRef, useEffect } from 'react'
import { chatWithAgent } from '@/modules/ai/agent.actions'
import { Button } from '@/components/ui/button'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

function formatMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: React.ReactNode[] = []
  let inList = false

  function flushList(key: string | number) {
    if (listItems.length > 0) {
      elements.push(<ul key={key} className="list-disc pl-4 my-1 space-y-0.5">{listItems}</ul>)
      listItems = []
    }
    inList = false
  }

  lines.forEach((line, i) => {
    if (line.startsWith('## ')) {
      flushList(`ul-${i}`)
      elements.push(<h3 key={`h3-${i}`} className="font-semibold text-sm mt-2 mb-1">{line.slice(3)}</h3>)
    } else if (line.startsWith('### ')) {
      flushList(`ul-${i}`)
      elements.push(<h4 key={`h4-${i}`} className="font-medium text-sm mt-1 mb-1">{line.slice(4)}</h4>)
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      inList = true
      listItems.push(<li key={`li-${i}`} className="text-sm">{formatInline(line.slice(2))}</li>)
    } else if (line.match(/^\d+\. /)) {
      flushList(`ul-${i}`)
      const match = line.match(/^\d+\. (.+)/)
      elements.push(<p key={`p-${i}`} className="text-sm ml-2 my-0.5">{match ? formatInline(match[1]) : formatInline(line)}</p>)
    } else if (line.trim() === '') {
      flushList(`ul-${i}`)
    } else {
      flushList(`ul-${i}`)
      elements.push(<p key={`p-${i}`} className="text-sm my-1">{formatInline(line)}</p>)
    }
  })
  flushList('ul-final')
  return <>{elements}</>
}

function formatInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const regex = /(\*\*(.+?)\*\*|`(.+?)`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let idx = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    if (match[2]) {
      parts.push(<strong key={`b-${idx}`}>{match[2]}</strong>)
    } else if (match[3]) {
      parts.push(<code key={`c-${idx}`} className="bg-muted px-1 rounded text-xs">{match[3]}</code>)
    }
    idx++
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  return parts.length ? parts : [text]
}

export function AgentChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy AulaBot, tu asistente docente. ¿En qué puedo ayudarte?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aula-agent-chat')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed)
          }
        } catch { }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 1) {
      localStorage.setItem('aula-agent-chat', JSON.stringify(messages))
    }
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const history = messages.slice(1)
      const result = await chatWithAgent(userMsg, history)
      setMessages(prev => [...prev, { role: 'assistant', content: result.response }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, ocurrió un error. Intenta de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-clay-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group animate-agent-pulse"
          aria-label="Abrir asistente"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 19.5Z" />
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M8 7h6" />
            <path d="M8 11h8" />
          </svg>
        </button>
      )}

      {open && (
        <div className="fixed bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-6rem)] bg-card border border-border rounded-2xl shadow-clay-lg flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 19.5Z" />
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium leading-tight">AulaBot</p>
                <p className="text-xs text-muted-foreground">Asistente docente</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cerrar asistente"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}
                >
                  {msg.role === 'assistant' ? formatMarkdown(msg.content) : <p className="text-sm">{msg.content}</p>}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground rounded-2xl rounded-bl-md px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-4 py-3 border-t border-border">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                disabled={loading}
                className="flex-1 h-10 px-3 py-2 rounded-xl bg-muted border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
              <Button
                size="icon"
                onClick={send}
                disabled={loading || !input.trim()}
                className="h-10 w-10 rounded-xl shrink-0"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
