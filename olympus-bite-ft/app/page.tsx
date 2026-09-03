"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { 
  Activity, 
  ArrowRight, 
  BarChart3, 
  ShieldCheck, 
  Zap,
  Users,
  LineChart
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useEffect, useState } from "react";
import { CinematicHero } from "@/shared/components/ui/cinematic-landing-hero";
import { VitalFitLogo } from "@/shared/components/ui/VitalFitLogo";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl rounded-full transition-all duration-500 border",
        scrolled 
          ? "bg-[#050505]/90 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md py-3 px-6" 
          : "bg-transparent border-transparent py-4 px-6"
      )}
    >
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <VitalFitLogo size="sm" showGlow={true} glowIntensity="medium" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#beneficios" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Beneficios</Link>
          <Link href="#como-funciona" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Cómo funciona</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block text-sm font-medium text-neutral-400 hover:text-white transition-colors">
            Iniciar sesión
          </Link>
          <Link href="/register" className="group relative inline-flex items-center justify-center rounded-full bg-red-600 hover:bg-red-500 px-5 py-2 text-sm font-bold text-white overflow-hidden border border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all">
            <span className="relative z-10 flex items-center gap-2">
              Empezar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] selection:bg-red-500/30 selection:text-red-100 overflow-x-hidden font-sans">
      <Navbar />

      <main className="relative z-10">
        {/* NEW CINEMATIC HERO */}
        <CinematicHero />

        {/* TRUST STATS BANNER */}
        <section className="border-y border-white/5 bg-white/[0.01]">
          <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10 text-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="px-4 py-2">
                <BarChart3 className="w-8 h-8 text-red-500 mx-auto mb-4" />
                <h4 className="font-display text-2xl font-bold text-white uppercase mb-1">Todo en 1 Lugar</h4>
                <p className="text-neutral-400 text-sm">Comidas, progreso y rutinas</p>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.1 }} className="px-4 py-2">
                <Users className="w-8 h-8 text-white mx-auto mb-4" />
                <h4 className="font-display text-2xl font-bold text-white uppercase mb-1">Sincronización Total</h4>
                <p className="text-neutral-400 text-sm">Para cliente y entrenador</p>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }} className="px-4 py-2">
                <Activity className="w-8 h-8 text-red-500 mx-auto mb-4" />
                <h4 className="font-display text-2xl font-bold text-white uppercase mb-1">Seguimiento Real</h4>
                <p className="text-neutral-400 text-sm">Cero hojas de Excel perdidas</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* BENEFITS SECTION */}
        <section id="beneficios" className="py-24 px-5 sm:px-8 relative">
          <div className="mx-auto max-w-7xl">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <span className="text-red-500 font-bold tracking-widest text-sm uppercase mb-3 block font-condensed">¿Por qué VITALFIT?</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white uppercase leading-tight">
                Diseñado para la <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-red-500">constancia.</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: LineChart, title: "Progreso Visible", desc: "Calorías, macros y avance semanal en una sola vista clara y motivadora.", color: "text-red-500", bg: "bg-red-500/15" },
                { icon: ShieldCheck, title: "Rutinas Claras", desc: "El cliente sabe qué le toca y el entrenador mantiene una visión ordenada.", color: "text-white", bg: "bg-white/10" },
                { icon: Zap, title: "Menos Fricción", desc: "Abrir la app se siente útil, profesional y fluido. Nada de clicks extra.", color: "text-red-500", bg: "bg-red-500/15" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}
                  className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-red-500/30 transition-all cursor-default"
                >
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", item.bg, item.color)}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-neutral-400 leading-relaxed text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS / DUAL VIEW */}
        <section id="como-funciona" className="py-24 px-5 sm:px-8 bg-gradient-to-b from-transparent to-[#0a0203]">
          <div className="mx-auto max-w-7xl">
             <div className="grid lg:grid-cols-2 gap-16 items-center">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="order-2 lg:order-1">
                  <div className="space-y-8">
                    <div className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 flex items-center justify-center font-display text-2xl font-bold">1</div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">El entrenador te invita</h4>
                        <p className="text-neutral-400">Recibes un código único para enlazar tu perfil con el dashboard de tu preparador de inmediato.</p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 flex items-center justify-center font-display text-2xl font-bold">2</div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">Registras y consultas</h4>
                        <p className="text-neutral-400">Tus metas, comidas y rutinas aparecen en una interfaz limpia, sin distracciones.</p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 flex items-center justify-center font-display text-2xl font-bold">3</div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">Ambos ven el progreso</h4>
                        <p className="text-neutral-400">Tus resultados alimentan el panel de tu entrenador para hacer ajustes precisos y a tiempo.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="order-1 lg:order-2">
                  <div className="rounded-[2.5rem] bg-gradient-to-br from-red-600/30 via-neutral-900 to-[#050505] p-1 border border-red-500/20">
                    <div className="rounded-[2.4rem] border border-white/10 bg-[#070707] p-8 md:p-12 overflow-hidden relative">
                       {/* Background decoration inside card */}
                       <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-600/20 rounded-full blur-[80px]" />
                       
                       <p className="text-red-500 font-bold tracking-widest text-sm uppercase mb-4 font-condensed">La Experiencia VITALFIT</p>
                       <h3 className="font-display text-4xl md:text-5xl font-bold text-white uppercase leading-none mb-6">
                         Más orden.<br/>Mejor trabajo.
                       </h3>
                       <p className="text-neutral-300 text-lg mb-8">
                         La idea es simple: hacer que la plataforma se vea profesional, se sienta moderna y ayude de verdad a mantener el seguimiento del plan sin fricción.
                       </p>

                       <Link href="/register" className="inline-flex items-center gap-2 text-white font-bold hover:text-red-400 transition-colors">
                         Comenzar ahora <ArrowRight className="w-4 h-4" />
                       </Link>
                    </div>
                  </div>
                </motion.div>
             </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-32 px-5 sm:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-600/[0.04]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-red-600/25 blur-[140px] rounded-full pointer-events-none" />
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="mx-auto max-w-4xl text-center relative z-10"
          >
            <h2 className="font-display text-5xl md:text-7xl font-bold text-white uppercase leading-[0.9] mb-6">
              Eleva tu <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white">nivel de juego.</span>
            </h2>
            <p className="text-xl text-neutral-300 mb-10 max-w-2xl mx-auto">
              Tanto si eres entrenador buscando profesionalizar tu servicio, como si eres un atleta listo para su transformación.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-full bg-red-600 hover:bg-red-500 px-8 py-4 text-base font-bold text-white shadow-[0_0_35px_rgba(239,68,68,0.5)] transition-all">
                Crear cuenta
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-bold text-white hover:bg-white/10 transition-colors">
                Iniciar sesión
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#050505] py-8 text-center relative z-10">
        <p className="text-neutral-500 text-sm font-medium">
          © {new Date().getFullYear()} VITALFIT. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}