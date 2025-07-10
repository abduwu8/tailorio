
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  DocumentDuplicateIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { logout } = useAuth();
  const location = useLocation();

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-6">
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
          
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 