'use client';

import { useState, useEffect } from 'react';
import { requireAuthClient } from '@/lib/auth/client-utils';
import Link from 'next/link';

export default function ManagerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await requireAuthClient(['manajer']);
        setUser(userData);
      } catch (error) {
        console.error('Authentication error:', error);
        // Redirect to login will happen automatically via middleware
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null; // Redirect happens in requireAuth
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor operations and generate reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/manajer/rmp-reports" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">RMP Reports</h2>
            <p className="text-gray-600 mb-4">Raw material intake & sorting</p>
            <div className="text-blue-600 font-medium">View &gt;</div>
          </Link>

          <Link href="/manajer/mp-reports" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">MP Reports</h2>
            <p className="text-gray-600 mb-4">Production activities</p>
            <div className="text-blue-600 font-medium">View &gt;</div>
          </Link>

          <Link href="/manajer/attendance-reports" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Attendance Reports</h2>
            <p className="text-gray-600 mb-4">Employee attendance</p>
            <div className="text-blue-600 font-medium">View &gt;</div>
          </Link>

          <Link href="/manajer/payroll-reports" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Payroll Reports</h2>
            <p className="text-gray-600 mb-4">Compensation & benefits</p>
            <div className="text-blue-600 font-medium">View &gt;</div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/manajer/summary-reports" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Summary Reports</h2>
            <p className="text-gray-600 mb-4">Overall business metrics</p>
            <div className="text-blue-600 font-medium">View &gt;</div>
          </Link>

          <Link href="/manajer/variance-reports" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Variance Reports</h2>
            <p className="text-gray-600 mb-4">Control & efficiency metrics</p>
            <div className="text-blue-600 font-medium">View &gt;</div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Operations Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Intake (This Month)</span>
                <span className="font-semibold">12,500 kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Production (This Month)</span>
                <span className="font-semibold">10,200 kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Production Efficiency</span>
                <span className="font-semibold text-green-600">81.6%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Financial Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Payroll (This Month)</span>
                <span className="font-semibold">Rp 125,000,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg. Salary per Employee</span>
                <span className="font-semibold">Rp 2,976,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Overtime Cost</span>
                <span className="font-semibold">Rp 8,500,000</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Employee Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Employees</span>
                <span className="font-semibold">42</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Daily Workers</span>
                <span className="font-semibold">28</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Contract Workers</span>
                <span className="font-semibold">14</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}