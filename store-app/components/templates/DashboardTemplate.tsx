"use client";

import React, { useState } from "react";
import { Navbar, ProfileModal } from "../organisms";
import { useAuth } from "@/hooks/useAuth";

interface DashboardTemplateProps {
  user?: {
    id?: string;
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { changePassword, isChangingPassword } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar
        user={user}
        onLogout={onLogout}
        onOpenProfile={() => setIsProfileOpen(true)}
        isLoggingOut={isLoggingOut}
      />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onChangePassword={changePassword}
        isLoading={isChangingPassword}
      />
    </div>
  );
};
