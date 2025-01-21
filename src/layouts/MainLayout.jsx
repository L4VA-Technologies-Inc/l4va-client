import { Header } from '../components/Header.jsx';

export const Layout = ({ children }) => (
  <>
    <Header />
    {children}
  </>
);
