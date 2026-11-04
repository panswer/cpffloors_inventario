import React from "react";
import Link from "next/link";

interface DashboardCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  href,
  icon,
  badge,
}) => {
  return (
    <Link
      href={href}
      className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-500/40"
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-zinc-800 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
            {icon}
          </div>
          {badge && (
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {badge}
            </span>
          )}
        </div>

        <h3 className="mt-5 text-lg font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
          {title}
        </h3>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>

      <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition group-hover:translate-x-1 dark:text-blue-400">
        <span>Acceder</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
};
