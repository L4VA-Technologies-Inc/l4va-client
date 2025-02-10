import { Link } from 'react-router-dom';

import { ConnectButton } from './ConnectButton';
import { CurrencyDropdown } from './CurrencyDropdown.jsx';

const options = [
  { value: 'USD', icon: '/assets/icons/flag.svg', label: 'USD' },
  { value: 'ADA', icon: '/assets/icons/ada.svg', label: 'ADA' },
];

export const Header = () => (
  <div className="absolute top-0 w-full z-10 px-6">
    <nav className="container mx-auto text-white py-4 flex items-center justify-between">
      <Link to="/">
        <img alt="L4VA Logo" className="w-[160px] h-[60px]" src="/assets/logo.webp"/>
      </Link>
      <div className="flex items-center text-2xl">
        <CurrencyDropdown
          options={options}
          value="ADA"
          onSelect={(value) => console.log(value)}
        />
        <Link
          className="min-w-[140px] text-center transition hover:text-main-red"
          to="/create"
        >
          Create
        </Link>
        <Link
          className="min-w-[140px] text-center transition hover:text-main-red"
          to="/contribute"
        >
          Contribute
        </Link>
        <Link
          className="min-w-[140px] text-center transition hover:text-main-red"
          to="/invest"
        >
          Invest
        </Link>
        <Link
          className="min-w-[140px] text-center transition hover:text-main-red"
          to="/govern"
        >
          Govern
        </Link>
      </div>
      <ConnectButton />
    </nav>
  </div>
);
