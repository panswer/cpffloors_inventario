"use client"

import React from "react";
import { Navbar } from "../organisms";

interface DashboardTemplateProps {
  user?: {
    name?: string;
    username: string;
    role: string;
  } | null;
  onLogout: () => void;
  isLoggingOut?: boolean;
  children: React.ReactNode;
}

export const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
  user,
  onLogout,
  isLoggingOut,
  children,
}) => {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar user={user} onLogout={onLogout} isLoggingOut={isLoggingOut} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};
