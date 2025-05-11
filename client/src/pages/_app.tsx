import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../context/AuthContext';
import NavigationBar from '../components/NavigationBar';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <NavigationBar />
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp; 