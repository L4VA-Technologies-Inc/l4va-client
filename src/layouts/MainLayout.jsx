import { Header } from '../components/Header.jsx';

export const Layout = ({ children }) => (
  <div className="min-h-screen bg-gray-100">
    <Header />
    {children}
  </div>
);
