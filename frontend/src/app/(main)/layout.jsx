// // src/app/layout.jsx

// import { Navbar } from "@/components/layout/Navbar";

// import { Inter } from 'next/font/google';
// import './globals.css';
// import { Providers } from '../providers';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//   title: 'ServiceBook — Local Service Booking',
//   description: 'Book trusted local service providers',
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className={`${inter.className} bg-gray-50 min-h-screen`}>
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }

// src/app/(main)/layout.jsx
import { Navbar } from "@/components/layout/Navbar";



export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
