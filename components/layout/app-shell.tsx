"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Users,
  Vote,
  MessageSquare,
  Settings,
  User,
  CheckCircle,
  LogOut,
  Calendar,
  DollarSign,
  FileText,
  UserCheck,
  Building2,
  UserPlus,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCurrentUser, hasPermission, logout } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { useFeatures } from "@/contexts/features-context";

const getAdminNavItems = (features: any) => [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  // { href: "/members", label: "Members", icon: Users },
  // ...(features.ministries
  //   ? [{ href: "/ministries", label: "Ministries", icon: Building2 }]
  //   : []),
  // ...(features.attendance
  //   ? [{ href: "/attendance", label: "Attendance", icon: UserPlus }]
  //   : []),
  ...(features.events
    ? [{ href: "/events", label: "Events", icon: Calendar }]
    : []),
  ...(features.voting
    ? [{ href: "/voting", label: "Voting", icon: Vote }]
    : []),
  ...(features.communications
    ? [
        {
          href: "/communications",
          label: "Communications",
          icon: MessageSquare,
        },
        // {
        //   href: "/test-bulk-sms",
        //   label: "Test Bulk SMS",
        //   icon: MessageSquare,
        // },
      ]
    : []),
  // ...(features.dataCollection
  //   ? [{ href: "/data-collection", label: "Data Collection", icon: FileText }]
  //   : []),
  // ...(features.financial
  //   ? [{ href: "/financial", label: "Financial", icon: DollarSign }]
  //   : []),
  // { href: "/feedback", label: "Feedback", icon: MessageCircle },
  // { href: "/profile", label: "Profile", icon: User },
  // { href: "/settings", label: "Settings", icon: Settings },
];

const getMemberNavItems = (features: any) => [
  // { href: "/profile", label: "My Profile", icon: User },
  // { href: "/eligibility", label: "My Eligibility", icon: CheckCircle },
  ...(features.events
    ? [{ href: "/events", label: "Events", icon: Calendar }]
    : []),
  ...(features.voting
    ? [{ href: "/votes", label: "Active Votes", icon: Vote }]
    : []),
  // ...(features.memberPortal
  //   ? [{ href: "/member-portal", label: "Family & Documents", icon: FileText }]
  //   : []),
  // { href: "/feedback", label: "Feedback", icon: MessageCircle },
  // { href: "/support", label: "Support", icon: HelpCircle },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = getCurrentUser();
  const { features } = useFeatures();

  const navItems = hasPermission(user.role, "ADMIN")
    ? getAdminNavItems(features)
    : getMemberNavItems(features);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };
  return (
    <div className='min-h-screen bg-background'>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-card shadow-md z-50 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className='flex items-center justify-between p-4 border-b'>
          <h1 className='text-xl font-bold text-foreground'>
            Community Church
          </h1>
          <Button
            variant='ghost'
            size='sm'
            className='lg:hidden'
            onClick={() => setSidebarOpen(false)}
          >
            <X className='h-5 w-5' />
          </Button>
        </div>

        <nav className='p-4'>
          <ul className='space-y-2'>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className='h-5 w-5' />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className='absolute bottom-4 left-4 right-4'>
          <div className='text-xs text-muted-foreground text-center'>
            {user.role === "ADMIN" ? "Administrator" : "Member"} View
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='lg:ml-64'>
        {/* Top bar */}
        <div className='bg-card shadow-sm border-b px-4 py-3 lg:px-6'>
          <div className='flex items-center justify-between'>
            <Button
              variant='ghost'
              size='sm'
              className='lg:hidden'
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className='h-5 w-5' />
            </Button>

            <div className='flex items-center justify-between flex-1'>
              <span className='text-sm text-muted-foreground'>
                Welcome, {user.role === "ADMIN" ? "Administrator" : "Member"}
              </span>
              <div className='flex items-center space-x-2'>
                <ThemeToggle />
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleLogout}
                  className='text-muted-foreground hover:text-foreground'
                >
                  <LogOut className='h-4 w-4 mr-2' />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className='p-4 lg:p-6'>{children}</main>
      </div>
    </div>
  );
}
