import "./globals.css";
import Providers from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-gray-900 dark:bg-slate-950 dark:text-slate-50">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
