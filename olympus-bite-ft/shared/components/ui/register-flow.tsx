"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { authService } from "@/features/auth/services/auth.service";
import { ArrowRight, Lock, Mail, User, Phone, KeyRound, Activity } from "lucide-react";
import { CanvasRevealEffect } from "./sign-in-flow";

interface RegisterFlowProps {
  className?: string;
}

export const RegisterFlow = ({ className }: RegisterFlowProps) => {
  // Form State
  const [invitationCode, setInvitationCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  // Flow State
  const [step, setStep] = useState<"code" | "profile" | "password" | "success">("code");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Refs for auto-focus
  const nameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  
  // Animation State
  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
  const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  // Handlers
  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (invitationCode) {
      setError("");
      setStep("profile");
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      setError("");
      setStep("password");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await authService.register({ 
        name, 
        email, 
        password, 
        invitationCode, 
        phone: phone || undefined 
      });
      login(response.data);
      
      // Trigger success animations
      setReverseCanvasVisible(true);
      setTimeout(() => setInitialCanvasVisible(false), 50);
      
      setTimeout(() => {
        setStep("success");
      }, 1500);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al registrarse");
      }
      setLoading(false);
    }
  };

  // Auto-focus logic
  useEffect(() => {
    if (step === "profile") {
      setTimeout(() => nameInputRef.current?.focus(), 500);
    } else if (step === "password") {
      setTimeout(() => passwordInputRef.current?.focus(), 500);
    }
  }, [step]);

  const handleBackToCode = () => {
    setStep("code");
    setError("");
  };

  const handleBackToProfile = () => {
    setStep("profile");
    setError("");
  };

  const handleFinish = () => {
    router.push("/dashboard");
  };

  return (
    <div className={cn("flex w-full flex-col min-h-screen bg-slate-950 relative overflow-hidden", className)}>
      <div className="absolute inset-0 z-0 pointer-events-none">
        {initialCanvasVisible && (
          <div className="absolute inset-0">
            <CanvasRevealEffect
              animationSpeed={3}
              containerClassName="bg-slate-950"
              colors={[
                [59, 130, 246], // Blue 500
                [14, 165, 233], // Sky 500
              ]}
              dotSize={6}
              reverse={false}
            />
          </div>
        )}
        
        {reverseCanvasVisible && (
          <div className="absolute inset-0">
            <CanvasRevealEffect
              animationSpeed={4}
              containerClassName="bg-slate-950"
              colors={[
                [16, 185, 129], // Emerald 500 (Success color)
                [52, 211, 153],
              ]}
              dotSize={6}
              reverse={true}
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <span className="font-display text-xl font-bold text-slate-950">P</span>
            </div>
            <span className="font-display uppercase tracking-widest text-sm font-semibold text-white hidden sm:block">
              Punto de Inflexión
            </span>
          </Link>
          <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Ya tengo cuenta
          </Link>
        </header>

        <div className="flex flex-1 flex-col justify-center items-center px-5 py-20">
          <div className="w-full max-w-sm">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: INVITATION CODE */}
              {step === "code" ? (
                <motion.div 
                  key="code-step"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-8 text-center"
                >
                  <div className="space-y-2">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                      <KeyRound className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="font-display text-[2.5rem] font-bold uppercase leading-none tracking-tight text-white">
                      Conecta con<br/>tu entrenador
                    </h1>
                    <p className="text-lg text-slate-400 pt-2">
                      Ingresa el código de invitación que te proporcionaron.
                    </p>
                  </div>
                  
                  <form onSubmit={handleCodeSubmit} className="space-y-4">
                    <div className="relative group">
                      <input 
                        type="text" 
                        placeholder="Ej. OB-XXXXXX"
                        value={invitationCode}
                        onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                        className="w-full bg-white/5 text-white border border-white/10 rounded-2xl py-4 px-6 text-center text-xl tracking-[0.2em] uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all backdrop-blur-sm placeholder:text-slate-600 placeholder:tracking-normal placeholder:normal-case"
                        required
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={!invitationCode || invitationCode.length < 3}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold py-4 transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-400 text-slate-950 disabled:opacity-50 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                    >
                      Continuar <ArrowRight className="w-5 h-5" />
                    </button>
                  </form>
                </motion.div>
                
              ) : step === "profile" ? (
                
                /* STEP 2: PROFILE INFO */
                <motion.div 
                  key="profile-step"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h1 className="font-display text-[2.5rem] font-bold uppercase leading-none tracking-tight text-white">
                      Crea tu perfil
                    </h1>
                    <p className="text-slate-400">Tus datos básicos para empezar.</p>
                  </div>
                  
                  <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-2 mx-auto w-fit">
                     <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">CÓDIGO:</span>
                     <span className="text-sm font-bold text-white">{invitationCode}</span>
                  </div>
                  
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="space-y-4">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <User className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        </div>
                        <input 
                          ref={nameInputRef}
                          type="text" 
                          placeholder="Tu nombre completo"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white/5 text-white border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all backdrop-blur-sm placeholder:text-slate-600"
                          required
                        />
                      </div>
                      
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <Mail className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        </div>
                        <input 
                          type="email" 
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white/5 text-white border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all backdrop-blur-sm placeholder:text-slate-600"
                          required
                        />
                      </div>

                      <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <Phone className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        </div>
                        <input 
                          type="tel" 
                          placeholder="Teléfono (Opcional)"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-white/5 text-white border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all backdrop-blur-sm placeholder:text-slate-600"
                        />
                      </div>
                    </div>
                    
                    <div className="flex w-full gap-3 pt-2">
                      <button 
                        type="button"
                        onClick={handleBackToCode}
                        className="rounded-2xl border border-white/10 bg-white/5 text-white font-medium px-6 py-4 hover:bg-white/10 transition-colors"
                      >
                        Atrás
                      </button>
                      <button 
                        type="submit"
                        disabled={!name || !email}
                        className="flex-1 flex items-center justify-center gap-2 rounded-2xl font-bold py-4 transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-400 text-slate-950 disabled:opacity-50 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                      >
                        Siguiente <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </motion.div>

              ) : step === "password" ? (
                
                /* STEP 3: PASSWORD */
                <motion.div 
                  key="password-step"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-8 text-center"
                >
                  <div className="space-y-2">
                    <h1 className="font-display text-[2.5rem] font-bold uppercase leading-none tracking-tight text-white">
                      Protege tu cuenta
                    </h1>
                    <p className="text-lg text-slate-400">Crea una contraseña segura.</p>
                  </div>
                  
                  <div className="inline-flex flex-col items-center gap-1 bg-white/5 border border-white/10 rounded-2xl p-4 mb-2 mx-auto w-full">
                     <p className="text-sm text-slate-400">Registrando como:</p>
                     <p className="text-base font-semibold text-white">{name}</p>
                     <p className="text-sm text-blue-400">{email}</p>
                  </div>
                  
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      </div>
                      <input
                        ref={passwordInputRef}
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        minLength={6}
                        className="w-full bg-white/5 text-white border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all backdrop-blur-sm placeholder:text-slate-600"
                        required
                      />
                    </div>
                    
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                        {error}
                      </motion.div>
                    )}
                    
                    <div className="flex w-full gap-3 pt-2">
                      <button 
                        type="button"
                        onClick={handleBackToProfile}
                        disabled={loading}
                        className="rounded-2xl border border-white/10 bg-white/5 text-white font-medium px-6 py-4 hover:bg-white/10 transition-colors"
                      >
                        Atrás
                      </button>
                      <button 
                        type="submit"
                        disabled={!password || password.length < 6 || loading}
                        className="flex-1 flex items-center justify-center gap-2 rounded-2xl font-bold py-4 transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-400 text-slate-950 disabled:opacity-50 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                      >
                        {loading ? "Creando cuenta..." : "Crear Cuenta"}
                      </button>
                    </div>
                  </form>
                </motion.div>

              ) : (

                /* STEP 4: SUCCESS */
                <motion.div 
                  key="success-step"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="space-y-8 text-center"
                >
                  <div className="space-y-2">
                    <h1 className="font-display text-[3rem] font-bold uppercase leading-none tracking-tight text-white">
                      ¡Cuenta Creada!
                    </h1>
                    <p className="text-lg text-emerald-400">Todo listo para empezar.</p>
                  </div>
                  
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    className="py-8"
                  >
                    <div className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                      <Activity className="w-10 h-10 text-slate-950" />
                    </div>
                  </motion.div>
                  
                  <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    onClick={handleFinish}
                    className="w-full rounded-2xl bg-white text-slate-950 font-bold py-4 hover:bg-slate-200 transition-colors"
                  >
                    Ir a mi Dashboard
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
