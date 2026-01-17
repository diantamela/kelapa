import Link from 'next/link';
import Navbar from '@/components/navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Kelapa - Coconut Factory Management System</h1>
          <p className="text-lg text-gray-600 mb-8">
            Integrated solution for managing raw material processing, production, attendance, and payroll
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">RMP Module</h2>
              <p className="text-gray-600 mb-4">Manage raw material intake and sorting</p>
              <Link
                href="/pegawai-rmp"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Access RMP
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">MP Module</h2>
              <p className="text-gray-600 mb-4">Track production activities</p>
              <Link
                href="/pegawai-mp"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Access MP
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">HR Module</h2>
              <p className="text-gray-600 mb-4">Manage employees and payroll</p>
              <Link
                href="/hr"
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
              >
                Access HR
              </Link>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">System Features</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto text-left">
              <li className="bg-white p-4 rounded-lg shadow-sm">✓ Raw Material Intake & Sorting</li>
              <li className="bg-white p-4 rounded-lg shadow-sm">✓ Production Tracking</li>
              <li className="bg-white p-4 rounded-lg shadow-sm">✓ Employee Attendance</li>
              <li className="bg-white p-4 rounded-lg shadow-sm">✓ Automated Payroll</li>
              <li className="bg-white p-4 rounded-lg shadow-sm">✓ Role-Based Access</li>
              <li className="bg-white p-4 rounded-lg shadow-sm">✓ Comprehensive Reporting</li>
              <li className="bg-white p-4 rounded-lg shadow-sm">✓ Workflow Validation</li>
              <li className="bg-white p-4 rounded-lg shadow-sm">✓ Variance Control</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
