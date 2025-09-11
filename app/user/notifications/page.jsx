"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AlertTriangle, MapPin, X } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

function severityStyle(sev) {
  const s = (sev || "").toLowerCase();
  if (s === "critical") return { badge: "bg-red-600 text-white", card: "border-red-300 bg-red-50" };
  if (s === "high") return { badge: "bg-orange-500 text-white", card: "border-orange-300 bg-orange-50" };
  if (s === "medium") return { badge: "bg-amber-500 text-white", card: "border-amber-300 bg-amber-50" };
  return { badge: "bg-emerald-600 text-white", card: "border-emerald-300 bg-emerald-50" };
}

export default function Page() {
  const { t } = useI18n();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/alerts', { cache: 'no-store' });
        const json = await res.json();
        if (!ignore) {
          setAlerts(Array.isArray(json.alerts) ? json.alerts : []);
          setLoading(false);
        }
      } catch (e) {
        if (!ignore) {
          setError('Failed to load alerts');
          setLoading(false);
        }
      }
    }
    load();
    const channel = supabase
      .channel('alerts-user-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => load())
      .subscribe();
    return () => { ignore = true; supabase.removeChannel(channel); };
  }, []);

  const dismiss = (id) => setAlerts(prev => prev.filter(a => a.id !== id));

  const grouped = useMemo(() => {
    const groups = { critical: [], high: [], medium: [], low: [], other: [] };
    for (const a of alerts) {
      const sev = (a.severity || '').toLowerCase();
      if (sev in groups) groups[sev].push(a); else groups.other.push(a);
    }
    return groups;
  }, [alerts]);

  const renderCard = (a) => {
    const styles = severityStyle(a.severity);
    return (
      <div key={a.id} className={`rounded-2xl border p-4 shadow-sm ${styles.card}`}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles.badge}`}>{String(a.severity || 'low').toUpperCase()}</span>
              {a.region && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-700">
                  <MapPin className="h-3.5 w-3.5" /> {a.region}
                </span>
              )}
              <span className="ml-auto text-[11px] text-gray-500">{a.created_at ? new Date(a.created_at).toLocaleString() : ''}</span>
            </div>
            <div className="mt-1">
              <div className="text-base font-semibold text-gray-900">{a.title}</div>
            </div>
          </div>
          <button onClick={() => dismiss(a.id)} className="p-1 rounded hover:bg-black/5">
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-surface p-4 pb-24">
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <h1 className="text-lg font-bold text-foreground">{t('user.notifications')}</h1>
          <p className="text-sm text-foreground/70">{t('user.alerts_tagline', { default: 'Stay informed about hazards in your area.' })}</p>
        </div>

        {loading && <p className="text-center text-foreground/70 text-sm">{t('common.loading', { default: 'Loading…' })}</p>}
        {!!error && <p className="text-center text-red-600 text-sm">{error}</p>}

        {!loading && alerts.length === 0 && (
          <p className="text-center text-foreground/70 text-sm">🎉 {t('user.no_active_alerts', { default: 'No active alerts.' })}</p>
        )}

        {grouped.critical.map(renderCard)}
        {grouped.high.map(renderCard)}
        {grouped.medium.map(renderCard)}
        {grouped.low.map(renderCard)}
        {grouped.other.map(renderCard)}
      </div>
    </main>
  );
}
