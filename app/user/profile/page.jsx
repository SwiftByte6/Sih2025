"use client";
import LogoutButton from '@/components/LogoutButton';
import React, { useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

function statusBadgeClasses(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'pending') return 'text-black bg-[#FFD691]/70';
    if (normalized === 'reviewing') return 'text-black bg-amber-200/80';
    if (normalized === 'resolved' || normalized === 'verified') return 'text-black bg-[#92FCBE]/70';
    return 'bg-gray-100 text-gray-800';
}

export default function ProfilePage() {
    const { t } = useI18n();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState(null);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [reports, setReports] = useState([]);

    useEffect(() => {
        let ignore = false;
        async function load() {
            try {
                setLoading(true);
                const { data: userRes } = await supabase.auth.getUser();
                const user = userRes?.user;
                if (!user) {
                    window.location.href = '/login';
                    return;
                }

                setEmail(user.email || '');

                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, role, created_at, updated_at')
                    .eq('id', user.id)
                    .single();

                if (profileData && !ignore) {
                    setProfile(profileData);
                    setFullName(profileData.full_name || '');
                    setEmail(profileData.email || user.email || '');
                }

                const { data: reportRows } = await supabase
                    .from('reports')
                    .select('id, title, status, created_at')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (!ignore) setReports(Array.isArray(reportRows) ? reportRows : []);
            } catch (e) {
                if (!ignore) setError(e?.message || 'Failed to load profile');
            } finally {
                if (!ignore) setLoading(false);
            }
        }
        load();
        return () => { ignore = true };
    }, []);

    const reportItems = useMemo(() => (reports || []).map(r => ({
        id: r.id,
        title: r.title || t('user.untitled', { default: 'Untitled' }),
        status: r.status || 'pending',
        date: r.created_at ? new Date(r.created_at).toLocaleString() : ''
    })), [reports, t]);

    async function saveProfile(e) {
        e.preventDefault();
        try {
            setSaving(true);
            setError('');
            const { data: userRes } = await supabase.auth.getUser();
            const user = userRes?.user;
            if (!user) {
                window.location.href = '/login';
                return;
            }

            const payload = { id: user.id, full_name: fullName || null, email: email || null, updated_at: new Date().toISOString() };
            const { error: upsertError, data: upserted } = await supabase
                .from('profiles')
                .upsert(payload)
                .select('id, full_name, email, role, created_at, updated_at')
                .single();
            if (upsertError) throw upsertError;
            setProfile(upserted);
        } catch (e) {
            setError(e?.message || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#F4FEFF] flex flex-col items-center p-4 pb-[10vh]">
            <div className='w-full flex items-center justify-between mt-4'>
                <h1 className='text-center font-medium text-2xl'>{t('user.profile')}</h1>
                <div className='md:hidden'>
                    <LanguageSwitcher className="border rounded-xl px-3 py-2 bg-white" />
                </div>
            </div>

            <div className='w-full flex flex-col gap-3 justify-center items-center mt-6'>
                <div className='w-44 h-44 bg-gray-300 rounded-full flex justify-center items-center text-5xl font-bold text-white'>
                    {(fullName || email || 'U').substring(0, 1).toUpperCase()}
                </div>
                <h1 className='text-2xl font-bold'>{fullName || email || t('user.unknown', { default: 'Unknown User' })}</h1>
                <div className='flex flex-col gap-1'>
                    <h2 className='text-gray-500 text-sm text-center'>{profile?.role || t('user.citizen_reporter', { default: 'Citizen Reporter' })}</h2>
                    <p className='text-gray-500 text-sm text-center'>{email}</p>
                </div>

                <form onSubmit={saveProfile} className='w-full max-w-md mt-4 space-y-3'>
                    <div className='flex flex-col gap-1'>
                        <label className='text-sm text-gray-700'>{t('user.full_name', { default: 'Full name' })}</label>
                        <input
                            className='w-full rounded-xl border px-3 py-2 bg-white'
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder={t('user.full_name_placeholder', { default: 'Your full name' })}
                        />
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label className='text-sm text-gray-700'>{t('common.email', { default: 'Email' })}</label>
                        <input
                            className='w-full rounded-xl border px-3 py-2 bg-white'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type='email'
                            placeholder='you@example.com'
                        />
                    </div>
                    {error && <p className='text-sm text-red-600'>{error}</p>}
                    <button
                        type='submit'
                        disabled={saving}
                        className='w-full px-4 border text-xl py-3 rounded-3xl bg-blue-200 font-bold disabled:opacity-60'
                    >
                        {saving ? t('common.saving', { default: 'Saving…' }) : t('user.save_profile', { default: 'Save Profile' })}
                    </button>
                </form>
            </div>

            <div className='w-full mt-10'>
                <h1 className='text-2xl font-bold mb-4'>{t('user.report_history', { default: 'Report History' })}</h1>
                <div className='flex flex-col gap-4'>
                    {loading ? (
                        <div className='w-full h-40 bg-gray-200 rounded-2xl flex justify-center items-center'>
                            {t('common.loading', { default: 'Loading…' })}
                        </div>
                    ) : reportItems.length === 0 ? (
                        <div className='w-full h-40 bg-gray-200 rounded-2xl flex justify-center items-center'>
                            {t('user.no_reports', { default: 'No Reports Yet' })}
                        </div>
                    ) : (
                        reportItems.map((report) => (
                            <div key={report.id} className='w-full bg-white/70 rounded-2xl p-4 flex flex-col gap-2 shadow-sm'>
                                <div className='flex justify-between items-center'>
                                    <h2 className='font-bold text-lg'>{report.title}</h2>
                                    <span className={`px-4 py-2 border rounded-xl text-md font-medium ${statusBadgeClasses(report.status)}`}>
                                        {String(report.status).toUpperCase()}
                                    </span>
                                </div>
                                <p className='text-gray-500 text-sm'>{report.date}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className='w-full mt-10'>
                <div className='flex items-center justify-between'>
                    <LogoutButton />
                    <Link href="/user/report" className='px-4 py-2 rounded-xl bg-brand/70 border border-border font-semibold'>
                        {t('user.report', { default: 'New Report' })}
                    </Link>
                </div>
            </div>
        </div>
    );
}
