import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Check, Phone, ArrowRight, ShieldCheck, CreditCard, Wifi } from "lucide-react";

interface TapToPayProps {
  totalAmount: number;
  formatPrice: (price: number) => string;
  onPaymentSuccess: (details: { method: string; transactionId: string }) => void;
  onClose: () => void;
}

export const TapToPay: React.FC<TapToPayProps> = ({
  totalAmount,
  formatPrice,
  onPaymentSuccess,
  onClose,
}) => {
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcScanning, setNfcScanning] = useState(false);
  const [nfcStatus, setNfcStatus] = useState<"idle" | "listening" | "processing" | "success" | "error">("idle");
  const [log, setLog] = useState("Tap your physical card or phone's NFC area against the top of your screen.");
  
  // Check NFC support on mount
  useEffect(() => {
    if ("NDEFReader" in window) {
      setNfcSupported(true);
    }
  }, []);

  const playSuccessChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Beep 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain1.gain.setValueAtTime(0.1, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.12);

      // Beep 2 (higher, delayed)
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(1318.51, ctx.currentTime); // E6 note
        gain2.gain.setValueAtTime(0.1, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.25);
      }, 100);
    } catch (e) {
      console.warn("Audio Context sound blocked or not supported yet", e);
    }
  };

  const handleSuccess = (isMock = false) => {
    setNfcStatus("processing");
    setLog("Authorizing secure contactless transaction...");
    
    setTimeout(() => {
      setNfcStatus("success");
      playSuccessChime();
      setLog("Payment Approved! Handshake recorded.");
      
      setTimeout(() => {
        const tId = `NFC-${Math.floor(1000000 + Math.random() * 9000000)}`;
        onPaymentSuccess({
          method: isMock ? "NFC Contactless (Simulated)" : "NFC Contactless (Physical)",
          transactionId: tId
        });
      }, 1500);
    }, 1800);
  };

  const startNfcRead = async () => {
    if (!nfcSupported) return;
    try {
      setNfcStatus("listening");
      setLog("Initializing native NFC reader... Hold card near.");
      
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();
      setNfcScanning(true);
      
      ndef.addEventListener("reading", ({ serialNumber }: any) => {
        setLog(`Card read successful! (Serial: ${serialNumber})`);
        handleSuccess(false);
      });
      
      ndef.addEventListener("readingerror", () => {
        setNfcStatus("error");
        setLog("NFC Read Error. Please hold the card steady and try again.");
      });
    } catch (error: any) {
      console.error(error);
      setNfcStatus("error");
      setLog(`Could not access NFC: ${error.message || error}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="bg-white max-w-md w-full border border-brand-plum/20 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-brand-plum text-sm font-bold cursor-pointer"
          disabled={nfcStatus === "processing"}
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-brand-gold-dark font-bold bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            Stage 9 Contactless Pay
          </span>
          <h3 className="font-serif text-2xl font-extrabold text-brand-plum">
            Tap to Pay Terminal
          </h3>
          <p className="text-xs text-gray-500 font-light">
            Supporting contactless credit cards, smartwatches, Apple Pay, and Google Pay
          </p>
        </div>

        {/* Active Simulation Ring Area */}
        <div className="relative h-60 w-full bg-brand-cream/20 border border-brand-plum/10 rounded-2xl flex flex-col items-center justify-center overflow-hidden mb-6">
          
          {/* NFC Pulsing Signal Animation */}
          {nfcStatus === "listening" || nfcStatus === "idle" ? (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="absolute w-24 h-24 bg-brand-plum/10 border border-brand-plum/20 rounded-full animate-ping" />
              <span className="absolute w-40 h-40 bg-brand-plum/5 border border-brand-plum/10 rounded-full animate-ping [animation-delay:0.5s]" />
              <span className="absolute w-56 h-56 bg-brand-plum/5 border border-brand-plum/10 rounded-full animate-ping [animation-delay:1s]" />
            </div>
          ) : null}

          {/* Display different states */}
          <AnimatePresence mode="wait">
            {nfcStatus === "idle" && (
              <motion.div
                key="state-idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center space-y-4"
              >
                <div className="p-4 bg-brand-plum text-white rounded-full relative">
                  <Wifi className="w-10 h-10 rotate-90" />
                </div>
                <button
                  onClick={nfcSupported ? startNfcRead : () => handleSuccess(true)}
                  className="px-6 py-2.5 bg-brand-plum text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-brand-plum-dark shadow-md cursor-pointer flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-brand-gold" />
                  <span>{nfcSupported ? "Activate NFC Sensor" : "Initialize Payment"}</span>
                </button>
              </motion.div>
            )}

            {nfcStatus === "listening" && (
              <motion.div
                key="state-listening"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center space-y-3 z-10"
              >
                {/* Credit Card Illustration */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="w-40 h-24 bg-gradient-to-tr from-brand-plum to-brand-plum-dark text-white p-4 rounded-xl shadow-xl flex flex-col justify-between border border-brand-gold/20"
                >
                  <div className="flex justify-between items-start">
                    <Wifi className="w-5 h-5 rotate-90 text-brand-gold" />
                    <span className="text-[7px] font-mono tracking-widest uppercase text-brand-gold">STAGE 9</span>
                  </div>
                  <div className="w-6 h-5 bg-brand-gold/30 rounded-md border border-brand-gold/20" />
                  <div className="flex justify-between items-end">
                    <span className="text-[8px] font-mono">•••• •••• •••• 2026</span>
                    <span className="text-[7px] uppercase font-bold text-brand-gold">PRESTIGE</span>
                  </div>
                </motion.div>
                <span className="text-xs font-semibold text-brand-plum animate-pulse">
                  Awaiting Device Tap...
                </span>
              </motion.div>
            )}

            {nfcStatus === "processing" && (
              <motion.div
                key="state-processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center space-y-4"
              >
                <div className="w-12 h-12 border-4 border-brand-plum border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-gray-500 font-mono">
                  Decrypting NFC payload...
                </span>
              </motion.div>
            )}

            {nfcStatus === "success" && (
              <motion.div
                key="state-success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center space-y-3 text-center p-4"
              >
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                  <Check className="w-10 h-10 animate-bounce" />
                </div>
                <h4 className="font-serif font-bold text-emerald-800 text-lg">Transaction Cleared</h4>
                <p className="text-[10px] text-gray-400 font-mono">
                  Encrypted authorization token verified.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Message Log */}
        <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-center text-xs text-gray-500 leading-relaxed font-mono">
          {log}
        </div>

        {/* Amount Summary */}
        <div className="flex justify-between items-center py-4 border-b border-t border-gray-100 my-4 text-sm">
          <span className="text-gray-400 font-medium">Payable Balance:</span>
          <span className="text-lg font-serif font-extrabold text-brand-plum">{formatPrice(totalAmount)}</span>
        </div>

        {/* Trigger Demo / Mock Button for Non-NFC Devices */}
        {nfcStatus === "listening" && (
          <button
            onClick={() => handleSuccess(true)}
            className="w-full py-3 bg-brand-cream border border-brand-plum/20 hover:bg-brand-cream-dark text-brand-plum text-xs font-bold uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-brand-gold fill-brand-gold/30" />
            <span>Simulate Contactless Tap</span>
          </button>
        )}

        <div className="flex justify-center items-center gap-1 text-[10px] text-gray-400 mt-4 font-light">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>PCI-DSS Compliant End-to-End Encryption</span>
        </div>
      </motion.div>
    </div>
  );
};
