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
      ]
    : []),
  // { href: "/profile", label: "Profile", icon: User },
  // { href: "/settings", label: "Settings", icon: Settings },
  // { href: "/feedback", label: "Feedback", icon: MessageCircle },
  // { href: "/members", label: "Members", icon: Users },
  // ...(features.ministries
  //   ? [{ href: "/ministries", label: "Ministries", icon: Building2 }]
  //   : []),
  // ...(features.attendance
  //   ? [{ href: "/attendance", label: "Attendance", icon: UserPlus }]
  //   : []),
  // ...(features.dataCollection
  //   ? [{ href: "/data-collection", label: "Data Collection", icon: FileText }]
  //   : []),
  // ...(features.financial
  //   ? [{ href: "/financial", label: "Financial", icon: DollarSign }]
  //   : []),
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
  // Limit to 4-5 items for mobile bottom nav, rest go to "More" menu
  const maxMobileNavItems = 4;
  const mobileNavItems = navItems.slice(0, maxMobileNavItems);
  const moreNavItems = navItems.slice(maxMobileNavItems);

  return (
    <div className='min-h-screen bg-background'>
      {/* Desktop Sidebar */}
      <div className='hidden lg:block fixed top-0 left-0 h-full w-64 bg-card shadow-md z-50'>
        <div className='flex items-center justify-between p-4 border-b'>
          <h1 className='text-xl font-bold text-foreground'>
            Community Church
          </h1>
        </div>

        <nav
          className='p-4 overflow-y-auto'
          style={{ maxHeight: "calc(100vh - 120px)" }}
        >
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
      <div className='lg:ml-64 pb-16 lg:pb-0'>
        {/* Top bar */}
        <div className='bg-card shadow-sm border-b px-3 py-2 lg:px-6 lg:py-3'>
          <div className='flex items-center justify-between gap-2'>
            {/* Desktop: Show full title and welcome */}
            <div className='hidden lg:block'>
              <h1 className='text-lg font-bold text-foreground'>
                Community Church
              </h1>
            </div>

            {/* Mobile: Minimal branding */}
            <div className='lg:hidden flex-1 min-w-0'>
              <h1 className='text-sm font-semibold text-foreground truncate'>
                Community Church
              </h1>
            </div>

            <div className='flex items-center gap-1.5 lg:gap-3 lg:ml-auto flex-shrink-0'>
              {/* Welcome text - desktop only */}
              <span className='hidden lg:block text-sm text-muted-foreground font-light truncate'>
                Welcome,{" "}
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.role === "ADMIN"
                  ? "Administrator"
                  : "Member"}
              </span>
              
              <ThemeToggle />
              
              <Button
                variant='ghost'
                size='sm'
                onClick={handleLogout}
                className='text-muted-foreground hover:text-foreground h-8 w-8 lg:w-auto p-0 lg:px-3'
              >
                <LogOut className='h-4 w-4 lg:mr-2' />
                <span className='hidden lg:inline'>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className='p-4 lg:p-6'>{children}</main>
      </div>

      {/* Mobile Bottom Navigation (Instagram-style) */}
      <div className='lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-40'>
        <nav className='flex items-center justify-around px-2 py-2'>
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-0 flex-1",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon
                  className='h-6 w-6 mb-1'
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className='text-xs truncate max-w-full'>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More menu if there are additional items */}
          {moreNavItems.length > 0 && (
            <button
              onClick={() => setSidebarOpen(true)}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-0 flex-1",
                "text-muted-foreground"
              )}
            >
              <Menu className='h-6 w-6 mb-1' />
              <span className='text-xs'>More</span>
            </button>
          )}
        </nav>
      </div>

      {/* Mobile "More" Drawer */}
      {sidebarOpen && (
        <>
          <div
            className='lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40'
            onClick={() => setSidebarOpen(false)}
          />
          <div className='lg:hidden fixed bottom-0 left-0 right-0 bg-card rounded-t-xl shadow-lg z-50 max-h-[70vh] overflow-hidden'>
            <div className='flex items-center justify-between p-4 border-b'>
              <h2 className='text-lg font-semibold'>More Options</h2>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setSidebarOpen(false)}
              >
                <X className='h-5 w-5' />
              </Button>
            </div>
            <nav
              className='p-4 overflow-y-auto'
              style={{ maxHeight: "calc(70vh - 70px)" }}
            >
              <ul className='space-y-2'>
                {moreNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-3 rounded-lg text-sm transition-colors",
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
          </div>
        </>
      )}
    </div>
  );
}
