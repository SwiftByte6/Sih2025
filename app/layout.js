import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { ToastProvider } from "@/components/ToastProvider";
import PWAInit from "@/components/PWAInit";
import { Lexend_Exa } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lexendExa = Lexend_Exa({
  variable: '--font-lexend-exa', // optional CSS variable for easier use
  subsets: ['latin'],
  weight: ['400', '500', '700'], // specify font weights you need
})

export const metadata = {
  title: "ShoreSafe - Coastal Safety Platform",
  description: "Citizen reporting app for hazard reporting with camera support",
  manifest: "/manifest.json",
  icons: {
    icon: "/Logo.png",
    shortcut: "/Logo.png",
    apple: "/Logo.png",
  },
};

export const viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable}  ${lexendExa.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider>
          <UserProvider>
            <ToastProvider>
              <PWAInit />
              {children}
            </ToastProvider>
          </UserProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
