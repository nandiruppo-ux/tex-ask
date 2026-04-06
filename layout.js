export const metadata = {
  title: "TextileGPT - Expert Textile Chatbot",
  description: "AI-powered chatbot for fabrics, yarn, weaving, dyeing & textile trade",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
