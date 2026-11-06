export const metadata = {
  metadataBase: new URL("https://www.thebenzzcreations.com"),
  title: "Page not found | TheBenzzCreations",
  description:
    "The requested page is unavailable. Return to TheBenzzCreations to explore our development services and published work.",
  robots: { index: false, follow: true },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#141518",
          color: "#f7f7f5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
