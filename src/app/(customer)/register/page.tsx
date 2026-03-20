import Link from "next/link";

export default function CustomerRegisterPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Register</h1>
      <p className="mt-2 text-sm opacity-70">
        This page is a placeholder for customer registration flow (server action + httpOnly cookies
        will be added in a later pass).
      </p>

      <form className="mt-6 space-y-4">
        <label className="block">
          <div className="text-sm font-medium">Name</div>
          <input name="name" className="mt-1 w-full rounded-md border px-3 py-2" />
        </label>
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
          Create account
        </button>
      </form>

      <div className="mt-4 text-sm opacity-70">
        Already have an account? <Link href="/login">Login</Link>
      </div>
    </main>
  );
}

