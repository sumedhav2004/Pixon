import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";

const font = DM_Sans({
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Pixon",
  description: "Agency Management made easy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${font} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
        
      </html>
    
  );
}
