import { useState } from 'react';
import { useWallet, useExtensions } from '@ada-anvil/weld/react';

const RADIX = 16;

const stringToHex = (str) => Array.from(str)
  .map(c => c.charCodeAt(0).toString(RADIX).padStart(2, '0'))
  .join('');

export const App = () => {
  const [signatureResponse, setSignatureResponse] = useState('');
  const wallet = useWallet(
    'isConnected',
    'displayName',
    'handler',
    'stakeAddressBech32',
    'changeAddressBech32',
    'networkId',
    'balanceAda',
  );
  const connect = useWallet('connect');
  const disconnect = useWallet('disconnect');
  const supportedWallets = useExtensions('supportedArr');

  const handleConnect = () => {
    if (supportedWallets.length > 0) {
      connect(supportedWallets[0].info.key, {
        onSuccess: (w) => console.log('Connected to', w.displayName),
        onError: (error) => console.error('Failed to connect:', error),
      });
    } else {
      console.error('No supported wallets found');
    }
  };

  const handleSignMessage = async () => {
    if (!wallet.isConnected || !wallet.handler) {
      console.error('No wallet connected');
      return;
    }

    try {
      const message = 'I accept terms';
      const hexMessage = stringToHex(message);

      const { signature } = await wallet.handler.signData(hexMessage);

      setSignatureResponse(signature);
      console.log('Message signed:', signature);
    } catch (error) {
      console.error('Failed to sign message:', error);
      setSignatureResponse(`Error signing message: ${error.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Message Signing Demo</h2>
      </div>

      <div className="space-y-4">
        {wallet.isConnected ? (
          <>
            <div className="text-green-600 font-medium">
              Connected to: {wallet.displayName}
            </div>

            <div className="text-sm text-gray-600">
              <div>Network ID: {wallet.networkId}</div>
              <div>Balance: {Math.floor(wallet.balanceAda)} ADA</div>
              <div className="truncate">Stake Address: {wallet.stakeAddressBech32}</div>
            </div>

            <button
              className="w-full px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              type="button"
              onClick={handleSignMessage}
            >
              Sign I accept terms
            </button>

            <button
              className="w-full px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              type="button"
              onClick={disconnect}
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            className="w-full px-4 py-2 text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
            onClick={handleConnect}
          >
            Connect Wallet
          </button>
        )}

        {signatureResponse && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-2 text-gray-800">Signature:</h3>
            <pre className="text-sm text-gray-600 break-all whitespace-pre-wrap">
              {signatureResponse}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
