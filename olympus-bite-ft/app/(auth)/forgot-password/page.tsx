"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { authService } from "@/features/auth/services/auth.service";
import { CanvasRevealEffect } from "@/shared/components/ui/sign-in-flow";
import { ArrowLeft, Mail, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const canvasVisible = true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError("");
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al solicitar la recuperación de contraseña");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Dynamic BG */}
      <div className="absolute inset-0 z-0">
        {canvasVisible && (
          <div className="absolute inset-0">
            <CanvasRevealEffect
              animationSpeed={3}
              containerClassName="bg-slate-950"
              colors={[
                [16, 185, 129], // Emerald 500
                [52, 211, 153], // Emerald 400
              ]}
              dotSize={6}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(2,6,23,0.9)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-slate-950 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Simple Header */}
        <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <span className="font-display text-xl font-bold text-slate-950">P</span>
            </div>
            <span className="font-display uppercase tracking-widest text-sm font-semibold text-white">
              Punto de Inflexión
            </span>
          </Link>
          <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Iniciar sesión
          </Link>
        </header>

        <div className="flex flex-1 flex-col justify-center items-center px-5">
          <div className="w-full max-w-sm">
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div
                  key="forgot-step"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-8 text-center"
                >
                  <div className="space-y-2">
                    <h1 className="font-display text-[2.25rem] font-bold uppercase leading-none tracking-tight text-white">
                      ¿Olvidaste tu<br/>contraseña?
                    </h1>
                    <p className="text-base text-slate-400">
                      No te preocupes. Te enviaremos un correo con las instrucciones para restablecerla.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                      </div>
                      <input
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 text-white border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all backdrop-blur-sm placeholder:text-slate-600"
                        required
                        disabled={loading}
                      />
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-left"
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}

                    <div className="flex flex-col gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={!email || loading}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold py-4 transition-all duration-300 bg-gradient-to-r from-primary-500 to-primary-400 text-slate-950 disabled:opacity-50 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                      >
                        {loading ? "Enviando..." : "Enviar Correo de Recuperación"}
                      </button>

                      <Link
                        href="/login"
                        className="inline-flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white py-3 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Volver a Iniciar Sesión</span>
                      </Link>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success-step"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="space-y-8 text-center"
                >
                  <div className="space-y-2">
                    <h1 className="font-display text-[2.5rem] font-bold uppercase leading-none tracking-tight text-white">
                      ¡Correo Enviado!
                    </h1>
                    <p className="text-base text-primary-400 font-medium">Revisa tu bandeja de entrada</p>
                  </div>

                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    className="py-6"
                  >
                    <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                      <CheckCircle2 className="w-10 h-10 text-slate-950" />
                    </div>
                  </motion.div>

                  <p className="text-sm text-slate-400 leading-relaxed">
                    Hemos enviado un enlace seguro para restablecer tu contraseña a <strong>{email}</strong>. Si no lo recibes en unos minutos, revisa tu carpeta de correo no deseado (spam).
                  </p>

                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white text-slate-950 font-bold py-4 hover:bg-slate-200 transition-colors shadow-lg"
                  >
                    <span>Regresar al Login</span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
