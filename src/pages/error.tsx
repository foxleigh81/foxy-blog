import { useRouteError } from 'react-router-dom';

interface ErrorType {
  statusText?: string;
  message?: string;
}

export default function ErrorPage() {
  const error = useRouteError() as ErrorType;

  // TODO: Add handlers for different error codes
  return (
    <div
      id="error-page"
      className="min-h-screen flex flex-col justify-center items-center bg-gray-100"
    >
      <h1 className="text-6xl font-bold text-purple-600 mb-4">Oops!</h1>
      <p className="text-xl text-gray-700 mb-4">
        Yeah. That page doesn&apos;t actually exist.{' '}
      </p>
      <p className="text-lg text-gray-500 italic">
        {error?.statusText || error?.message || 'Something went wrong.'}
      </p>
      <a
        href="/"
        className="mt-6 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
      >
        Go back to Homepage
      </a>
    </div>
  );
}
