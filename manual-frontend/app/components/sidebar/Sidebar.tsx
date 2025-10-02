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
      // { href: "/approvals", label: "Approvals", icon: "✅" },
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
    <aside className="h-full w-60 my-blue-bg border-gray-200">
      {/* Logo */}
      <div className="px-2 py-6 border-gray-200 flex flex-col items-center">
        <img
          src="/logo/logo.png"
          alt="Company Logo"
          className="h-40 w-40 mb-2 rounded"
        />
        <h1 className="text-xl font-bold text-white">Axora</h1>
        <p className="text-xs text-white/80 mt-1">Documentation Builder</p>
      </div>

      {/* Navigation */}
      <div className="px-4 py-4">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wide mb-3">
              {section.title}
            </h3>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-2 py-2 text-sm rounded-md transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-white hover:bg-blue-800'
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


