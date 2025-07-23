
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  DocumentDuplicateIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      to: '/',
      label: 'Tailor Resume',
      icon: DocumentTextIcon
    },
    {
      to: '/my-resumes',
      label: 'My Resumes',
      icon: DocumentDuplicateIcon
    }
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 left-0 bottom-0 w-64 bg-black/95 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex justify-between items-center p-4 border-b border-white/5">
          <h2 className="text-white font-semibold">Menu</h2>
          <button
            onClick={closeSidebar}
            className="p-2 rounded-full hover:bg-white/5 text-white/70 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col p-4 space-y-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={closeSidebar}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(to)
                  ? 'text-white bg-white/10'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
          <button
            onClick={() => {
              closeSidebar();
              logout();
            }}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 w-full"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Desktop Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-black/30 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-white/5 text-white/70 hover:text-white transition-colors lg:hidden"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
                    isActive(to)
                      ? 'text-white bg-white/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              ))}
            </div>
            
            {/* Desktop Sign Out Button */}
            <button
              onClick={logout}
              className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar; 