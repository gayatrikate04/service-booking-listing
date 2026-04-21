import { Navbar } from '@/components/layout/Navbar';


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}