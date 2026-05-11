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
  ChevronRight,
  LineChart
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useEffect, useState } from "react";
import { CinematicHero } from "@/shared/components/ui/cinematic-landing-hero";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
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
          ? "bg-slate-950/80 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md py-3 px-6" 
          : "bg-transparent border-transparent py-4 px-6"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <span className="font-display text-xl font-bold text-slate-950">P</span>
          </div>
          <span className={cn(
            "font-display uppercase tracking-widest text-sm font-semibold transition-colors duration-300",
            scrolled ? "text-white" : "text-white/90"
          )}>
            Punto de Inflexión
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#beneficios" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Beneficios</Link>
          <Link href="#como-funciona" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Cómo funciona</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Iniciar sesión
          </Link>
          <Link href="/register" className="group relative inline-flex items-center justify-center rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white overflow-hidden border border-white/10 hover:bg-white/15 transition-all">
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
    <div className="min-h-screen bg-slate-950 selection:bg-primary-500/30 selection:text-primary-100 overflow-x-hidden font-sans">
      <Navbar />

      <main className="relative z-10">
        {/* NEW CINEMATIC HERO */}
        <CinematicHero />

        {/* TRUST STATS BANNER */}
        <section className="border-y border-white/5 bg-white/[0.02]">
          <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10 text-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="px-4 py-2">
                <BarChart3 className="w-8 h-8 text-primary-400 mx-auto mb-4" />
                <h4 className="font-display text-2xl font-bold text-white uppercase mb-1">Todo en 1 Lugar</h4>
                <p className="text-slate-400 text-sm">Comidas, progreso y rutinas</p>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.1 }} className="px-4 py-2">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                <h4 className="font-display text-2xl font-bold text-white uppercase mb-1">Sincronización Total</h4>
                <p className="text-slate-400 text-sm">Para cliente y entrenador</p>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }} className="px-4 py-2">
                <Activity className="w-8 h-8 text-orange-400 mx-auto mb-4" />
                <h4 className="font-display text-2xl font-bold text-white uppercase mb-1">Seguimiento Real</h4>
                <p className="text-slate-400 text-sm">Cero hojas de Excel perdidas</p>
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
              <span className="text-primary-400 font-semibold tracking-widest text-sm uppercase mb-3 block">¿Por qué Punto de Inflexión?</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white uppercase leading-tight">
                Diseñado para la <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">constancia.</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: LineChart, title: "Progreso Visible", desc: "Calorías, macros y avance semanal en una sola vista clara y motivadora.", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                { icon: ShieldCheck, title: "Rutinas Claras", desc: "El cliente sabe qué le toca y el entrenador mantiene una visión ordenada.", color: "text-blue-400", bg: "bg-blue-400/10" },
                { icon: Zap, title: "Menos Fricción", desc: "Abrir la app se siente útil, profesional y fluido. Nada de clicks extra.", color: "text-orange-400", bg: "bg-orange-400/10" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}
                  className="group p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-default"
                >
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", item.bg, item.color)}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS / DUAL VIEW */}
        <section id="como-funciona" className="py-24 px-5 sm:px-8 bg-gradient-to-b from-transparent to-slate-900/50">
          <div className="mx-auto max-w-7xl">
             <div className="grid lg:grid-cols-2 gap-16 items-center">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="order-2 lg:order-1">
                  <div className="space-y-8">
                    <div className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-display text-2xl font-bold">1</div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">El entrenador te invita</h4>
                        <p className="text-slate-400">Recibes un código único para enlazar tu perfil con el dashboard de tu preparador de inmediato.</p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-display text-2xl font-bold">2</div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">Registras y consultas</h4>
                        <p className="text-slate-400">Tus metas, comidas y rutinas aparecen en una interfaz limpia, sin distracciones.</p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-display text-2xl font-bold">3</div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">Ambos ven el progreso</h4>
                        <p className="text-slate-400">Tus resultados alimentan el panel de tu entrenador para hacer ajustes precisos y a tiempo.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="order-1 lg:order-2">
                  <div className="rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-slate-950 p-1">
                    <div className="rounded-[2.4rem] border border-white/10 bg-slate-950/80 p-8 md:p-12 overflow-hidden relative">
                       {/* Background decoration inside card */}
                       <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px]" />
                       
                       <p className="text-primary-400 font-semibold tracking-widest text-sm uppercase mb-4">La Experiencia</p>
                       <h3 className="font-display text-4xl md:text-5xl font-bold text-white uppercase leading-none mb-6">
                         Más orden.<br/>Mejor trabajo.
                       </h3>
                       <p className="text-slate-300 text-lg mb-8">
                         La idea es simple: hacer que la plataforma se vea profesional, se sienta moderna y ayude de verdad a mantener el seguimiento del plan sin fricción.
                       </p>

                       <Link href="/register" className="inline-flex items-center gap-2 text-white font-bold hover:text-primary-400 transition-colors">
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
          <div className="absolute inset-0 bg-primary-600/5" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-primary-500/20 blur-[120px] rounded-full pointer-events-none" />
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="mx-auto max-w-4xl text-center relative z-10"
          >
            <h2 className="font-display text-5xl md:text-7xl font-bold text-white uppercase leading-[0.9] mb-6">
              Eleva tu <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">nivel de juego.</span>
            </h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Tanto si eres entrenador buscando profesionalizar tu servicio, como si eres un cliente listo para su transformación.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-full bg-primary-500 hover:bg-primary-400 px-8 py-4 text-base font-bold text-slate-950 transition-colors">
                Crear cuenta
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-full border border-white/20 bg-transparent px-8 py-4 text-base font-bold text-white hover:bg-white/5 transition-colors">
                Iniciar sesión
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-slate-950 py-8 text-center relative z-10">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} Punto de Inflexión. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}