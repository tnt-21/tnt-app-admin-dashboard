'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Database,
  ShoppingBag,
  CreditCard,
  Users,
  UserCog,
  Calendar,
  Wallet,
  PartyPopper,
  Headphones,
  FileText,
  BarChart3,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  title: string;
  href?: string;
  icon: any;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Master Data',
    icon: Database,
    children: [
      { title: 'Species', href: '/dashboard/master-data/species', icon: null },
      { title: 'Life Stages', href: '/dashboard/master-data/life-stages', icon: null },
      { title: 'Subscription Tiers', href: '/dashboard/master-data/subscription-tiers', icon: null },
      { title: 'Service Categories', href: '/dashboard/master-data/service-categories', icon: null },
      { title: 'Booking Statuses', href: '/dashboard/master-data/booking-statuses', icon: null },
      { title: 'Location Types', href: '/dashboard/master-data/location-types', icon: null },
      { title: 'User Roles', href: '/dashboard/master-data/user-roles', icon: null },
    ],
  },
  {
    title: 'Service Catalog',
    href: '/dashboard/services',
    icon: ShoppingBag,
  },
  {
    title: 'Subscriptions',
    icon: CreditCard,
    children: [
      { title: 'Tier Configuration', href: '/dashboard/subscriptions/config', icon: null },
      { title: 'Active Subscriptions', href: '/dashboard/subscriptions/active', icon: null },
      { title: 'Fair Usage', href: '/dashboard/subscriptions/fair-usage', icon: null },
    ],
  },
  {
    title: 'Users & Pets',
    icon: Users,
    children: [
      { title: 'Customers', href: '/dashboard/users', icon: null },
      { title: 'Global Pets', href: '/dashboard/pets/all', icon: null },
    ],
  },
  {
    title: 'Caregivers',
    href: '/dashboard/caregivers',
    icon: UserCog,
  },
  {
    title: 'Care Managers',
    href: '/dashboard/care-managers',
    icon: UserCog,
  },
  {
    title: 'Bookings',
    href: '/dashboard/bookings',
    icon: Calendar,
  },
  {
    title: 'Payments',
    icon: Wallet,
    children: [
      { title: 'Invoices', href: '/dashboard/payments/invoices', icon: null },
      { title: 'Transactions', href: '/dashboard/payments/transactions', icon: null },
      { title: 'Refunds', href: '/dashboard/payments/refunds', icon: null },
    ],
  },
  {
    title: 'Community',
    href: '/dashboard/community/events',
    icon: PartyPopper,
  },
  {
    title: 'Support',
    href: '/dashboard/support/tickets',
    icon: Headphones,
  },
  {
    title: 'Promotions',
    href: '/dashboard/promotions',
    icon: FileText,
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-blue-600">Tails & Tales</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.title}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100',
                      'text-gray-700'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        openMenus.includes(item.title) && 'rotate-180'
                      )}
                    />
                  </button>
                  {openMenus.includes(item.title) && (
                    <ul className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.title}>
                          <Link
                            href={child.href!}
                            className={cn(
                              'block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-100',
                              pathname === child.href
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-gray-600'
                            )}
                          >
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href!}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100',
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
