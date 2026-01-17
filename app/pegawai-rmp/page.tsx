'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function RMPDashboard() {
  const { user, loading } = useAuth(['pegawai_rmp', 'staff_hr', 'manajer']);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">RMP Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage raw material intake and sorting operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/pegawai-rmp/distributors" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Distributors</h2>
            <p className="text-gray-600 mb-4">Manage supplier information</p>
            <div className="text-blue-600 font-medium">View &gt;</div>
          </Link>

          <Link href="/pegawai-rmp/intakes" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Coconut Intakes</h2>
            <p className="text-gray-600 mb-4">Record incoming raw materials</p>
            <div className="text-blue-600 font-medium">View &gt;</div>
          </Link>

          <Link href="/pegawai-rmp/sorting" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Sorting Records</h2>
            <p className="text-gray-600 mb-4">Track sorting operations</p>
            <div className="text-blue-600 font-medium">View &gt;</div>
          </Link>
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
                    Activity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-06-15</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Coconut Intake</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1,200 kg from PT. Mitra Kelapa</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-06-14</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Sorting</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">800 kg good coconuts, 50 kg bad coconuts</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-06-13</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">New Distributor</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Added CV. Sumber Kelapa Abadi</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}