'use client'
import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(({ title = 'Notification', description = '', variant = 'default', duration = 3000 } = {}) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, title, description, variant }])
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
    return id
  }, [remove])

  const value = useMemo(() => ({ toast, remove }), [toast, remove])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed z-[1000] bottom-4 right-4 flex flex-col gap-2 w-[92vw] max-w-sm">
        {toasts.map((t) => (
          <div key={t.id} className={`rounded-md border px-3 py-2 shadow bg-white ${t.variant==='success' ? 'border-emerald-300' : t.variant==='error' ? 'border-rose-300' : 'border-gray-200'}`}>
            <div className="text-sm font-semibold text-gray-900">{t.title}</div>
            {!!t.description && (
              <div className="text-xs text-gray-600 mt-0.5">{t.description}</div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}


