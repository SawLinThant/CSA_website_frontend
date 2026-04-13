import { z } from "zod";

// Server-only environment validation.
// Keep secrets non-`NEXT_PUBLIC_` so they are never exposed to the browser.
const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // Base URL for the existing Express backend (e.g. `http://localhost:4000`).
    API_BASE_URL: z.string().url().default("https://csa-backend-service.vercel.app/"),
    //API_BASE_URL: z.string().url().default("http://localhost:4000"),

    // httpOnly cookie names for refresh/access tokens.
    AUTH_REFRESH_TOKEN_COOKIE_NAME: z.string().default("refreshToken"),
    AUTH_ACCESS_TOKEN_COOKIE_NAME: z.string().default("accessToken"),
    AUTH_REMEMBER_ME_COOKIE_NAME: z.string().default("rememberMe"),

    // Cookie policy.
    COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]).default("lax"),
  })
  // Don't reject unrelated environment variables injected by the runtime/OS.
  // We only validate the keys we care about.
  ;

export type Env = z.infer<typeof envSchema>;
export const env: Env = envSchema.parse(process.env);

export const cookieSecurity = {
  // `secure` must be `true` on production; browsers reject `SameSite=None` cookies without `Secure`.
  secure: env.NODE_ENV === "production",
};

