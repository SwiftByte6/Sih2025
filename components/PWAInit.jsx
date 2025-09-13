'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

function showLocalNotification(registration, title, options) {
  try {
    if (registration && registration.showNotification) {
      registration.showNotification(title, options)
    } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, options)
    }
  } catch (_) {
    // noop
  }
}

export default function PWAInit() {
  useEffect(() => {
    let swRegistration
    const isDev = (process.env.NODE_ENV !== 'production') || (typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname))
    // If installed from an expired Netlify deploy preview, migrate to the stable origin
    try {
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : ''
      const isNetlifyPreview = /--.+\.netlify\.app$/i.test(currentOrigin)
      const stableNetlify = process.env.NEXT_PUBLIC_STABLE_ORIGIN || ''
      if (isNetlifyPreview && stableNetlify) {
        // Redirect to stable domain and unregister any preview SW
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations?.().then((regs) => {
            regs?.forEach((r) => r.unregister().catch(() => {}))
          })
        }
        try { window.location.replace(stableNetlify) } catch (_) {}
      }
    } catch (_) {}
    async function registerSW() {
      if (!('serviceWorker' in navigator)) return
      // In development/localhost, unregister any existing SWs and skip registration to avoid 404 precache errors
      if (isDev) {
        try {
          const regs = await navigator.serviceWorker.getRegistrations()
          regs?.forEach(r => r.unregister().catch(() => {}))
        } catch (_) {}
        return
      }
      try {
        swRegistration = await navigator.serviceWorker.register('/sw.js')
        // Prime offline page cache once on registration
        try { await caches.open('static-offline').then(c => c.addAll(['/offline.html'])) } catch (_) {}
      } catch (_) {
        // ignore
      }
    }

    async function ensureNotificationPermission() {
      if (typeof window === 'undefined' || typeof Notification === 'undefined') return
      try {
        if (Notification.permission === 'default') {
          await Notification.requestPermission()
        }
      } catch (_) {
        // ignore
      }
    }

    function subscribeToAlerts() {
      try {
        const channel = supabase
          .channel('alerts-realtime')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload) => {
            const alert = payload?.new || {}
            const title = alert.title || 'New Alert'
            const bodyParts = [alert.severity ? `Severity: ${String(alert.severity).toUpperCase()}` : null, alert.region ? `Region: ${alert.region}` : null]
            const body = [bodyParts.filter(Boolean).join(' • '), alert.description].filter(Boolean).join('\n')
            const options = {
              body,
              icon: '/Logo.png',
              badge: '/Logo.png',
              data: { url: '/user/notifications' },
              tag: `alert-${alert.id || Math.random()}`,
            }
            showLocalNotification(swRegistration, title, options)
          })
          .subscribe()
        return () => { supabase.removeChannel(channel) }
      } catch (_) {
        return () => {}
      }
    }

    registerSW()
    ensureNotificationPermission()
    const unsubscribe = subscribeToAlerts()

    return () => { if (typeof unsubscribe === 'function') unsubscribe() }
  }, [])

  return null
}


