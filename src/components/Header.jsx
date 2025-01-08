import { useWallet, useExtensions } from '@ada-anvil/weld/react';

import { useAuth } from '../context/AuthContext.jsx';

const RADIX = 16;

const messageHex = msg => Array.from(msg).map(char =>
  char.charCodeAt(0).toString(RADIX).padStart(2, '0'),
).join('');

export const Header = () => {
  const {
    isAuthenticated, login, logout,
  } = useAuth();
  const wallet = useWallet(
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
  };

  const handleSignAndLogin = async () => {
    if (!wallet.isConnected || !wallet.handler) return;

    try {
      const message = `account: ${wallet.stakeAddressBech32}`;
      const signature = await wallet.handler.signData(messageHex(message));
      await login(signature, wallet.stakeAddressBech32);
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  return (
    <header className="bg-gray-900 text-white py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold">
          L4VA
        </div>

        <div>
          {!wallet.isConnected && (
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium transition-colors"
              type="button"
              onClick={handleConnect}
            >
              Connect Wallet
            </button>
          )}

          {wallet.isConnected && !isAuthenticated && (
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium transition-colors"
              type="button"
              onClick={handleSignAndLogin}
            >
              Sign to Login
            </button>
          )}

          {wallet.isConnected && isAuthenticated && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm truncate max-w-xs">
                {wallet.stakeAddressBech32}
              </span>
              <button
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition-colors"
                type="button"
                onClick={handleDisconnect}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
