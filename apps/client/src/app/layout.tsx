import './globals.css';
import AuthWrapper from '@/components/AuthWrapper';
import { Toaster } from '@/components/ui/toast/toaster';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Next.js App',
  description: 'Next.js App with NestJS and Supabase',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthWrapper>{children}</AuthWrapper>
        <Toaster />
      </body>
    </html>
  );
} 