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
    <main className="login-page">
      <section className="login-card">
        <h1>Login</h1>
        <p>Access your helpdesk dashboard.</p>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="login-form"
          noValidate
        >
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={errors.email ? "input-error" : undefined}
            aria-invalid={errors.email ? "true" : "false"}
            {...register("email")}
          />
          {errors.email ? (
            <p className="field-error">{errors.email.message}</p>
          ) : null}

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className={errors.password ? "input-error" : undefined}
            aria-invalid={errors.password ? "true" : "false"}
            {...register("password")}
          />
          {errors.password ? (
            <p className="field-error">{errors.password.message}</p>
          ) : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
        {error ? <p className="form-error">{error}</p> : null}
      </section>
    </main>
  );
}
