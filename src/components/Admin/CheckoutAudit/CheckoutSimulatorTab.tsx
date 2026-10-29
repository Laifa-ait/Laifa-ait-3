import React from "react";
import { Smartphone, Tablet, Monitor, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface CheckoutSimulatorTabProps {
  deviceSim: "mobile" | "tablet" | "desktop";
  setDeviceSim: (val: "mobile" | "tablet" | "desktop") => void;
}

export const CheckoutSimulatorTab: React.FC<CheckoutSimulatorTabProps> = ({
  deviceSim,
  setDeviceSim,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      <div className="flex gap-2 bg-zinc-100 p-1.5 rounded-2xl w-fit">
        {(
          [
            { id: "mobile", label: "Mobile (440px)", icon: Smartphone },
            { id: "tablet", label: "Tablette (768px)", icon: Tablet },
            { id: "desktop", label: "Desktop (1280px)", icon: Monitor },
          ] as const
        ).map((dev) => {
          const Icon = dev.icon;
          return (
            <button
              key={dev.id}
              onClick={() => setDeviceSim(dev.id)}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer border-none ${
                deviceSim === dev.id
                  ? "bg-[#1A1836] text-white shadow"
                  : "bg-transparent text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {dev.label}
            </button>
          );
        })}
      </div>

      <div className="bg-zinc-100 rounded-3xl p-8 flex justify-center border border-zinc-200">
        <div
          className={`bg-white rounded-[2rem] border-4 border-[#1A1836] shadow-2xl transition-all duration-500 overflow-hidden ${
            deviceSim === "mobile"
              ? "w-[380px] min-h-[540px]"
              : deviceSim === "tablet"
              ? "w-[720px] min-h-[480px]"
              : "w-full min-h-[460px]"
          }`}
        >
          <div className="bg-[#1A1836] text-[#E0B4B2] py-2 px-6 flex justify-between items-center text-[10px]">
            <div className="font-mono">Olmart Checkout Viewport</div>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="w-2 h-2 rounded-full bg-[#E99856]" />
            </div>
          </div>

          <div className="p-6 space-y-5 text-start max-h-[500px] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h4 className="font-sans font-black text-sm uppercase tracking-wider text-[#1A1836]">
                Validation de la Commande
              </h4>
              <span className="text-[10px] font-bold text-[#A54055]">COD - 69 Wilayas</span>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">
                    1
                  </span>
                  <div>
                    <p className="text-xs font-black text-zinc-800">Identité & Coordonnées</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5 tabular-nums">Selma Laifa • 0550 12 34 56</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>

              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">
                    2
                  </span>
                  <div>
                    <p className="text-xs font-black text-zinc-800">Adresse de livraison</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">16 Alger • Hussein Dey</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>

              <div className="p-4 bg-[#A54055]/5 rounded-xl border border-[#A54055]/20 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#A54055] text-white text-[10px] font-black flex items-center justify-center">
                    3
                  </span>
                  <p className="text-xs font-black text-zinc-800">Paiement & Confirmation</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-[10px] leading-relaxed">
                  <p className="font-bold">Paiement à la livraison (Cash on Delivery)</p>
                  <p className="text-emerald-700/80 mt-1">
                    Vous réglez le livreur en espèces à la réception de votre colis.
                  </p>
                </div>

                <div className="border border-zinc-200 rounded-lg p-2.5 bg-white space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center text-white text-[9px] font-bold">
                      ✔
                    </div>
                    <span className="text-[11px] font-bold text-zinc-800">
                      Cible tactile conforme WCAG (44px+)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="bg-[#1A1836] text-white w-full py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest border-none"
                >
                  Confirmer la commande
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
