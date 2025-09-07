import ClientToaster from "@/components/ClientToaster";
import "./globals.css";

export const metadata = {
  title: "Markdown Publisher - Clean CMS Interface",
  description: "A clean and minimal markdown-based CMS for content management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 min-h-screen">
        {children}
        <ClientToaster />
      </body>
    </html>
  );
}
