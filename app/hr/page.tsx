'use client';

import { useState, useEffect } from 'react';
import { requireAuthClient } from '@/lib/auth/client-utils';
import Link from 'next/link';

export default function HRDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await requireAuthClient(['staff_hr', 'manajer']);
        setUser(userData);
      } catch (error) {
        console.error('Authentication error:', error);
        // Redirect to login will happen automatically via client utility
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
          <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage employees and payroll operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/hr/employees" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Employees</h2>
            <p className="text-gray-600 mb-4">Manage employee data</p>
            <div className="text-blue-600 font-medium">View &gt;</div>
          </Link>

          <Link href="/hr/attendance" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Attendance</h2>
            <p className="text-gray-600 mb-4">Track employee attendance</p>
            <div className="text-blue-600 font-medium">View &gt;</div>
          </Link>

          <Link href="/hr/payroll" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Payroll</h2>
            <p className="text-gray-600 mb-4">Process and manage payroll</p>
            <div className="text-blue-600 font-medium">View &gt;</div>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/hr/pay-periods" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Pay Periods</h2>
            <p className="text-gray-600 mb-4">Manage payroll periods</p>
            <div className="text-blue-600 font-medium">View &gt;</div>
          </Link>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Employees</span>
                <span className="font-semibold">42</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Present Today</span>
                <span className="font-semibold">38</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Payroll</span>
                <span className="font-semibold">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monthly Payroll</span>
                <span className="font-semibold">Rp 125,000,000</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Payroll Activities</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-06-15</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">June 2023</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Processing
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button className="text-green-600 hover:text-green-900">Finalize</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-05-15</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">May 2023</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Final
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900">View</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-04-15</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">April 2023</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Final
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900">View</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}