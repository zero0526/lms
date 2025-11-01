import Navbar from "../components/Navbar";

export default function Course() {
  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar />
      <main className="px-8 py-6">{children}</main>
    </div>
  );
}