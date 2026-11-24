import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import PrimaryButton from '@/components/shared/PrimaryButton';
import { useAuth } from '@/lib/auth/auth.js';
import { useVerifyEmail } from '@/services/api/queries';

const getErrorMessage = error => {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message[0];
  return message || 'Something went wrong while verifying your email. Please try again.';
};

const VerifyEmail = () => {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const verifyEmailMutation = useVerifyEmail();
  const [status, setStatus] = useState(token ? 'loading' : 'error');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState(token ? '' : 'Verification link is missing a token.');
  // Tokens are single-use, so guard against StrictMode double-invoking the effect
  const requestedRef = useRef(false);

  useEffect(() => {
    if (!token || requestedRef.current) return;
    requestedRef.current = true;

    verifyEmailMutation
      .mutateAsync(token)
      .then(response => {
        setEmail(response?.data?.email || '');
        setStatus('success');
      })
      .catch(error => {
        setErrorMessage(getErrorMessage(error));
        setStatus('error');
      });
  }, [token]);

  return (
    <div className="container mx-auto px-4 py-20 xl:px-0 text-primary-text">
      <div className="max-w-md mx-auto rounded-xl bg-steel-950 border border-steel-800 p-8 flex flex-col items-center text-center gap-4">
        {status === 'loading' && (
          <>
            <Loader2 className="animate-spin text-orange-500" size={48} />
            <h1 className="text-2xl font-russo">Verifying your email…</h1>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="text-green-400" size={48} />
            <h1 className="text-2xl font-russo">Email verified</h1>
            <p className="text-dark-100">
              {email ? (
                <>
                  <span className="text-white font-medium">{email}</span> is now confirmed.
                </>
              ) : (
                'Your email is now confirmed.'
              )}{' '}
              You will receive notifications about your vaults and rewards.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="text-red-400" size={48} />
            <h1 className="text-2xl font-russo">Verification failed</h1>
            <p className="text-dark-100">{errorMessage}</p>
            <p className="text-sm text-gray-400">You can request a new link from your profile.</p>
          </>
        )}

        {status !== 'loading' && (
          <PrimaryButton className="mt-2 w-full" onClick={() => navigate({ to: isAuthenticated ? '/profile' : '/' })}>
            {isAuthenticated ? 'Go to profile' : 'Go to home'}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
};

export const Route = createFileRoute('/verify-email')({
  component: VerifyEmail,
  validateSearch: search => ({
    token: typeof search?.token === 'string' ? search.token : undefined,
  }),
});
