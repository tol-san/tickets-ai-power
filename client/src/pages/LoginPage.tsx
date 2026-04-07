import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../context/useAuth.ts";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(1, "Password is required.")
    .min(8, "Password must be at least 8 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);

    try {
      await signIn(values.email, values.password);
      navigate("/", { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Invalid email or password.";
      setError(message);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-linear-to-b from-slate-50 via-slate-100 to-slate-200 px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-300/40 sm:p-7">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Login
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Access your helpdesk dashboard.
        </p>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-5 grid gap-2"
          noValidate
        >
          <label
            htmlFor="email"
            className="text-sm font-semibold text-slate-800"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`w-full rounded-lg border px-3 py-2.5 text-slate-900 outline-none transition focus:ring-2 ${
              errors.email
                ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200"
                : "border-slate-300 bg-white focus:border-slate-500 focus:ring-slate-200"
            }`}
            aria-invalid={errors.email ? "true" : "false"}
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-sm font-medium text-red-700">
              {errors.email.message}
            </p>
          ) : null}

          <label
            htmlFor="password"
            className="mt-2 text-sm font-semibold text-slate-800"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className={`w-full rounded-lg border px-3 py-2.5 text-slate-900 outline-none transition focus:ring-2 ${
              errors.password
                ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200"
                : "border-slate-300 bg-white focus:border-slate-500 focus:ring-slate-200"
            }`}
            aria-invalid={errors.password ? "true" : "false"}
            {...register("password")}
          />
          {errors.password ? (
            <p className="text-sm font-medium text-red-700">
              {errors.password.message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-3 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
        {error ? (
          <p className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}
      </section>
    </main>
  );
}
