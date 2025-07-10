import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Background from '../Background/Background';
import { EnvelopeIcon, LockClosedIcon, UserIcon} from '@heroicons/react/24/outline';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, name);
      navigate('/');
    } catch (err) {
      setError('Failed to create an account');
    }
  };

  return (
    <Background>
      <div className="min-h-screen flex flex-col justify-center px-8 lg:px-12">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-4xl font-normal tracking-wide text-white" style={{ fontFamily: 'MonsterEat, sans-serif' }}>
              Create your account
            </h2>
          </div>
          <form className="mt-12 space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="text-red-300 text-sm">{error}</div>
            )}
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="text-white text-sm mb-2 block" style={{ fontFamily: 'MonsterEat, sans-serif' }}>
                  Full Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <UserIcon className="h-5 w-5 text-white/30" aria-hidden="true" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="relative block w-full border-0 py-2 pl-10 px-3 bg-white/5 text-white placeholder:text-white/30 focus:ring-0 sm:text-sm"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email-address" className="text-white text-sm mb-2 block" style={{ fontFamily: 'MonsterEat, sans-serif' }}>
                  Email address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <EnvelopeIcon className="h-5 w-5 text-white/30" aria-hidden="true" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="relative block w-full border-0 py-2 pl-10 px-3 bg-white/5 text-white placeholder:text-white/30 focus:ring-0 sm:text-sm"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="text-white text-sm mb-2 block" style={{ fontFamily: 'MonsterEat, sans-serif' }}>
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <LockClosedIcon className="h-5 w-5 text-white/30" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="relative block w-full border-0 py-2 pl-10 px-3 bg-white/5 text-white placeholder:text-white/30 focus:ring-0 sm:text-sm"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                className="group relative flex w-48 justify-center py-2 px-4 text-sm text-white border border-white/20 hover:bg-white/5 transition-colors"
                style={{ fontFamily: 'MonsterEat, sans-serif' }}
              >
                <span className="flex items-center">
                  Create Account
                  
                </span>
              </button>
              <p className="text-white/50 text-sm flex items-center gap-1">
                Already have an account?{' '}
                <Link to="/login" className="inline-flex items-center text-white hover:text-white/80 transition-colors" style={{ fontFamily: 'MonsterEat, sans-serif' }}>
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Background>
  );
};

export default Register; 