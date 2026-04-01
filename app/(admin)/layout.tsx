'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const AdminLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Upload', href: '/upload' },
    { name: 'Orders', href: '/clientUploads' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800">
          <p className="text-xs text-gray-400">© 2024 Your Company</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
