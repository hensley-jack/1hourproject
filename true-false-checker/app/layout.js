export const metadata = {
  title: 'True or False Checker',
  description: 'Check if statements are true or false',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}