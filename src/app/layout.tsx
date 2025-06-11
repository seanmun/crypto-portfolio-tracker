import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </body>
    </html>
  );
}
