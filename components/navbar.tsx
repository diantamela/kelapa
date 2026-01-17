'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth/middleware';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Get current user info
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Define menu items based on user role
  const getMenuItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'pegawai_rmp':
        return [
          { name: 'Dashboard', href: '/pegawai-rmp' },
          { name: 'Distributors', href: '/pegawai-rmp/distributors' },
          { name: 'Coconut Intakes', href: '/pegawai-rmp/intakes' },
          { name: 'Sorting Records', href: '/pegawai-rmp/sorting' },
        ];
      case 'pegawai_mp':
        return [
          { name: 'Dashboard', href: '/pegawai-mp' },
          { name: 'Production', href: '/pegawai-mp/production' },
          { name: 'My History', href: '/pegawai-mp/history' },
          { name: 'Estimate Salary', href: '/pegawai-mp/salary-estimate' },
        ];
      case 'staff_hr':
        return [
          { name: 'Dashboard', href: '/hr' },
          { name: 'Employees', href: '/hr/employees' },
          { name: 'Attendance', href: '/hr/attendance' },
          { name: 'Payroll', href: '/hr/payroll' },
          { name: 'Pay Periods', href: '/hr/pay-periods' },
        ];
      case 'manajer':
        return [
          { name: 'Dashboard', href: '/manajer' },
          { name: 'RMP Reports', href: '/manajer/rmp-reports' },
          { name: 'MP Reports', href: '/manajer/mp-reports' },
          { name: 'Attendance Reports', href: '/manajer/attendance-reports' },
          { name: 'Payroll Reports', href: '/manajer/payroll-reports' },
          { name: 'Summary Reports', href: '/manajer/summary-reports' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Kelapa
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === item.href
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <>
                <span className="mr-4 text-sm">Welcome, {user.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}