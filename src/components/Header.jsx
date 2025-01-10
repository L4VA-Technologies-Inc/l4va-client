import { useState } from 'react';
import { useWallet, useExtensions } from '@ada-anvil/weld/react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/auth';
import { LoginModal } from './modals/LoginModal.jsx';

const RADIX = 16;

const messageHex = msg => Array.from(msg).map(char =>
  char.charCodeAt(0).toString(RADIX).padStart(2, '0'),
).join('');

export const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    user,
    isAuthenticated,
    login,
    logout,
  } = useAuth();

  const wallet = useWallet(
    'isConnectingTo',
    'isConnected',
    'displayName',
    'handler',
    'stakeAddressBech32',
    'changeAddressBech32',
  );

  const connect = useWallet('connect');
  const disconnect = useWallet('disconnect');
  const supportedWallets = useExtensions('supportedArr');

  const handleConnect = () => {
    if (supportedWallets.length > 0) {
      connect(supportedWallets[0].info.key);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    logout();
    setIsModalOpen(false);
  };

  const handleSignMessage = async () => {
    if (!wallet.isConnected || !wallet.handler) return;
    setIsLoading(true);

    try {
      const message = `account: ${wallet.stakeAddressBech32}`;
      const signature = await wallet.handler.signData(messageHex(message));
      await login(signature, wallet.stakeAddressBech32);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="bg-gray-900 text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold">
            <Link className="hover:text-yellow-500 transition-colors" to="/">
              L4VA
            </Link>
          </div>
          <div>
            {!isAuthenticated ? (
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                type="button"
                onClick={() => setIsModalOpen(true)}
              >
                Sign in
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 text-sm truncate max-w-xs">
                  {user.name}
                </span>
                <button
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition-colors"
                  type="button"
                  onClick={handleDisconnect}
                >
                  Sing out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <LoginModal
        isAuthenticated={isAuthenticated}
        isConnected={wallet.isConnected}
        isConnectingTo={wallet.isConnectingTo}
        isLoading={isLoading}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleConnect}
        onSignMessage={handleSignMessage}
      />
    </>
  );
};
