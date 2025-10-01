"use client";

import { useAuth } from "../../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Manual, listManuals } from "../../lib/api";
import Badge from "./ui/Badge";


// Breadcrumb configuration for different routes
const routeConfig: Record<string, { name: string; parent?: string }> = {
  '/dashboard': { name: 'Dashboard' },
  '/manuals': { name: 'Manuals', parent: '/dashboard' },
  '/manuals/create': { name: 'Create Manual', parent: '/manuals' },
  '/categories': { name: 'Categories & Tags', parent: '/dashboard' },
  '/users': { name: 'User Management', parent: '/dashboard' },
  '/reviews': { name: 'Reviews & Approvals', parent: '/dashboard' },
  '/settings': { name: 'Settings', parent: '/dashboard' },
  '/create': { name: 'Create Manual', parent: '/dashboard' },
  '/profile': { name: 'Profile', parent: '/dashboard' }
};

export default function TopNavBar() {
  const { user, logout, loading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Manual[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [allManuals, setAllManuals] = useState<Manual[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const generateBreadcrumbs = () => {
    const breadcrumbs: { name: string; path: string; isLast: boolean }[] = [];
    
    // Handle dynamic routes (like /manuals/[id])
    const pathSegments = pathname.split('/').filter(Boolean);
    let currentPath = '';
    
    // Always start with Dashboard
    breadcrumbs.push({ name: 'Dashboard', path: '/dashboard', isLast: false });
    
    if (pathname === '/dashboard') {
      breadcrumbs[0].isLast = true;
      return breadcrumbs;
    }
    
    // Build path progressively
    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += '/' + pathSegments[i];
      
      // Check if we have a specific config for this route
      if (routeConfig[currentPath]) {
        breadcrumbs.push({
          name: routeConfig[currentPath].name,
          path: currentPath,
          isLast: i === pathSegments.length - 1
        });
      } else {
        // Handle dynamic routes
        const segment = pathSegments[i];
        let name = segment;
        let linkable = true;
        
        // Special cases for dynamic segments
        if (pathSegments[i - 1] === 'manuals' && /^\d+$/.test(segment)) {
          name = 'View Manual';
          // Don't make manual ID segments clickable by themselves
          linkable = false;
        } else if (segment === 'edit' && pathSegments[i - 1] && /^\d+$/.test(pathSegments[i - 1])) {
          name = 'Edit Manual';
        } else if (segment === 'create') {
          name = 'Create';
        } else {
          // Capitalize and format the segment
          name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        }
        
        breadcrumbs.push({
          name,
          path: linkable ? currentPath : '#',
          isLast: i === pathSegments.length - 1
        });
      }
    }
    
    // Mark the last breadcrumb
    if (breadcrumbs.length > 0) {
      breadcrumbs[breadcrumbs.length - 1].isLast = true;
    }
    
    return breadcrumbs;
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Error is handled in AuthContext
    } finally {
      setLoggingOut(false);
    }
  };

  // Load manuals for search
  useEffect(() => {
    const loadManuals = async () => {
      try {
        const manuals = await listManuals();
        setAllManuals(manuals);
      } catch (error) {
        console.error('Failed to load manuals for search:', error);
      }
    };
    
    if (user) {
      loadManuals();
    }
  }, [user]);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    const searchTimer = setTimeout(() => {
      const filtered = allManuals.filter((manual) =>
        manual.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        manual.department?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 8)); // Limit to 8 results
      setShowResults(true);
      setIsSearching(false);
    }, 300); // Debounce search

    return () => clearTimeout(searchTimer);
  }, [searchQuery, allManuals]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleManualClick = (manual: Manual) => {
    router.push(`/manuals/${manual.id}`);
    setShowResults(false);
    setSearchQuery("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/manuals?search=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'green';
      case 'draft': return 'yellow';
      case 'review': return 'blue';
      default: return 'gray';
    }
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="h-16 my-blue-bg border-b border-slate-200 flex items-center justify-between px-6">
      {/* Left side - Menu and Breadcrumb */}
      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-slate-100 rounded">
          <span className="text-white">☰</span>
        </button>
        <div className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={`${breadcrumb.path}-${index}`} className="flex items-center space-x-2">
              {breadcrumb.isLast || breadcrumb.path === '#' ? (
                <span className="text-white font-medium">
                  {breadcrumb.name}
                </span>
              ) : (
                <Link 
                  href={breadcrumb.path} 
                  className="text-white font-medium hover:text-blue-800 transition-colors"
                >
                  {breadcrumb.name}
                </Link>
              )}
              {!breadcrumb.isLast && (
                <span className="text-white">›</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Professional Search Bar */}
      <div className="flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search manuals, departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowResults(true)}
              className="
                block w-full pl-10 pr-12 py-2.5 
                border border-slate-300 rounded-lg
                bg-white/95 text-gray-500 placeholder-gray-500
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                hover:border-slate-400
                transition-all duration-200 outline-none
                text-sm
              "
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="animate-spin h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              </div>
            )}
            {searchQuery && !isSearching && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setShowResults(false);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-800"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </form>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {searchResults.length > 0 ? (
              <>
                <div className="px-4 py-2 text-xs font-medium text-slate-500 bg-slate-50 border-b">
                  {searchResults.length} manual{searchResults.length !== 1 ? 's' : ''} found
                </div>
                {searchResults.map((manual) => (
                  <button
                    key={manual.id}
                    onClick={() => handleManualClick(manual)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-blue-700 truncate">{manual.title}</h4>
                        <p className="text-sm text-slate-500 truncate">
                          {manual.department || 'No department'}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <Badge 
                          color={getStatusColor(manual.status)} 
                          size="sm"
                          variant="soft"
                        >
                          {manual.status}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
                {searchResults.length === 8 && (
                  <button
                    onClick={() => {
                      router.push(`/manuals?search=${encodeURIComponent(searchQuery)}`);
                      setShowResults(false);
                    }}
                    className="w-full px-4 py-3 text-center text-blue-600 hover:bg-blue-50 font-medium text-sm transition-colors"
                  >
                    View all results
                  </button>
                )}
              </>
            ) : (
              <div className="px-4 py-8 text-center">
                <div className="text-gray-500 text-2xl mb-2">🔍</div>
                <p className="text-slate-500 text-sm">No manuals found</p>
                <p className="text-gray-500 text-xs mt-1">Try different keywords</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center space-x-3">
        {/* User Profile */}
        <div className="flex items-center space-x-3">
          {user && (
            <span className="text-sm text-white">
              Welcome, {(user.first_name || user.username)?.charAt(0).toUpperCase() + (user.first_name || user.username)?.slice(1).toLowerCase()}
            </span>
          )}

          <button
            className="p-2 rounded-full hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleLogout}
            disabled={loggingOut || loading}
            title={loggingOut ? "Logging out..." : "Log out"}
            aria-label={loggingOut ? "Logging out..." : "Log out"}
          >
            {loggingOut ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            ) : (
              <FontAwesomeIcon icon={faPowerOff} className="h-5 w-5 text-white" />
            )}
          </button>

        </div>
      </div>
    </header>
  );
}
