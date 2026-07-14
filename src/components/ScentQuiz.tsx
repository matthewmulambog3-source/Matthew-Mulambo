import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Candle, PRESET_CANDLES } from "../types";
import { Sparkles, ArrowRight, RotateCcw, Compass, Plus, Lightbulb } from "lucide-react";

interface ScentQuizProps {
  onSelectCandle: (candle: Candle) => void;
  onAddToCart: (candle: Candle) => void;
  formatPrice: (price: number) => string;
}

interface QuizQuestion {
  id: number;
  text: string;
  subtext: string;
  options: {
    label: string;
    value: string;
    icon: string;
    description: string;
  }[];
}

export const ScentQuiz: React.FC<ScentQuizProps> = ({
  onSelectCandle,
  onAddToCart,
  formatPrice,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [recommendation, setRecommendation] = useState<Candle | null>(null);

  const questions: QuizQuestion[] = [
    {
      id: 1,
      text: "How do you want your space to feel?",
      subtext: "Choose the primary emotion or ambiance you'd like to invite in.",
      options: [
        { label: "Focused & Clear", value: "focus", icon: "📚", description: "Enhance deep study sessions, chemistry prep, or reading time." },
        { label: "Relaxed & Serene", value: "relax", icon: "🌅", description: "Unwind after a busy school day and cultivate peaceful calmness." },
        { label: "Warm & Grounded", value: "warm", icon: "🪵", description: "Create a cozy, hospitable shelter reminiscent of rich cedarwood cabins." },
        { label: "Energetic & Fresh", value: "energy", icon: "🍋", description: "Banish fatigue with crisp, stimulating, and positive vibrations." }
      ]
    },
    {
      id: 2,
      text: "Which aroma family naturally draws you in?",
      subtext: "Select the foundational profile you prefer to experience.",
      options: [
        { label: "Fresh & Herbal", value: "fresh", icon: "🌿", description: "Green leaves, pine forests, and cool botanical notes." },
        { label: "Sweet & Floral", value: "floral", icon: "🌸", description: "Damask roses, soothing lavender, and delicate spring blooms." },
        { label: "Rich & Exotic Wood", value: "woody", icon: "🌲", description: "Deep sandalwood, cedar, and complex resinous notes." },
        { label: "Warm & Cozy Spice", value: "spicy", icon: "☕", description: "Grounding vanilla, dark amber, and rich golden honey." }
      ]
    },
    {
      id: 3,
      text: "Where is this scent memory going to live?",
      subtext: "Help us match the diffusion strength with the right room scale.",
      options: [
        { label: "Study Desk / Bedroom", value: "desk", icon: "✍️", description: "Intimate and close-range aromatherapy, perfect for study zones." },
        { label: "Living Room / Common Hall", value: "room", icon: "🛋️", description: "Spacious diffusion that gracefully welcomes guests." },
        { label: "A Soothing Bath Oasis", value: "bath", icon: "🛁", description: "High-humidity space requiring refreshing, clean notes." },
        { label: "As an Encouraging Gift", value: "gift", icon: "🎁", description: "A beautifully balanced, universally loved crowd-pleaser." }
      ]
    }
  ];

  const handleSelectOption = (value: string) => {
    const updatedAnswers = { ...answers, [currentStep]: value };
    setAnswers(updatedAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate Recommendation
      const recommended = calculateRecommendation(updatedAnswers);
      setRecommendation(recommended);
      setCurrentStep(questions.length); // Results step
    }
  };

  const calculateRecommendation = (finalAnswers: Record<number, string>): Candle => {
    const feel = finalAnswers[0];   // focus, relax, warm, energy
    const family = finalAnswers[1]; // fresh, floral, woody, spicy
    const place = finalAnswers[2];  // desk, room, bath, gift

    // Matches with PRESET_CANDLES
    if (feel === "focus" || family === "fresh") {
      // Find Eucalyptus & Wild Mint or similar
      const found = PRESET_CANDLES.find(c => c.name.toLowerCase().includes("eucalyptus") || c.name.toLowerCase().includes("mint"));
      if (found) return found;
    }
    if (feel === "relax" && family === "floral") {
      const found = PRESET_CANDLES.find(c => c.name.toLowerCase().includes("lavender") || c.name.toLowerCase().includes("rose"));
      if (found) return found;
    }
    if (feel === "warm" || family === "woody" || family === "spicy") {
      const found = PRESET_CANDLES.find(c => c.name.toLowerCase().includes("amber") || c.name.toLowerCase().includes("tobacco") || c.name.toLowerCase().includes("oud") || c.name.toLowerCase().includes("vanilla"));
      if (found) return found;
    }
    
    // Default fallback to first preset or most interesting one
    return PRESET_CANDLES[0];
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setRecommendation(null);
  };

  return (
    <div className="w-full bg-gradient-to-br from-brand-cream/40 to-brand-plum/5 border border-brand-plum/10 rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 text-brand-plum/5 pointer-events-none font-serif text-8xl font-bold">
        0{currentStep + 1}
      </div>

      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {currentStep < questions.length ? (
            <motion.div
              key={`question-${currentStep}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-brand-plum text-brand-gold rounded-full shrink-0">
                  <Lightbulb className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-brand-plum/70 font-bold block">
                    Scent Profiler Quiz &bull; Step {currentStep + 1} of {questions.length}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-brand-plum leading-tight">
                    {questions[currentStep].text}
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-500 font-light max-w-xl">
                {questions[currentStep].subtext}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {questions[currentStep].options.map((option) => (
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    key={option.value}
                    onClick={() => handleSelectOption(option.value)}
                    className="flex items-start gap-4 p-5 bg-white hover:bg-brand-cream/10 border border-gray-100 hover:border-brand-plum/30 rounded-2xl text-left transition-all shadow-sm hover:shadow-md cursor-pointer group"
                  >
                    <span className="text-3xl p-2.5 bg-brand-cream/50 rounded-xl group-hover:bg-brand-gold/10 transition-colors">
                      {option.icon}
                    </span>
                    <div className="space-y-1">
                      <span className="font-serif font-bold text-sm text-brand-plum block group-hover:text-brand-plum-dark">
                        {option.label}
                      </span>
                      <span className="text-xs text-gray-400 font-light leading-relaxed block">
                        {option.description}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>

              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="text-xs font-mono font-bold text-brand-plum hover:text-brand-plum-dark uppercase tracking-widest pt-2 flex items-center gap-1.5 cursor-pointer hover:underline"
                >
                  &larr; Go Back
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="quiz-results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              className="text-center space-y-6 py-6"
            >
              <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full mb-2 animate-bounce">
                <Sparkles className="w-10 h-10 text-brand-gold fill-brand-gold/20" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-700 font-bold">
                  Scent Profile Complete!
                </span>
                <h3 className="font-serif text-3xl font-extrabold text-brand-plum mt-1 uppercase tracking-wide">
                  Your Signature Scent Recommendation
                </h3>
              </div>

              {recommendation && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="max-w-xl mx-auto bg-white border border-brand-plum/10 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center gap-6 text-left"
                >
                  {/* Candle Color Icon Indicator */}
                  <div className="w-24 h-24 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner relative" style={{ backgroundColor: `${recommendation.color}15` }}>
                    <div className="w-10 h-14 rounded-t-full rounded-b-lg border-2" style={{ borderColor: recommendation.color, backgroundColor: recommendation.color }}>
                      <div className="w-1 h-3 bg-gray-400 mx-auto -mt-2 rounded-full" />
                    </div>
                    <span className="absolute bottom-2 text-[10px] font-mono uppercase text-gray-400 font-bold">{recommendation.weight}</span>
                  </div>

                  <div className="space-y-2 flex-1">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-brand-gold-dark font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      Ideal For {answers[0] === "focus" ? "Studying & Learning" : "Peaceful Rest"}
                    </span>
                    <h4 className="font-serif text-xl font-bold text-brand-plum uppercase tracking-wider">
                      {recommendation.name}
                    </h4>
                    <p className="text-xs text-gray-500 italic">
                      "{recommendation.tagline}"
                    </p>
                    <p className="text-xs text-gray-400 font-light leading-relaxed">
                      {recommendation.description}
                    </p>

                    <div className="pt-4 flex flex-wrap gap-3 items-center justify-between border-t border-gray-100">
                      <span className="text-lg font-serif italic text-brand-plum font-bold">
                        {formatPrice(recommendation.price)}
                      </span>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => onSelectCandle(recommendation)}
                          className="px-4 py-2 bg-brand-cream text-brand-plum hover:bg-brand-cream-dark transition-all rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Chamber</span>
                        </button>
                        <button
                          onClick={() => onAddToCart(recommendation)}
                          className="px-4 py-2 bg-brand-plum text-white hover:bg-brand-plum-dark transition-all rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer shadow-md"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="pt-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-brand-cream border border-brand-plum/20 hover:bg-brand-cream-dark transition-all rounded-full text-xs uppercase tracking-widest font-bold text-brand-plum inline-flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Scent Quiz</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
