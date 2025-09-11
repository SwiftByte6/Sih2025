"use client";
import LogoutButton from '@/components/LogoutButton';
import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const ProfilePage = () => {
    const { t } = useI18n();
    const reports = [
        { title: t('hazards.pollution', { default: 'Pollution' }), date: "Sept 11 2025 - 9:20 AM", status: t('status.pending', { default: 'Pending' }) },
        { title: t('hazards.high_waves', { default: 'High Tides' }), date: "Sept 10 2025 - 4:35 PM", status: t('status.verified', { default: 'Verified' }) },
        { title: t('hazards.flood', { default: 'Flooding' }), date: "July 21 2025 - 1:11 PM", status: t('status.verified', { default: 'Verified' }) },
    ];

    const getStatusColor = (status) => {
        if (status === "Pending") return "text-black bg-[#FFD691]/70";
        if (status === "Verified") return "text-black bg-[#92FCBE]/70";
        return "bg-gray-100 text-gray-800";
    };

    return (
    <div className="min-h-screen bg-[#F4FEFF] flex flex-col items-center p-4 pb-[10vh]">
            {/* Profile Header */}
            <div className='w-full flex items-center justify-between mt-4'>
                <h1 className='text-center font-medium text-2xl'>{t('user.profile')}</h1>
                <div className='md:hidden'>
                    <LanguageSwitcher className="border rounded-xl px-3 py-2 bg-white" />
                </div>
            </div>
            <div className='w-full flex flex-col gap-3 justify-center items-center mt-6'>
                <div className='w-44 h-44 bg-gray-400 rounded-full flex justify-center items-center text-5xl font-bold text-white'>
                    S
                </div>
                <h1 className='text-2xl font-bold'>Shravan Vadepalli</h1>
                <div className='flex flex-col gap-1'>
                    <h2 className='text-gray-500 text-sm text-center'>{t('user.citizen_reporter', { default: 'Citizen Reporter' })}</h2>
                    <p className='text-gray-500 text-sm text-center'>Andheri, Mumbai</p>
                </div>
                <button className='w-[60%] px-4 border text-xl py-3 rounded-3xl bg-blue-200 font-bold'>
                    {t('user.edit_profile', { default: 'Edit Profile' })}
                </button>
            </div>

            {/* Report History */}
            <div className='w-full mt-10'>
                <h1 className='text-2xl font-bold mb-4'>{t('user.report_history', { default: 'Report History' })}</h1>
                <div className='flex flex-col gap-4'>
                    {reports.length === 0 ? (
                        <div className='w-full h-40 bg-gray-200 rounded-2xl flex justify-center items-center'>
                            {t('user.no_reports')}
                        </div>
                    ) : (
                        reports.map((report, index) => (
                            <div key={index} className='w-full bg-white/70 rounded-2xl p-4 flex flex-col gap-2 shadow-sm'>
                                <div className='flex justify-between items-center'>
                                    <h2 className='font-bold text-lg'>{report.title}</h2>
                                    <span className={`px-4 py-2 border  rounded-xl text-md font-medium ${getStatusColor(report.status)}`}>
                                        {report.status}
                                    </span>
                                </div>
                                <p className='text-gray-500 text-sm'>{report.date}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Logout Button */}
            <div className='w-full mt-10'>
                <LogoutButton />
            </div>
        </div>
    );
};

export default ProfilePage;
