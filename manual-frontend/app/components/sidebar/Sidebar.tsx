"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navSections = [
  {
    title: "DOCUMENTATION",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "📊" },
      { href: "/manuals", label: "Manuals", icon: "📚" },
      { href: "/create", label: "Create Manual", icon: "✏️" },
      // { href: "/templates", label: "Templates", icon: "📄" },
    ]
  },
  {
    title: "WORKFLOW",
    items: [
      { href: "/reviews", label: "Reviews", icon: "👁️" },
      { href: "/approvals", label: "Approvals", icon: "✅" },
      // { href: "/versions", label: "Version Control", icon: "🔄" },
      // { href: "/audit", label: "Audit Logs", icon: "📋" },
    ]
  },
  {
    title: "ORGANIZATION",
    items: [
      { href: "/categories", label: "Categories", icon: "🗂️" },
      // { href: "/tags", label: "Tags", icon: "🏷️" },
      // { href: "/search", label: "Search", icon: "🔍" },
    ]
  },
  {
    title: "ADMINISTRATION",
    items: [
      { href: "/users", label: "User Management", icon: "👥" },
      { href: "/settings", label: "Settings", icon: "⚙️" },
      // { href: "/departments", label: "Departments", icon: "🏢" },
      // { href: "/reports", label: "Reports", icon: "📈" },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="h-full w-64 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">Axora</h1>
        <p className="text-xs text-gray-500 mt-1">Documentation Management</p>
      </div>

      {/* Navigation */}
      <div className="p-4">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {section.title}
            </h3>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {/* {item.hasDropdown && (
                      <span className="text-gray-400">›</span>
                    )} */}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}


