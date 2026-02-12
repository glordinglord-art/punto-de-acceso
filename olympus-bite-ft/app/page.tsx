import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 dark:bg-neutral-950">
      {/* Hero */}
      <div className="max-w-lg text-center">
        {/* Logo */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-neutral-900 shadow-2xl shadow-neutral-900/20 dark:bg-white">
          <span className="text-4xl font-black text-white dark:text-neutral-900">O</span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
          Olympus<span className="text-neutral-400">Bite</span>
        </h1>

        <p className="mt-4 text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Tu aliado en nutrición y entrenamiento.
          <br />
          Controla tu alimentación, sigue tus rutinas.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-neutral-800 hover:shadow-lg hover:shadow-neutral-900/20 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-8 py-3.5 text-sm font-semibold text-neutral-900 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-transparent dark:text-white dark:hover:bg-neutral-800"
          >
            Registrarse con código
          </Link>
        </div>

        {/* Feature pills */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-2">
          {[
            '📸 Escanea comidas',
            '🔥 Cuenta calorías',
            '💪 Rutinas personalizadas',
            '📊 Panel de control',
          ].map((feature) => (
            <span
              key={feature}
              className="rounded-full bg-neutral-50 px-4 py-2 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-20 text-xs text-neutral-300 dark:text-neutral-700">
        © 2026 Olympus Bite. Nutrición & Entrenamiento.
      </p>
    </div>
  );
}
