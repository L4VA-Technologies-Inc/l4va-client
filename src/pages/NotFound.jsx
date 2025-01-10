import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

import { Layout } from '../layouts/MainLayout.jsx';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-base font-semibold text-yellow-500">404</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Page not found
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Sorry, we could not find the page you are looking for.
            It might have been moved or deleted.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-200 transition-colors"
              type="button"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4" />
              Go back
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-600 transition-colors"
              type="button"
              onClick={() => navigate('/')}
            >
              <Home className="w-4 h-4" />
              Go home
            </button>
          </div>
        </div>

        <div className="mt-16 select-none pointer-events-none">
          <div className="relative">
            <div className="absolute inset-x-0 text-gray-900/10 -z-10">
              <div className="h-[20rem] flex items-center justify-center text-[20rem] font-bold tracking-widest opacity-20">
                404
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
