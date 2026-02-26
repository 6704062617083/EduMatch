import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <h1 className="text-3xl font-bold">Welcome to EDUMATCH</h1>
      <h2 className="text-3xl font-bold">Start Page</h2>

      <div className="flex gap-4">
        <Link href="/login">
          <button className="px-6 py-2 bg-blue-500 text-white rounded">
            Login
          </button>
        </Link>

        <Link href="/register">
          <button className="px-6 py-2 bg-green-500 text-white rounded">
            Register
          </button>
        </Link>
      </div>
    </div>
  );
}