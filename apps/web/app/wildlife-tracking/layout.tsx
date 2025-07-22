import Header from "@/components/layout/header"; // Import the Server Component here

export default function WildlifeTrackingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header /> {/* Render the Server Component here */}
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {children} {/* Your page.tsx will be rendered here */}
      </main>
    </>
  );
}