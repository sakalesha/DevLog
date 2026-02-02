
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, color = "blue" }) => {
  const colorMap: Record<string, string> = {
    blue: "bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 ring-1 ring-primary-200/50",
    green: "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 ring-1 ring-emerald-200/50",
    orange: "bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 ring-1 ring-amber-200/50",
    purple: "bg-gradient-to-br from-violet-50 to-violet-100 text-violet-600 ring-1 ring-violet-200/50"
  };

  return (
    <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/40 shadow-sm flex items-center gap-5 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 duration-300">
      <div className={`p-3.5 rounded-xl shadow-inner ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
        <div className="flex flex-col">
          <h3 className="text-2xl font-bold text-slate-800 font-display tracking-tight">{value}</h3>
          {trend && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-lg w-fit mt-1">{trend}</span>}
        </div>
      </div>
    </div>
  );
};
