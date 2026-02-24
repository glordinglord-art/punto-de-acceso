import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
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
            Únete a Punto de Inflexión
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Necesitas un código de tu entrenador
          </p>
        </div>

        <RegisterForm />

        <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-neutral-900 hover:underline dark:text-white"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
