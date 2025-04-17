import Swap from '@dexhunterio/swaps';
import '@dexhunterio/swaps/lib/assets/style.css';

const customizations = {
  theme: {
    primary: '#007AFF',
    secondary: '#F5F5F5',
  },
  language: 'en',
};

export const Sandbox = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Swap
      partnerCode="YOUR_PARTNER_CODE"
      partnerName="L4VA"
      {...customizations}
    />
  </div>
);
