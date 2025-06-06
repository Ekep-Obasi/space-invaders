import "./globals.css";

export const metadata = {
  title: "Space Invaders Game",
  description:
    "Classic Space Invaders arcade game built with React and Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
