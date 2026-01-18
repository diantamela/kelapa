'use client';

import { useState, useEffect } from 'react';
import { requireAuthClient } from '@/lib/auth/client-utils';
import Link from 'next/link';

export default function MPDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await requireAuthClient(['pegawai_mp', 'staff_hr', 'manajer']);
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
          <h1 className="text-3xl font-bold text-gray-900">MP Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage production operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/pegawai-mp/production" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Production</h2>
            <p className="text-gray-600 mb-4">Record production activities</p>
            <div className="text-blue-600 font-medium">View &gt;</div>
          </Link>

          <Link href="/pegawai-mp/history" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">My History</h2>
            <p className="text-gray-600 mb-4">View your production history</p>
            <div className="text-blue-600 font-medium">View &gt;</div>
          </Link>

          <Link href="/pegawai-mp/salary-estimate" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Estimate Salary</h2>
            <p className="text-gray-600 mb-4">Calculate potential earnings</p>
            <div className="text-blue-600 font-medium">View &gt;</div>
          </Link>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Production Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-700">Manual Processing</h3>
              <p className="text-2xl font-bold text-gray-900">1,250 kg</p>
              <p className="text-sm text-gray-500">This week</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-700">Machine Processing</h3>
              <p className="text-2xl font-bold text-gray-900">3,400 kg</p>
              <p className="text-sm text-gray-500">This week</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-700">Shaler Processing</h3>
              <p className="text-2xl font-bold text-gray-900">850 kg</p>
              <p className="text-sm text-gray-500">This week</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-06-15</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Manual</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">150 kg</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Completed
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-06-14</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Machine</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">400 kg</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Completed
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-06-13</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Shaler</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">120 kg</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
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