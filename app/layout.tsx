import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ViewModeIndicator } from '@/components/notes/view-mode-indicator';
import { LanguageProvider } from '@/contexts/language-context';
import ErrorBoundary from '@/components/error-boundary';
import { QueryProvider } from '@/src/providers/query-provider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Notes PKM - Personal Knowledge Management',
  description: 'A modern note-taking app for developers to manage code snippets and technical knowledge',
  keywords: ['notes', 'code snippets', 'personal knowledge management', 'pkm', 'developer tools'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <QueryProvider>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
              <Toaster />
              <ViewModeIndicator />
            </QueryProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}