import React from "react";

export default function DashboardCard({ title, value, icon, description, iconColor }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{title}</span>
        {icon && (
          <span className={`material-symbols-outlined text-${iconColor}-600 text-[18px]`}>{icon}</span>
        )}
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
      {description && (
        <p className="mt-1 text-[11px] text-slate-500">{description}</p>
      )}
    </div>
  );
}
