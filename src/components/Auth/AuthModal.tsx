'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { FaUser, FaLock, FaEnvelope, FaFacebook } from 'react-icons/fa';
import { validateUsername } from '@/utils/validation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);

  const { signIn, signUp, signInWithFacebook } = useAuth();

  if (!isOpen) return null;

  const validateUsernameInput = (value: string) => {
    if (mode === 'signup') {
      const { isValid, error } = validateUsername(value);
      setUsernameError(error || '');
      return isValid;
    }
    return true;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    validateUsernameInput(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (mode === 'signup' && !validateUsernameInput(username)) {
      setIsSubmitting(false);
      setError(usernameError);
      return;
    }

    try {
      if (mode === 'login') {
        await signIn(email, password);
        onClose();
      } else {
        await signUp(email, password);
        setShowConfirmationMessage(true);
      }
    } catch (error) {
      console.error('Auth error in modal:', error);
      if (error instanceof Error) {
        // Handle Error objects
        setError(error.message || 'Failed to authenticate');
      } else if (typeof error === 'object' && error !== null) {
        // Try to extract error information from objects
        const errorObj = error as Record<string, unknown>;
        if (typeof errorObj.message === 'string') {
          setError(errorObj.message);
        } else if (typeof errorObj.error_description === 'string') {
          setError(errorObj.error_description);
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
        console.error('Detailed error:', JSON.stringify(error, null, 2));
      } else {
        // Fallback for other error types
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setError('');
      setIsSubmitting(true);
      const { error } = await signInWithFacebook();
      if (error) {
        setError(error.message);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      setError('Failed to sign in with Facebook. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setUsernameError('');
    setShowConfirmationMessage(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {showConfirmationMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              <p className="font-medium">Check your email</p>
              <p className="text-sm mt-1">
                We&apos;ve sent you a confirmation link. Please check your email and click the link
                to verify your account.
              </p>
            </div>
          )}

          {!showConfirmationMessage && (
            <>
              {process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN === 'true' && (
                <>
                  <button
                    onClick={handleFacebookSignIn}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 text-white bg-[#1877F2] hover:bg-[#166FE5] focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-4 disabled:bg-blue-300"
                  >
                    <FaFacebook className="text-xl" />
                    Continue with Facebook
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or</span>
                    </div>
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit}>
                {mode === 'signup' && (
                  <div className="mb-4">
                    <label htmlFor="username" className="block mb-2 text-sm font-medium">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="username"
                        className={`bg-gray-50 border ${usernameError ? 'border-red-300' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5`}
                        placeholder="Your username"
                        value={username}
                        onChange={handleUsernameChange}
                        required
                      />
                    </div>
                    {usernameError && <p className="mt-1 text-xs text-red-500">{usernameError}</p>}
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="email" className="block mb-2 text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="password" className="block mb-2 text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  {mode === 'signup' && (
                    <p className="mt-1 text-xs text-gray-500">
                      Password must be at least 6 characters
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-blue-300"
                >
                  {isSubmitting ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            </>
          )}

          <div className="mt-4 text-center">
            <button onClick={toggleMode} className="text-sm text-blue-600 hover:underline">
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
