import Link from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 dark:bg-neutral-950">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 dark:bg-white">
            <span className="text-2xl font-black text-white dark:text-neutral-900">
              O
            </span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Bienvenido
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Inicia sesión en Punto de Inflexión
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          ¿Tienes un código de invitación?{" "}
          <Link
            href="/register"
            className="font-medium text-neutral-900 hover:underline dark:text-white"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
