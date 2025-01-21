import { Link } from 'react-router-dom';

import { ConnectButton } from './ConnectButton';

export const Header = () => (
  <nav className="text-white py-4 px-6 flex items-center justify-between">
    <div className="flex items-center">
      <img alt="L4VA Logo" className="h-10" src="/assets/logo.webp"/>
    </div>
    <div className="flex items-center space-x-8">
      <Link className="hover:text-yellow-400" to="/create">ADA</Link>
      <Link className="hover:text-yellow-400" to="/create">Create</Link>
      <Link className="hover:text-yellow-400" to="/contribute">Contribute</Link>
      <Link className="hover:text-yellow-400" to="/invest">Invest</Link>
      <Link className="hover:text-yellow-400" to="/govern">Govern</Link>
      <ConnectButton />
    </div>
  </nav>
);
