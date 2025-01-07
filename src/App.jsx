import { useState } from 'react';
import { useWallet, useExtensions } from '@ada-anvil/weld/react';
import axios from 'axios';

const RADIX = 16;

const messageHex = msg => Array.from(msg).map(char =>
  char.charCodeAt(0).toString(RADIX).padStart(2, '0'),
).join('');

export const App = () => {
  const [signatureResponse, setSignatureResponse] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
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
      setVerificationStatus('');
      const message = `account: ${wallet.stakeAddressBech32}`;
      const signature = await wallet.handler.signData(messageHex(message));

      setSignatureResponse(JSON.stringify(signature, null, 2));
      console.log('Message signed:', signature);

      // Send to backend for verification
      const response = await axios.post('/api/v1/auth/login', {
        signature,
        message,
        stakeAddress: wallet.stakeAddressBech32,
      });

      setVerificationStatus(response.data.message);
    } catch (error) {
      console.error('Failed to sign/verify message:', error);
      setVerificationStatus(error.response?.data?.message || 'Verification failed');
      setSignatureResponse(`Error: ${error.message}`);
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
              Connected to {wallet.displayName}
            </div>

            <div className="text-sm text-gray-600">
              <div>Network ID: {wallet.networkId}</div>
              <div>Balance: {Math.floor(wallet.balanceAda)} ADA</div>
              <div className="truncate">Stake Address: {wallet.stakeAddressBech32}</div>
              <div className="truncate">Change Address: {wallet.changeAddressBech32}</div>
            </div>

            <button
              className="w-full px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              type="button"
              onClick={handleSignMessage}
            >
              Sign Authentication Message
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
            type="button"
            onClick={handleConnect}
          >
            Connect Wallet
          </button>
        )}

        {verificationStatus && (
          <div
            className={`mt-4 p-3 rounded ${
              verificationStatus.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {verificationStatus}
          </div>
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
