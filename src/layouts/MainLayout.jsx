import { Header } from '@/components/Header';

export const Layout = ({ children }) => (
  <>
    <Header />
    {children}
  </>
);
