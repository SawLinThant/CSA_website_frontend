import Link from "next/link";

export default function CustomerLoginPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Login</h1>
      <p className="mt-2 text-sm opacity-70">
        This page is wired for SSR styling, but the login submission flow will be implemented next.
      </p>

      <form className="mt-6 space-y-4">
        <label className="block">
          <div className="text-sm font-medium">Phone</div>
          <input name="phone" className="mt-1 w-full rounded-md border px-3 py-2" />
        </label>
        <label className="block">
          <div className="text-sm font-medium">Password</div>
          <input
            name="password"
            type="password"
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <button type="submit" className="rounded-md bg-black px-4 py-2 text-white">
          Sign in
        </button>
      </form>

      <div className="mt-4 text-sm opacity-70">
        No account? <Link href="/register">Register</Link>
      </div>
    </main>
  );
}

