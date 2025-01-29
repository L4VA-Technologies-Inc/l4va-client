import { Link } from 'react-router-dom';

import { ConnectButton } from './ConnectButton';

export const Header = () => (
  <div className="absolute top-0 w-full z-10 px-6">
    <nav className="container mx-auto text-white py-4 flex items-center justify-between">
      <img alt="L4VA Logo" className="w-[160px] h-[60px]" src="/assets/logo.webp"/>
      <div className="flex items-center text-2xl">
        <Link
          className="min-w-[125px] text-center transition hover:text-yellow-400"
          to="/create"
        >
          ADA
        </Link>
        <Link
          className="min-w-[140px] text-center transition hover:text-yellow-400"
          to="/create"
        >
          Create
        </Link>
        <Link
          className="min-w-[140px] text-center transition hover:text-yellow-400"
          to="/contribute"
        >
          Contribute
        </Link>
        <Link
          className="min-w-[140px] text-center transition hover:text-yellow-400"
          to="/invest"
        >
          Invest
        </Link>
        <Link
          className="min-w-[140px] text-center transition hover:text-yellow-400"
          to="/govern"
        >
          Govern
        </Link>
      </div>
      <ConnectButton />
    </nav>
  </div>
);
