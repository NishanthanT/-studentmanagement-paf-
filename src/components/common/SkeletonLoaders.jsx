import React from 'react';

export const SkeletonCard = () => (
    <div className="glass-panel-heavy p-8 rounded-[2rem] flex items-center gap-6 relative overflow-hidden">
        <div className="animate-shimmer absolute inset-0"></div>
        <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-white/5 shadow-sm relative z-10"></div>
        <div className="space-y-2 flex-1 relative z-10">
            <div className="h-2 w-16 bg-slate-200 dark:bg-white/5 rounded-full"></div>
            <div className="h-8 w-24 bg-slate-200 dark:bg-white/5 rounded-xl"></div>
        </div>
    </div>
);

export const SkeletonRow = () => (
    <tr className="border-b border-slate-100 dark:border-white/5">
        <td className="px-10 py-8 text-center">
            <div className="w-12 h-4 bg-slate-100 dark:bg-white/5 rounded-full mx-auto animate-pulse"></div>
        </td>
        <td className="px-10 py-8">
            <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse"></div>
                <div className="space-y-2">
                    <div className="h-3 w-32 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse"></div>
                    <div className="h-2 w-24 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse"></div>
                </div>
            </div>
        </td>
        <td className="px-10 py-8">
            <div className="space-y-2">
                <div className="h-3 w-24 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse"></div>
                <div className="h-5 w-20 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse"></div>
            </div>
        </td>
        <td className="px-10 py-8">
            <div className="space-y-3">
                <div className="h-3 w-16 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse"></div>
                <div className="h-6 w-24 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse"></div>
            </div>
        </td>
        <td className="px-10 py-8 text-right">
            <div className="flex justify-end gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-white/5 animate-pulse"></div>
                <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-white/5 animate-pulse"></div>
            </div>
        </td>
    </tr>
);

export const SkeletonChart = () => (
    <div className="h-64 w-full flex items-end gap-10 px-6 pb-2">
        <div className="flex-1 bg-slate-100 dark:bg-white/5 rounded-t-xl animate-pulse" style={{ height: '40%' }}></div>
        <div className="flex-1 bg-slate-100 dark:bg-white/5 rounded-t-xl animate-pulse" style={{ height: '70%' }}></div>
        <div className="flex-1 bg-slate-100 dark:bg-white/5 rounded-t-xl animate-pulse" style={{ height: '55%' }}></div>
    </div>
);
