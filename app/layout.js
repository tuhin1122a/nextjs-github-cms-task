import "./globals.css";

export const metadata = {
  title: "Markdown Publisher - Clean CMS Interface",
  description: "A clean and minimal markdown-based CMS for content management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
