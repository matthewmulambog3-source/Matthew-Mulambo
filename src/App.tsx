import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { 
  Candle, 
  CartItem, 
  PRESET_CANDLES, 
  SCENT_OPTIONS, 
  VESSEL_OPTIONS, 
  WICK_OPTIONS, 
  ScentOption, 
  VesselOption, 
  WickOption,
  StudentOrder
} from "./types";
import { CandleVisualizer } from "./components/CandleVisualizer";
import { InteractiveCandle3D } from "./components/InteractiveCandle3D";
import { PrestigeCrest } from "./components/PrestigeCrest";
import { ScentQuiz } from "./components/ScentQuiz";
import { TapToPay } from "./components/TapToPay";
import { SchoolWebmail } from "./components/SchoolWebmail";
import { FireplaceSynthesizer } from "./lib/audio";
import { 
  ShoppingBag, 
  Flame, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ArrowRight, 
  Info, 
  Plus, 
  Minus, 
  Trash2, 
  Compass, 
  Settings, 
  RotateCcw,
  RotateCw,
  Bell,
  Check,
  Heart,
  GraduationCap,
  Award,
  ClipboardList,
  Mail,
  Phone,
  MapPin,
  User,
  Clock,
  BookOpen,
  ShieldCheck,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  AlertTriangle
} from "lucide-react";

export default function App() {
  // Sound System
  const synthRef = useRef<FireplaceSynthesizer | null>(null);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [soundVolume, setSoundVolume] = useState(0.5);

  // Currency System
  const [currency, setCurrency] = useState<"MZN" | "USD">("MZN");
  const EXCHANGE_RATE = 64; // 1 USD = 64 MZN

  const formatPrice = (usdAmount: number) => {
    if (currency === "MZN") {
      const mznAmount = Math.round(usdAmount * EXCHANGE_RATE);
      return `${mznAmount.toLocaleString("pt-MZ")} MT`;
    }
    return `$${usdAmount}`;
  };

  // App States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCandle, setActiveCandle] = useState<Candle>(PRESET_CANDLES[0]);
  const [isLit, setIsLit] = useState(false);
  
  // Custom Scent Builder State
  const [builderTop, setBuilderTop] = useState<ScentOption>(
    SCENT_OPTIONS.find(o => o.category === "Top") || SCENT_OPTIONS[8]
  );
  const [builderHeart, setBuilderHeart] = useState<ScentOption>(
    SCENT_OPTIONS.find(o => o.category === "Heart") || SCENT_OPTIONS[4]
  );
  const [builderBase, setBuilderBase] = useState<ScentOption>(
    SCENT_OPTIONS.find(o => o.category === "Base") || SCENT_OPTIONS[0]
  );
  const [builderVessel, setBuilderVessel] = useState<VesselOption>(VESSEL_OPTIONS[0]);
  const [builderWick, setBuilderWick] = useState<WickOption>(WICK_OPTIONS[0]);
  const [builderName, setBuilderName] = useState("Amber Woods");

  // AI Scent Sommelier State
  const [sommelierMood, setSommelierMood] = useState("");
  const [sommelierSetting, setSommelierSetting] = useState("");
  const [sommelierPrefs, setSommelierPrefs] = useState("");
  const [isSommelierLoading, setIsSommelierLoading] = useState(false);
  const [sommelierResult, setSommelierResult] = useState<Candle | null>(null);
  const [sommelierError, setSommelierError] = useState<string | null>(null);

  // Notifications
  const [notification, setNotification] = useState<string | null>(null);

  // Student Order System States
  const [placedOrders, setPlacedOrders] = useState<StudentOrder[]>(() => {
    try {
      const saved = localStorage.getItem("prestige_student_orders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("STUDENT"); // Auto-assigned
  const [studentEmail, setStudentEmail] = useState("");
  const [gradeClass, setGradeClass] = useState("Tiny Tots");
  const [deliveryMethod, setDeliveryMethod] = useState("School Premises (Face-to-Face Handover)");
  const [studentNotes, setStudentNotes] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [isCheckoutFormOpen, setIsCheckoutFormOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<"cash" | "mpesa" | "emola" | "mcash">("cash");
  const [buyerPaymentPhone, setBuyerPaymentPhone] = useState("");
  const [adminPaymentChannel, setAdminPaymentChannel] = useState<"M-Pesa" | "e-Mola" | "m-Kesh" | "Cash">(() => {
    try {
      return (localStorage.getItem("admin_payment_channel") as any) || "M-Pesa";
    } catch {
      return "M-Pesa";
    }
  });
  const [adminPaymentNumber, setAdminPaymentNumber] = useState(() => {
    try {
      return localStorage.getItem("admin_payment_number") || "+258 84 123 4567";
    } catch {
      return "+258 84 123 4567";
    }
  });
  const [isTapToPayOpen, setIsTapToPayOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"studio" | "marketplace" | "registry" | "ads">("studio");
  const VIEWS = ["studio", "marketplace", "registry", "ads"] as const;
  const activeIndex = VIEWS.indexOf(currentView);
  const [presetFilter, setPresetFilter] = useState<"All" | "Prestige Heritage" | "Scholastic Scholar" | "Coastal & Nature">("All");

  // Dynamic Scent Comments & Suggestions Review State
  const [commentsList, setCommentsList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("prestige_scent_comments");
      return saved ? JSON.parse(saved) : [
        {
          id: "c1",
          candleId: "royal-crown",
          author: "Afonso (Grade 12)",
          rating: 5,
          comment: "I bought this during our Science Fair! It has a very elegant citrus opening, and the crackle is so cozy while studying.",
          suggestion: "Maybe add a bit more vanilla next time!",
          timestamp: "2026-07-10"
        },
        {
          id: "c2",
          candleId: "royal-crown",
          author: "Maria S. (Grade 10)",
          rating: 5,
          comment: "Smells so rich and presidential! My mom wants three more for her living room.",
          suggestion: "Can you make a smaller travel size?",
          timestamp: "2026-07-11"
        },
        {
          id: "c3",
          candleId: "starry-wisdom",
          author: "Dr. Tembe (Chemistry Teacher)",
          rating: 5,
          comment: "Perfect peppermint ratio. Keeps the students focused and awake during my morning organic synthesis lectures.",
          suggestion: "Maybe introduce a lavender-mint combo.",
          timestamp: "2026-07-12"
        },
        {
          id: "c4",
          candleId: "scholastic-laurel",
          author: "Elena (Grade 11)",
          rating: 5,
          comment: "It literally smells like antique library pages mixed with fresh roses. Best study vibe.",
          suggestion: "Add more cedarwood base!",
          timestamp: "2026-07-13"
        }
      ];
    } catch {
      return [];
    }
  });

  // Dynamic Scent Catalog (Admin editable)
  const [candlesList, setCandlesList] = useState<Candle[]>(() => {
    try {
      const saved = localStorage.getItem("prestige_candles_list");
      return saved ? JSON.parse(saved) : PRESET_CANDLES;
    } catch {
      return PRESET_CANDLES;
    }
  });

  // Admin Panel Controls State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [editingCandleId, setEditingCandleId] = useState<string | null>(null);
  const [editCandleName, setEditCandleName] = useState("");
  const [editCandleTagline, setEditCandleTagline] = useState("");
  const [editCandlePrice, setEditCandlePrice] = useState(30);
  const [editCandleDesc, setEditCandleDesc] = useState("");
  const [editCandleColor, setEditCandleColor] = useState("#D4AF37");
  const [editCandleImage, setEditCandleImage] = useState("");
  const [editCandleStock, setEditCandleStock] = useState(10);
  const [editCandle3D, setEditCandle3D] = useState(true);
  const [showAddNewForm, setShowAddNewForm] = useState(false);

  // New Candle Fields (Admin creation)
  const [newCandleName, setNewCandleName] = useState("");
  const [newCandleTagline, setNewCandleTagline] = useState("");
  const [newCandlePrice, setNewCandlePrice] = useState(30);
  const [newCandleDesc, setNewCandleDesc] = useState("");
  const [newCandleColor, setNewCandleColor] = useState("#D4AF37");
  const [newCandleStock, setNewCandleStock] = useState(10);
  const [newCandleImage, setNewCandleImage] = useState("");
  const [newCandleCollection, setNewCandleCollection] = useState<"Prestige Heritage" | "Scholastic Scholar" | "Coastal & Nature">("Prestige Heritage");

  // Scent Matcher Quiz State
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<Candle | null>(null);

  // Face-to-Face Order Handover State
  const [liveF2FNotification, setLiveF2FNotification] = useState<StudentOrder | null>(null);
  const [feedbackPopupOrder, setFeedbackPopupOrder] = useState<StudentOrder | null>(null);

  // Live feedback inputs
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSuggestion, setFeedbackSuggestion] = useState("");
  const [feedbackAuthor, setFeedbackAuthor] = useState("");

  // Subtle Scrolling Ticker State
  const [tickerActive, setTickerActive] = useState(true);

  // Notices / Ticker State with horizontal scrolling & controls
  const [notices, setNotices] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("prestige_notices_list");
      return saved ? JSON.parse(saved) : [
        "🏆 Prestige Chess Knights capture provincial championship! Congratulations to our grandmasters!",
        "🔬 Admissions open for Academic Year 2026/2027. Enroll your child in Beira's leading international academy.",
        "🌟 Grade 12 Scholar project on eco-perfumery receives honorary award from Sofala Governor."
      ];
    } catch {
      return [
        "🏆 Prestige Chess Knights capture provincial championship! Congratulations to our grandmasters!",
        "🔬 Admissions open for Academic Year 2026/2027. Enroll your child in Beira's leading international academy.",
        "🌟 Grade 12 Scholar project on eco-perfumery receives honorary award from Sofala Governor."
      ];
    }
  });

  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
  const [isTickerPlaying, setIsTickerPlaying] = useState(true);

  // Sync notices list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("prestige_notices_list", JSON.stringify(notices));
    } catch {}
  }, [notices]);

  // Notice auto-cycling timer effect
  useEffect(() => {
    if (!isTickerPlaying || notices.length === 0) return;
    const timer = setInterval(() => {
      setCurrentNoticeIndex((prev) => (prev + 1) % notices.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isTickerPlaying, notices.length]);

  // Local storage synchronization
  useEffect(() => {
    try {
      localStorage.setItem("prestige_candles_list", JSON.stringify(candlesList));
    } catch {}
  }, [candlesList]);

  useEffect(() => {
    try {
      localStorage.setItem("prestige_scent_comments", JSON.stringify(commentsList));
    } catch {}
  }, [commentsList]);

  useEffect(() => {
    try {
      localStorage.setItem("prestige_student_orders", JSON.stringify(placedOrders));
    } catch (e) {
      console.error("Failed to persist student orders", e);
    }
  }, [placedOrders]);

  // Web Audio double note order notification chime (100% offline compatible)
  const playOrderChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
      
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc2.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.15); // B5
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.55);
      osc2.stop(ctx.currentTime + 0.55);
    } catch (e) {
      console.warn("Chime playback skipped", e);
    }
  };

  // Handle student checkout submission with Mozambican Mobile Money
  const handlePlaceStudentOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      triggerNotification("Please fill in your Full Name.");
      return;
    }
    if (!gradeClass) {
      triggerNotification("Please select your Grade/Class.");
      return;
    }

    let resolvedPaymentMethod = "Cash (F2F)";
    let detailsNote = "Face-to-Face cash payment at school premises.";

    if (paymentType !== "cash") {
      if (!buyerPaymentPhone.trim()) {
        triggerNotification(`Please enter your phone number to confirm the ${paymentType.toUpperCase()} transfer.`);
        return;
      }
      const carrierName = paymentType === "mpesa" ? "M-Pesa" : paymentType === "emola" ? "e-Mola" : "m-Kesh";
      resolvedPaymentMethod = carrierName;
      detailsNote = `Mobile Money transfer from buyer's number: ${buyerPaymentPhone.trim()} to Admin's registered channel.`;
    }

    // Capture the cart items
    const orderedItems = [...cart];

    const newOrder: StudentOrder = {
      orderId: `PS-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      studentName: studentName.trim(),
      studentId: studentId.trim() || "STUDENT",
      studentEmail: studentEmail.trim() || `${studentName.trim().toLowerCase().replace(/[^a-z]/g, "")}@prestigeacademy.edu`,
      gradeClass,
      deliveryMethod: "School Premises (Face-to-Face Handover)",
      notes: studentNotes.trim() ? `${studentNotes.trim()} | ${detailsNote}` : detailsNote,
      items: orderedItems,
      total: cartTotal,
      currency,
      timestamp: new Date().toLocaleString("pt-MZ"),
      paymentMethod: resolvedPaymentMethod,
      transactionId: paymentType !== "cash" ? buyerPaymentPhone.trim() : undefined,
      deliveryStatus: "pending"
    };

    // Decrement inventory/stock for each candle in cart
    setCandlesList((prevList) => {
      return prevList.map((candle) => {
        const cartItem = orderedItems.find((item) => item.candle.id === candle.id);
        if (cartItem && candle.stockCount !== undefined) {
          return {
            ...candle,
            stockCount: Math.max(0, candle.stockCount - cartItem.quantity)
          };
        }
        return candle;
      });
    });

    setPlacedOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setIsCartOpen(false);
    setIsCheckoutFormOpen(false);
    
    // Play chime and notify seller
    playOrderChime();
    setLiveF2FNotification(newOrder);

    // Trigger celebratory success fireworks animation
    try {
      // 1. Initial rich central blast with brand-matching colors (Plum, Gold, Emerald)
      confetti({
        particleCount: 150,
        spread: 85,
        origin: { y: 0.65 },
        colors: ["#8A1540", "#D4AF37", "#10B981", "#3B82F6", "#F59E0B"]
      });

      // 2. Multi-angle side fireworks sequence for a truly rewarding premium feel
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 28, spread: 360, ticks: 55, zIndex: 10000 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }
        const particleCount = 40 * (timeLeft / duration);
        // Launch from left area
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.15, 0.35), y: Math.random() - 0.15 } 
        });
        // Launch from right area
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.65, 0.85), y: Math.random() - 0.15 } 
        });
      }, 250);
    } catch (err) {
      console.warn("Celebration fireworks skipped", err);
    }

    // Push dynamic order alert notice into our live scrolling notification bar
    const orderAlertNotice = `🎉 [Live Order Alert] ${newOrder.studentName} of Class ${newOrder.gradeClass} just placed order ${newOrder.orderId} for ${formatPrice(newOrder.total)}!`;
    setNotices((prev) => [orderAlertNotice, ...prev]);
    setCurrentNoticeIndex(0); // Focus on the newly placed order alert immediately!

    // Reset form
    setStudentName("");
    setBuyerPaymentPhone("");
    setStudentNotes("");

    triggerNotification(`Success! Order ${newOrder.orderId} placed via ${resolvedPaymentMethod}.`);
    setCurrentView("registry"); // Show registry to let student verify their order
  };

  const handleNfcPaymentSuccess = (details: { method: string; transactionId: string }) => {
    // Keep as fallback or log
    console.log("NFC payment details", details);
  };

  // Lazy initialize procedural synthesizer
  useEffect(() => {
    synthRef.current = new FireplaceSynthesizer();
    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
      }
    };
  }, []);

  // Sync isLit state with Audio Synthesizer
  useEffect(() => {
    if (synthRef.current) {
      if (isLit) {
        synthRef.current.start();
        setIsPlayingSound(true);
      } else {
        synthRef.current.stop();
        setIsPlayingSound(false);
      }
    }
  }, [isLit]);

  // Adjust synthesizer volume
  const handleVolumeChange = (vol: number) => {
    setSoundVolume(vol);
    if (synthRef.current) {
      synthRef.current.setVolume(vol);
    }
  };

  // Toggle ambient fire crackle manually
  const toggleSound = () => {
    if (!synthRef.current) return;
    if (isPlayingSound) {
      synthRef.current.stop();
      setIsPlayingSound(false);
      setIsLit(false); // Extinguish candle if sound turned off
    } else {
      synthRef.current.start();
      setIsPlayingSound(true);
      setIsLit(true); // Light candle if sound turned on
    }
  };

  // Trigger a brief UI toast notification
  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Cart Management
  const addToCart = (candle: Candle) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.candle.id === candle.id);
      if (existing) {
        return prev.map((item) =>
          item.candle.id === candle.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { candle, quantity: 1 }];
    });
    triggerNotification(`"${candle.name}" added to your curated order.`);
  };

  const buyNow = (candle: Candle) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.candle.id === candle.id);
      if (existing) {
        // If already in cart, make sure it is at least 1
        return prev;
      }
      return [...prev, { candle, quantity: 1 }];
    });
    setIsCheckoutFormOpen(true);
    triggerNotification(`Proceeding to checkout with "${candle.name}"!`);
  };

  const removeFromCart = (candleId: string) => {
    setCart((prev) => prev.filter((item) => item.candle.id !== candleId));
  };

  const updateQuantity = (candleId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.candle.id === candleId) {
            const newQty = item.quantity + delta;
            return { ...item, quantity: Math.max(1, newQty) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.candle.price * item.quantity,
    0
  );

  // Load Preset as Featured Candle
  const selectActiveCandle = (candle: Candle) => {
    setActiveCandle(candle);
    setIsLit(false); // Reset lit status on change for fresh experience
    // Scroll smoothly to spotlight section
    const spotlightEl = document.getElementById("spotlight-section");
    if (spotlightEl) {
      spotlightEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Build Bespoke Candle
  const handleBuildBespoke = () => {
    const calculatedPrice = 38 + builderVessel.priceModifier + builderWick.priceModifier;
    
    // Mix representative colors based on scent selections
    const baseColor = builderBase.color;
    const heartColor = builderHeart.color;
    const topColor = builderTop.color;
    
    // Helper to blend 3 hex colors roughly
    const blendHexColors = (c1: string, c2: string, c3: string): string => {
      const parseHex = (hex: string) => {
        const val = hex.replace("#", "");
        return {
          r: parseInt(val.substring(0, 2), 16),
          g: parseInt(val.substring(2, 4), 16),
          b: parseInt(val.substring(4, 6), 16),
        };
      };
      const color1 = parseHex(c1);
      const color2 = parseHex(c2);
      const color3 = parseHex(c3);

      const r = Math.round((color1.r + color2.r + color3.r) / 3);
      const g = Math.round((color1.g + color2.g + color3.g) / 3);
      const b = Math.round((color1.b + color2.b + color3.b) / 3);

      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    };

    const mixedColor = blendHexColors(baseColor, heartColor, topColor);

    const customCandle: Candle = {
      id: `custom-${Date.now()}`,
      name: builderName.trim() || "Bespoke Alchemy",
      tagline: "Your Personal Fragrance Portrait",
      description: `A masterfully self-designed sensory creation. Blends the immediate, refreshing top presence of ${builderTop.name}, a core body of ${builderHeart.name}, and the grounding, lingering trail of ${builderBase.name}. Hand-poured into a premium ${builderVessel.name} vessel.`,
      price: calculatedPrice,
      topNotes: [builderTop.name],
      heartNotes: [builderHeart.name],
      baseNotes: [builderBase.name],
      color: mixedColor,
      vessel: builderVessel.name,
      wick: builderWick.name,
      rating: 5.0,
      reviewsCount: 1,
      burnTime: "60-70 Hours",
      weight: "9.5 oz / 270g",
      category: "Bespoke"
    };

    setActiveCandle(customCandle);
    setIsLit(true); // Light up custom creations!
    triggerNotification(`Successfully blended "${customCandle.name}"! Feel free to burn it.`);
    selectActiveCandle(customCandle);
  };

  // Consult Gemini Scent Sommelier
  const handleConsultSommelier = async () => {
    if (!sommelierMood.trim() && !sommelierSetting.trim() && !sommelierPrefs.trim()) {
      setSommelierError("Please tell us a bit about your current mood, ideal setting, or specific ingredient wishes.");
      return;
    }

    setIsSommelierLoading(true);
    setSommelierError(null);

    try {
      const response = await fetch("/api/sommelier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mood: sommelierMood,
          setting: sommelierSetting,
          customPreferences: sommelierPrefs,
        }),
      });

      if (!response.ok) {
        throw new Error("Fragrance Sommelier was unable to complete recommendation.");
      }

      const rawCandle = await response.json();
      
      const sommelierCandle: Candle = {
        id: `sommelier-${Date.now()}`,
        name: rawCandle.name,
        tagline: "AI Scent Sommelier Personalized Blend",
        description: rawCandle.description,
        price: 42, // Premium price for custom AI consultation
        topNotes: rawCandle.topNotes,
        heartNotes: rawCandle.heartNotes,
        baseNotes: rawCandle.baseNotes,
        color: rawCandle.color || "#dfbda0",
        vessel: rawCandle.vessel || "Matte Ceramic Slate",
        wick: rawCandle.wick || "Wooden Wick (Crackling)",
        rating: 5.0,
        reviewsCount: 1,
        burnTime: "65-75 Hours",
        weight: "10.0 oz / 285g",
        category: "AI Scent Selection"
      };

      setSommelierResult(sommelierCandle);
      setActiveCandle(sommelierCandle);
      setIsLit(true); // Light the customized creation right away!
      triggerNotification(`The Sommelier formulated "${sommelierCandle.name}" for your mood.`);
      
      // Auto scroll to showcase
      selectActiveCandle(sommelierCandle);
    } catch (err: any) {
      console.error(err);
      setSommelierError("An error occurred while blending your scent profile. Please try again.");
    } finally {
      setIsSommelierLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream/20 text-[#2A2624] font-sans flex flex-col selection:bg-brand-plum/10 relative overflow-x-hidden">
      
      {/* Floating Admin Toggle Settings Icon - Placed at Top Right of Viewport */}
      <button
        onClick={() => {
          setIsAdminMode(!isAdminMode);
          triggerNotification(!isAdminMode ? "Entered Seller Admin Mode!" : "Exited Seller Admin Mode");
        }}
        className={`fixed top-3 right-3 sm:top-4 sm:right-4 z-50 p-2.5 rounded-full border transition-all duration-300 shadow-xl flex items-center justify-center cursor-pointer group ${
          isAdminMode 
            ? "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700 hover:scale-115 active:scale-95 animate-pulse" 
            : "bg-white/95 hover:bg-brand-cream text-brand-plum border-brand-gold/40 hover:border-brand-gold hover:scale-115 active:scale-95"
        }`}
        title={isAdminMode ? "Exit Seller Admin Mode" : "Enter Seller Admin Mode"}
        aria-label="Toggle Admin Mode"
        id="admin-settings-toggle-btn"
      >
        <Settings className={`w-5 h-5 ${isAdminMode ? "animate-spin text-white" : "text-brand-plum group-hover:rotate-90 transition-transform duration-500"}`} />
        <span className="sr-only">Toggle Admin Mode</span>
        {/* Hover label for intuitive discovery */}
        <span className="absolute right-12 bg-brand-plum-dark text-white text-[9px] uppercase font-bold tracking-[0.15em] px-2.5 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-brand-gold/30">
          {isAdminMode ? "Admin Active" : "Seller Admin Settings"}
        </span>
      </button>

      {/* Toast Notification - Relocated to Bottom Right to ensure absolutely clean Top Area */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-plum-dark text-[#FDFCFB] text-xs font-mono tracking-wider px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-brand-gold/30 animate-fade-in">
          <Sparkles className="w-4 h-4 text-brand-gold animate-spin" />
          <span>{notification}</span>
        </div>
      )}

      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-brand-plum-dark text-white text-[10px] tracking-[0.25em] uppercase text-center py-2.5 font-light px-4 border-b border-white/5 flex justify-between items-center">
        <span className="hidden md:inline">Complimentary School Delivery on Orders Over {formatPrice(50)}</span>
        <span className="mx-auto md:mx-0">Empowering Young Minds Through Organic Chemistry & Commerce</span>
        <span className="hidden md:inline">Prestige Young Entrepreneurs Initiative</span>
      </div>

      {/* STAGE 9 SCENT STUDIO BRAND BANNER */}
      <div className="bg-brand-plum text-white border-b border-brand-gold/20 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <PrestigeCrest size="sm" className="shrink-0 drop-shadow-lg" />
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                <span className="text-[10px] uppercase tracking-[0.35em] text-brand-gold font-bold">Official School Scent Initiative</span>
                <span className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                <span className="text-[10px] text-pink-100 font-mono tracking-widest uppercase">Beira, Mozambique</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#FDFCFB] uppercase tracking-wider">
                Stage 9 <span className="text-brand-gold italic">Scent Studio</span>
              </h1>
              <p className="text-xs text-pink-100/80 max-w-xl mt-1.5 font-light leading-relaxed">
                In partnership with Prestige School. A collaborative student enterprise combining organic chemistry, master perfumery, and young business skills. Design your customized scent memory, or order premium house collections!
              </p>
            </div>
          </div>

          {/* Contact panel from logo details with rounded-2xl */}
          <div className="flex flex-col items-center lg:items-end text-center lg:text-right text-xs text-pink-100/90 font-mono bg-brand-plum-dark/40 p-5 rounded-2xl border border-brand-gold/15 gap-1.5 max-w-sm w-full lg:w-auto shadow-inner">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-brand-gold shrink-0" />
              <a href="mailto:prestigeschoolbeira@gmail.com" className="hover:underline hover:text-brand-gold text-[11px]">
                prestigeschoolbeira@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-brand-gold shrink-0" />
              <span className="hover:text-brand-gold text-[11px]">(+258) 844443179 | 86-744-3179</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-pink-100/60 mt-0.5">
              <MapPin className="w-3 h-3 text-brand-gold shrink-0" />
              <span>Moçambique-Sofala-Beira-Macuti</span>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION BAR & TAB SYSTEM */}
      <nav className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-4 border-b border-[#EBE6E0] bg-white sticky top-0 z-40 backdrop-blur-md shadow-sm gap-4 rounded-b-2xl">
        
        {/* Tab System with rounded buttons (WhatsApp-style smooth indicator tabs) */}
        <div className="flex flex-wrap gap-2 pb-2 md:pb-0 w-full md:w-auto justify-center">
          <button
            onClick={() => setCurrentView("studio")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all cursor-pointer ${
              currentView === "studio"
                ? "bg-brand-plum text-white border border-brand-plum shadow-md"
                : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 hover:text-brand-plum"
            }`}
          >
            <GraduationCap className="w-4 h-4 text-brand-gold animate-pulse" />
            <span>Scent Studio</span>
          </button>

          <button
            onClick={() => setCurrentView("marketplace")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all cursor-pointer ${
              currentView === "marketplace"
                ? "bg-brand-plum text-white border border-brand-plum shadow-md"
                : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 hover:text-brand-plum"
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-brand-gold" />
            <span>Marketplace</span>
          </button>
          
          <button
            onClick={() => setCurrentView("registry")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs uppercase tracking-widest font-bold transition-all relative cursor-pointer ${
              currentView === "registry"
                ? "bg-brand-plum text-white border-brand-plum shadow-md"
                : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-brand-plum"
            }`}
          >
            <ClipboardList className="w-4 h-4 text-brand-gold" />
            <span>Order Registry</span>
            {placedOrders.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-brand-gold text-brand-plum text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm">
                {placedOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentView("ads")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all cursor-pointer ${
              currentView === "ads"
                ? "bg-brand-plum text-white border border-brand-plum shadow-md"
                : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 hover:text-brand-plum"
            }`}
          >
            <Award className="w-4 h-4 text-brand-gold" />
            <span>School Bulletin</span>
          </button>
        </div>

        {/* Dynamic Navigation Subtext or Admin Mode Status Badge */}
        <div className="flex space-x-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-gray-500 items-center">
          {isAdminMode && (
            <span className="px-3 py-1.5 border bg-emerald-50 border-emerald-300 text-emerald-800 font-bold text-[9px] tracking-widest uppercase rounded-lg">
              🟢 Admin Active
            </span>
          )}
          
          <span className="text-[9px] text-[#A69E96] font-mono hidden lg:inline">
            SWIPE TO NAVIGATE →
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-center md:justify-end">
          {/* Currency Toggle in a fully rounded pill */}
          <div className="flex items-center border border-[#D9D3CC] p-0.5 bg-[#EBE6E0]/40 text-[9px] font-mono tracking-widest font-bold rounded-full overflow-hidden">
            <button
              onClick={() => {
                setCurrency("MZN");
                triggerNotification("Moeda alterada para Metical (MT).");
              }}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                currency === "MZN" 
                  ? "bg-brand-plum text-white shadow-sm" 
                  : "text-[#8C847C] hover:text-[#2A2624]"
              }`}
              title="Exibir preços em Meticais (MT)"
            >
              MZN (MT)
            </button>
            <button
              onClick={() => {
                setCurrency("USD");
                triggerNotification("Currency switched to US Dollar ($).");
              }}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                currency === "USD" 
                  ? "bg-brand-plum text-white shadow-sm" 
                  : "text-[#8C847C] hover:text-[#2A2624]"
              }`}
              title="Display prices in USD ($)"
            >
              USD ($)
            </button>
          </div>

          {/* Sound Synthesizer Controls inside fully rounded bar */}
          <div className="flex items-center gap-2 bg-[#EBE6E0]/50 px-3 py-1.5 rounded-full border border-[#D9D3CC] shadow-sm">
            <button 
              onClick={toggleSound}
              className="hover:text-brand-plum focus:outline-none transition-colors flex items-center"
              title="Toggle Cozy Wick Crackle sound"
            >
              {isPlayingSound ? (
                <Volume2 className="w-4 h-4 text-brand-plum animate-pulse" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              value={soundVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-10 h-1 accent-brand-plum cursor-pointer"
              title="Volume control"
            />
          </div>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="hover:text-brand-plum transition-all flex items-center gap-1.5 bg-gray-50 hover:bg-brand-cream/15 border border-gray-200 px-4 py-2.5 rounded-full shadow-sm hover:shadow-md cursor-pointer relative"
          >
            <ShoppingBag className="w-4 h-4 text-brand-plum" />
            <span className="hidden sm:inline text-xs">Cart</span>
            <span className="bg-brand-plum text-white text-[9px] px-2 py-0.5 font-bold rounded-full ml-1 shadow-sm">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          </button>
        </div>
      </nav>

      {/* CORE CONTENT TOGGLE */}
      {currentView === "studio" ? (
        <>
          {/* SPECTACULAR, ATTRACTIVE INTRO & HERO */}
          <motion.section 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            className="relative bg-gradient-to-b from-brand-plum via-brand-plum/95 to-brand-plum-dark text-white py-16 px-6 border-b border-brand-gold/15 flex flex-col items-center justify-center text-center overflow-hidden min-h-[50vh]"
          >
            {/* Elegant Atmospheric Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06)_0%,transparent_75%)] pointer-events-none" />
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-brand-gold/5 blur-[90px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-80 h-80 bg-brand-plum/25 blur-[110px] rounded-full pointer-events-none" />

            {/* Crest with bounce on load */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 12 }}
              whileHover={{ scale: 1.04, rotate: 1 }}
              className="mb-6 cursor-pointer relative z-10"
            >
              <PrestigeCrest size="lg" className="filter drop-shadow-[0_12px_12px_rgba(0,0,0,0.4)]" />
            </motion.div>

            <div className="max-w-2xl space-y-4 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[9px] uppercase tracking-[0.3em] text-brand-gold font-bold">
                <Sparkles className="w-3 h-3 text-brand-gold animate-pulse" />
                <span>Prestige Young Entrepreneurs Initiative</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-serif font-extrabold tracking-widest uppercase leading-tight text-white">
                Stage 9 <span className="text-brand-gold italic">Scent Studio</span>
              </h2>

              <p className="text-xs sm:text-sm text-pink-100/80 leading-relaxed font-light max-w-xl mx-auto">
                An immersive, student-led luxury venture combining the science of organic chemistry, the art of master perfumery, and sustainable commerce. Scroll down to browse handcrafted collections, design personalized aromas in the Lab, or consult our AI Sommelier.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-3">
                <button 
                  onClick={() => {
                    const spotlight = document.getElementById("spotlight-section");
                    if (spotlight) spotlight.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-3 bg-brand-gold hover:bg-brand-gold-dark text-brand-plum font-bold text-[10px] uppercase tracking-widest rounded-full transition-all shadow-md hover:shadow-brand-gold/15 flex items-center gap-1.5 cursor-pointer group"
                >
                  <span>Enter Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-brand-plum" />
                </button>
                <button 
                  onClick={() => {
                    const quiz = document.getElementById("quiz-section");
                    if (quiz) quiz.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-[10px] uppercase tracking-widest rounded-full transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Scent Profiler Quiz</span>
                </button>
              </div>
            </div>
          </motion.section>

          {/* CORE HERO SPOTLIGHT SECTION */}
          <section id="spotlight-section" className="flex-1 flex flex-col lg:flex-row border-b border-[#EBE6E0]">
        
        {/* Left Side: Editorial Typography & Product Details */}
        <div className="w-full lg:w-1/2 p-6 md:p-12 lg:p-16 flex flex-col justify-between border-r border-[#EBE6E0] bg-[#FDFCFB]">
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#A69E96] font-semibold">
                {activeCandle.category} Edition
              </span>
              <span className="w-1.5 h-1.5 bg-[#8ea399] rounded-full" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8ea399] font-mono">
                {activeCandle.vessel} &bull; {activeCandle.wick.split(" ")[0]}
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif italic leading-[0.9] tracking-tighter text-[#2A2624] mb-2 uppercase break-words">
              {activeCandle.name}
            </h1>
            
            <p className="text-lg font-serif italic text-[#8C847C] mb-6">
              "{activeCandle.tagline}"
            </p>

            <p className="text-sm leading-relaxed text-[#5C5650] max-w-lg mb-8 font-light">
              {activeCandle.description}
            </p>

            {/* Aromatic Profile Notes Cards */}
            <div className="grid grid-cols-3 gap-3 max-w-md mb-8">
              <div className="border border-[#EBE6E0] p-3.5 bg-white/40">
                <span className="text-[8px] uppercase tracking-widest text-[#A69E96] block mb-1">Top Presence</span>
                <span className="font-serif text-xs italic text-[#2A2624] block leading-tight">
                  {activeCandle.topNotes.join(", ") || "Fresh breeze"}
                </span>
              </div>
              <div className="border border-[#EBE6E0] p-3.5 bg-white/40">
                <span className="text-[8px] uppercase tracking-widest text-[#A69E96] block mb-1">Heart Body</span>
                <span className="font-serif text-xs italic text-[#2A2624] block leading-tight">
                  {activeCandle.heartNotes.join(", ") || "Pure floral"}
                </span>
              </div>
              <div className="border border-[#EBE6E0] p-3.5 bg-white/40">
                <span className="text-[8px] uppercase tracking-widest text-[#A69E96] block mb-1">Base Foundation</span>
                <span className="font-serif text-xs italic text-[#2A2624] block leading-tight">
                  {activeCandle.baseNotes.join(", ") || "Warm timber"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#EBE6E0]/20 p-6 border border-[#EBE6E0]">
            <div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-[#A69E96] mb-1 font-semibold">Candle Dimensions</div>
              <div className="flex items-center space-x-4 text-xs font-mono text-[#5C5650]">
                <span>Weight: {activeCandle.weight}</span>
                <span>&bull;</span>
                <span>Burn time: {activeCandle.burnTime}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xl font-serif italic text-[#2A2624] mr-2">{formatPrice(activeCandle.price)}</span>
              <button 
                onClick={() => addToCart(activeCandle)}
                className="px-4 py-3 bg-white hover:bg-[#EBE6E0]/20 text-[#2A2624] border border-[#2A2624]/20 text-[11px] uppercase tracking-[0.15em] transition-all font-semibold shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                Add to Cart
              </button>
              <button 
                onClick={() => buyNow(activeCandle)}
                className="px-5 py-3 bg-[#2A2624] text-[#FDFCFB] hover:bg-brand-plum text-[11px] uppercase tracking-[0.15em] transition-all font-bold shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer rounded-lg border border-brand-gold/30 hover:border-brand-gold"
              >
                <CreditCard className="w-3.5 h-3.5 text-brand-gold" />
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Realtime Visualizer Chamber */}
        <div className="w-full lg:w-1/2 p-12 lg:p-16 bg-[#F5F2EE] flex flex-col items-center justify-between relative overflow-hidden min-h-[450px]">
          {/* Background watermarks */}
          <div className="absolute top-12 left-12 text-[10px] uppercase tracking-[0.3em] font-mono text-[#2A2624]/10 pointer-events-none">
            Melt-Wax Simulation v1.4
          </div>
          <div className="absolute bottom-12 right-12 text-[10px] uppercase tracking-[0.3em] font-mono text-[#2A2624]/10 pointer-events-none">
            Procedural Sound Waveform Active
          </div>

          {/* Interactive Light/Extinguish Controls */}
          <div className="w-full flex justify-between items-center z-10">
            <span className="text-xs uppercase font-mono tracking-widest text-[#8C847C] flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isLit ? "bg-amber-500 animate-ping" : "bg-gray-400"}`} />
              {isLit ? "Aura Radiating" : "Idle Candle Chamber"}
            </span>

            <button 
              onClick={() => setIsLit(!isLit)}
              className={`px-4 py-2 border rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold transition-all flex items-center gap-2 shadow-sm ${
                isLit 
                  ? "bg-amber-500/10 text-amber-800 border-amber-500/30 hover:bg-amber-500/20" 
                  : "bg-white text-[#2A2624] border-[#D9D3CC] hover:bg-[#FDFCFB]"
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${isLit ? "fill-amber-500 stroke-amber-600 animate-bounce" : ""}`} />
              {isLit ? "Extinguish Candle" : "Light with Match"}
            </button>
          </div>

          {/* Big Interactive Candle visualizer */}
          <div className="my-auto py-8 flex flex-col items-center justify-center">
            <div className="w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-b from-[#FFFDF9]/80 to-[#FFFDF9]/10 rounded-full border border-brand-gold/15 p-1 flex items-center justify-center relative shadow-inner">
              <InteractiveCandle3D 
                color={activeCandle.color} 
                vessel={activeCandle.vessel}
                name={activeCandle.name}
                isLit={isLit} 
                intensity={activeCandle.id.includes("custom") ? 1.4 : 1.0}
                className="w-full h-full cursor-grab active:cursor-grabbing" 
              />
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#2A2624]/90 text-white font-mono text-[9px] px-3 py-1.5 rounded-full border border-brand-gold/25 pointer-events-none uppercase tracking-widest flex items-center gap-1.5 shadow-md">
                <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-ping" />
                <span>3D DRAG ROTATE</span>
              </div>
            </div>
          </div>

          {/* Prompt/Guide to interaction */}
          <div className="text-center z-10 bg-white/40 backdrop-blur-md border border-[#EBE6E0] p-4 max-w-sm">
            <p className="text-xs italic text-[#5C5650] leading-relaxed">
              {isLit 
                ? "🔊 Headphones recommended. A warm physical fire crackle is synthesizing. Adjust the top volume or toggle the flame directly." 
                : "💡 Click the candle vessel above or the 'Light with Match' button to begin the burning process & listen to the natural firewood crackle."
              }
            </p>
          </div>
        </div>
      </section>

      {/* CURATED COLLECTIONS GRID */}
      <section id="collections-section" className="py-20 px-6 md:px-12 lg:px-16 border-b border-[#EBE6E0] bg-[#FAF6F0]/30">
        <div className="max-w-7xl mx-auto">
          {/* Header Block */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-[10px] uppercase tracking-[0.4em] text-brand-plum block mb-2 font-bold font-mono">Student Enterprise</span>
              <h2 className="text-3xl sm:text-5xl font-serif italic text-brand-plum uppercase font-extrabold">
                Curated Aromas
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#5C5650] max-w-md mt-4 md:mt-0 font-light leading-relaxed">
              Formulated in our chemistry laboratory using 100% cosmetic-grade natural soy wax, local botanical infusions, and sustainable cherrywood crackle wicks.
            </p>
          </div>

          {/* School-Themed Category Navigation */}
          <div className="bg-white border border-brand-plum/10 rounded-3xl p-3 mb-10 shadow-sm flex flex-col gap-4 overflow-hidden">
            <div className="flex overflow-x-auto md:flex-wrap gap-2 justify-start md:justify-center scrollbar-none pb-2 md:pb-0 whitespace-nowrap -mx-3 px-3 md:mx-0 md:px-0">
              {[
                { id: "All", name: "All Collections", icon: Sparkles, count: candlesList.length, accent: "text-brand-gold" },
                { id: "Prestige Heritage", name: "Prestige Heritage", icon: Award, count: candlesList.filter(c => c.collection === "Prestige Heritage" || c.category === "Prestige Heritage").length, accent: "text-brand-plum" },
                { id: "Scholastic Scholar", name: "Scholastic Scholar", icon: BookOpen, count: candlesList.filter(c => c.collection === "Scholastic Scholar" || c.category === "Scholastic Scholar").length, accent: "text-blue-600" },
                { id: "Coastal & Nature", name: "Coastal & Nature", icon: Compass, count: candlesList.filter(c => c.collection === "Coastal & Nature" || c.category === "Coastal & Nature").length, accent: "text-emerald-600" }
              ].map((cat) => {
                const isActive = presetFilter === cat.id;
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setPresetFilter(cat.id as any)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shrink-0 ${
                      isActive
                        ? "bg-brand-plum text-brand-gold border-2 border-brand-gold shadow-md scale-[1.03]"
                        : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-brand-cream/50 hover:text-brand-plum hover:border-brand-plum/30"
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isActive ? "text-brand-gold animate-pulse" : cat.accent}`} />
                    <span>{cat.name}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-brand-plum-dark text-brand-gold" : "bg-gray-200/60 text-gray-600"
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
            
            {/* Active Category Meta-description */}
            <div className="text-center px-4 py-2 border-t border-gray-50">
              <p className="text-[11px] text-gray-500 max-w-2xl mx-auto italic leading-relaxed">
                {presetFilter === "All" && "Explore all of Stage 9 Scent Studio's premium handcrafted student formulations."}
                {presetFilter === "Prestige Heritage" && "Majestic, ceremonial scents celebrating historical victory, school identity, and Prestige Academy pride."}
                {presetFilter === "Scholastic Scholar" && "Focus-inducing botanical blends hand-poured specifically for deep, high-achieving academic study and revision."}
                {presetFilter === "Coastal & Nature" && "Fresh saltwater, crisp wind, and wild forest notes inspired by Beira sand dunes and Mozambican shores."}
              </p>
            </div>
          </div>

          {/* Product Grid - 2 columns on mobile, 3 on md, 5 on lg */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {candlesList.filter(candle => presetFilter === "All" || candle.collection === presetFilter || candle.category === presetFilter).map((candle) => {
              const isActive = activeCandle.id === candle.id;
              return (
                <motion.div 
                  whileHover={{ scale: 1.025, y: -4 }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  key={candle.id}
                  id={`preset-${candle.id}`}
                  className={`border transition-all duration-300 p-4 sm:p-6 flex flex-col justify-between relative rounded-2xl overflow-hidden ${
                    isActive 
                      ? "border-2 border-brand-gold bg-white shadow-xl ring-1 ring-brand-gold/20" 
                      : "border-brand-cream-dark/50 hover:border-brand-plum/30 bg-white/40 hover:bg-white/80"
                  }`}
                >
                  {isActive && (
                    <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-brand-plum text-brand-gold text-[7px] sm:text-[8px] uppercase tracking-widest px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-mono font-bold border border-brand-gold/30 z-10">
                      Spotlight
                    </span>
                  )}

                  {/* Visualizer Preview wrapper with scaling on mobile to fit beautifully */}
                  <div className="h-44 flex items-center justify-center my-2 overflow-hidden relative max-w-full">
                    <div className="scale-[0.75] xs:scale-90 sm:scale-100 transform origin-center absolute">
                      <CandleVisualizer 
                        candle={candle} 
                        isLit={isActive && isLit} 
                        onToggleLight={() => selectActiveCandle(candle)} 
                        size="sm" 
                      />
                    </div>
                  </div>

                  <div>
                    {/* Collection and burn time badges */}
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
                      <span className="text-[8px] font-mono uppercase tracking-wider font-bold text-brand-plum bg-brand-cream/80 border border-brand-plum/10 px-2 py-0.5 rounded-full">
                        {candle.collection}
                      </span>
                      <span className="text-[8px] uppercase tracking-widest text-[#A69E96] font-semibold">
                        {candle.burnTime}
                      </span>
                    </div>
                    
                    <h3 className="font-serif text-lg italic text-[#2A2624] uppercase mb-1 font-bold">
                      {candle.name}
                    </h3>

                    <p className="text-xs text-[#5C5650] line-clamp-2 mb-4 font-light leading-relaxed">
                      {candle.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-6">
                      {candle.heartNotes.slice(0, 2).map((note, idx) => (
                        <span key={idx} className="text-[8px] bg-brand-cream text-brand-plum px-1.5 py-0.5 rounded-none uppercase font-mono border border-brand-plum/5">
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#EBE6E0]">
                    <span className="text-base font-serif italic text-brand-plum font-extrabold">{formatPrice(candle.price)}</span>
                    
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => selectActiveCandle(candle)}
                        className={`p-2 border rounded-lg transition-colors cursor-pointer ${
                          isActive 
                            ? "border-brand-gold bg-brand-cream/50 text-brand-plum" 
                            : "border-[#D9D3CC] hover:bg-brand-cream/20 text-[#5C5650]"
                        }`}
                        title="Display in the Main Chamber"
                      >
                        <Compass className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => buyNow(candle)}
                        className="px-4 py-2 bg-brand-plum text-white text-[10px] uppercase tracking-wider hover:bg-brand-plum-dark hover:text-brand-gold border border-transparent hover:border-brand-gold/30 transition-all font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                        title="Buy Now (takes you straight to checkout)"
                      >
                        <CreditCard className="w-3 h-3 text-brand-gold" />
                        Buy
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SCENT SELECTOR / SUGGESTION PROFILE QUIZ */}
      <section id="quiz-section" className="py-16 px-6 md:px-12 lg:px-16 bg-gradient-to-b from-white to-[#FDFCFB] border-b border-[#EBE6E0]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#A69E96] font-semibold block">Interactive Guidance</span>
            <h2 className="text-3xl sm:text-4xl font-serif italic text-brand-plum uppercase font-extrabold">Scent Finder Profiler</h2>
            <p className="text-xs text-gray-500 font-light max-w-md mx-auto">
              Not sure which note suits your mood? Answer 3 quick scholastic questions and discover your perfect hand-poured recommendation.
            </p>
          </div>
          <ScentQuiz 
            onSelectCandle={(candle) => {
              selectActiveCandle(candle);
              const spotlight = document.getElementById("spotlight-section");
              if (spotlight) spotlight.scrollIntoView({ behavior: "smooth" });
              triggerNotification(`Spotlight shifted to: ${candle.name}`);
            }}
            onAddToCart={(candle) => {
              addToCart(candle);
            }}
            formatPrice={formatPrice}
          />
        </div>
      </section>

      {/* DUAL INTERACTIVE EXPERIENCES: LAB BUILDER & AI SCENT SOMMELIER */}
      <section className="grid grid-cols-1 lg:grid-cols-2 border-b border-[#EBE6E0]">
        
        {/* SECTION A: THE BESPOKE LAB BUILDER */}
        <div id="builder-section" className="p-8 md:p-12 lg:p-16 bg-[#FDFCFB] border-r border-[#EBE6E0] flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#A69E96] block mb-2 font-semibold">The Lab</span>
            <h2 className="text-3xl md:text-5xl font-serif italic text-[#2A2624] uppercase mb-4">
              Bespoke Alchemist
            </h2>
            <p className="text-sm text-[#5C5650] leading-relaxed max-w-lg mb-10 font-light">
              Craft your personal aromatic fingerprint. Hand-pick your foundational, middle, and crowning fragrance notes. Our artisans will custom-blend and hand-pour your specific recipe in London.
            </p>

            {/* Customizer steps */}
            <div className="space-y-8">
              
              {/* Step 1: Candle Custom Name */}
              <div className="border-b border-[#EBE6E0] pb-6">
                <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8C847C] block mb-3">
                  1. Label Nomenclature
                </label>
                <input 
                  type="text" 
                  value={builderName}
                  onChange={(e) => setBuilderName(e.target.value.slice(0, 24))}
                  placeholder="E.g., Autumn Rain, Cabin Musings"
                  className="w-full bg-white border border-[#D9D3CC] p-3 text-sm focus:outline-none focus:border-[#2A2624] font-serif italic"
                />
              </div>

              {/* Step 2: Crown Note (Top Note) */}
              <div className="border-b border-[#EBE6E0] pb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8C847C]">
                    2. Crown Presence (Top Scent)
                  </label>
                  <span className="text-[9px] font-mono text-[#A69E96]">Immediate breath</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SCENT_OPTIONS.filter(o => o.category === "Top").map((note) => (
                    <button
                      key={note.id}
                      onClick={() => setBuilderTop(note)}
                      className={`p-3 border text-left transition-all rounded-none flex flex-col justify-between ${
                        builderTop.id === note.id 
                          ? "border-[#2A2624] bg-[#FDFCFB] ring-1 ring-[#2A2624]" 
                          : "border-[#EBE6E0] bg-white hover:border-[#8C847C]"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full mb-2 border border-black/5" style={{ backgroundColor: note.color }} />
                      <span className="text-xs font-serif font-medium leading-tight text-[#2A2624]">{note.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Heart Note */}
              <div className="border-b border-[#EBE6E0] pb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8C847C]">
                    3. Heart Body (Middle Scent)
                  </label>
                  <span className="text-[9px] font-mono text-[#A69E96]">Core essence</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SCENT_OPTIONS.filter(o => o.category === "Heart").map((note) => (
                    <button
                      key={note.id}
                      onClick={() => setBuilderHeart(note)}
                      className={`p-3 border text-left transition-all rounded-none flex flex-col justify-between ${
                        builderHeart.id === note.id 
                          ? "border-[#2A2624] bg-[#FDFCFB] ring-1 ring-[#2A2624]" 
                          : "border-[#EBE6E0] bg-white hover:border-[#8C847C]"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full mb-2 border border-black/5" style={{ backgroundColor: note.color }} />
                      <span className="text-xs font-serif font-medium leading-tight text-[#2A2624]">{note.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Base Foundation Scent */}
              <div className="border-b border-[#EBE6E0] pb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8C847C]">
                    4. Base Foundation (Deepest Trail)
                  </label>
                  <span className="text-[9px] font-mono text-[#A69E96]">Lingering anchor</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SCENT_OPTIONS.filter(o => o.category === "Base").map((note) => (
                    <button
                      key={note.id}
                      onClick={() => setBuilderBase(note)}
                      className={`p-3 border text-left transition-all rounded-none flex flex-col justify-between ${
                        builderBase.id === note.id 
                          ? "border-[#2A2624] bg-[#FDFCFB] ring-1 ring-[#2A2624]" 
                          : "border-[#EBE6E0] bg-white hover:border-[#8C847C]"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full mb-2 border border-black/5" style={{ backgroundColor: note.color }} />
                      <span className="text-xs font-serif font-medium leading-tight text-[#2A2624]">{note.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 5: Vessel Material Selection */}
              <div className="border-b border-[#EBE6E0] pb-6">
                <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8C847C] block mb-3">
                  5. Luxury Vessel Material
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {VESSEL_OPTIONS.map((vessel) => (
                    <button
                      key={vessel.name}
                      onClick={() => setBuilderVessel(vessel)}
                      className={`p-4 border text-left transition-all rounded-none ${
                        builderVessel.name === vessel.name 
                          ? "border-[#2A2624] bg-white ring-1 ring-[#2A2624]" 
                          : "border-[#EBE6E0] bg-white/50 hover:border-[#8C847C]"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-serif text-sm font-semibold">{vessel.name}</span>
                        {vessel.priceModifier > 0 && (
                          <span className="text-[10px] font-mono text-emerald-700 font-semibold">
                            +{vessel.priceModifier}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#5C5650] leading-relaxed font-light">{vessel.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 6: Wick Selection */}
              <div className="pb-4">
                <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8C847C] block mb-3">
                  6. Burning Element (Wick Type)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {WICK_OPTIONS.map((wick) => (
                    <button
                      key={wick.name}
                      onClick={() => setBuilderWick(wick)}
                      className={`p-4 border text-left transition-all rounded-none ${
                        builderWick.name === wick.name 
                          ? "border-[#2A2624] bg-white ring-1 ring-[#2A2624]" 
                          : "border-[#EBE6E0] bg-white/50 hover:border-[#8C847C]"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-serif text-xs font-semibold">{wick.name}</span>
                        {wick.priceModifier > 0 && (
                          <span className="text-[10px] font-mono text-emerald-700 font-semibold">
                            +{wick.priceModifier}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#5C5650] leading-relaxed font-light">{wick.description}</p>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="mt-12 bg-white p-6 border border-[#EBE6E0] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-[8px] uppercase tracking-[0.2em] text-[#A69E96] font-semibold mb-1">
                Estimated Alchemy Cost
              </div>
              <div className="text-2xl font-serif italic text-[#2A2624]">
                {formatPrice(38 + builderVessel.priceModifier + builderWick.priceModifier)}
              </div>
            </div>

            <button 
              onClick={handleBuildBespoke}
              className="w-full sm:w-auto px-8 py-4 bg-[#2A2624] text-[#FDFCFB] text-[11px] uppercase tracking-[0.25em] hover:bg-[#433b37] transition-all font-semibold active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Fuse Recipe & Burn</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* SECTION B: GEMINI AI SCENT SOMMELIER CHAIR */}
        <div id="sommelier-section" className="p-8 md:p-12 lg:p-16 bg-[#F5F2EE] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#A69E96] font-semibold">
                Atmosphere Analysis
              </span>
              <span className="bg-amber-600 text-[8px] uppercase tracking-widest text-[#FDFCFB] px-1.5 py-0.5 font-semibold">
                Live Gemini 3.5 AI
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-serif italic text-[#2A2624] uppercase mb-4">
              AI Scent Sommelier
            </h2>
            <p className="text-sm text-[#5C5650] leading-relaxed max-w-lg mb-8 font-light">
              Describe a memory, an emotion, a music album, or the weather outside. Our AI Scent Sommelier, powered by Google Gemini, acts as a master perfumer to design a completely unique candle profile with a poetic description and tailored wax color.
            </p>

            <div className="space-y-6">
              
              {/* Sommelier Input 1 */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C847C] block mb-2">
                  Describe Your Mood or Core Emotion
                </label>
                <textarea 
                  rows={2}
                  value={sommelierMood}
                  onChange={(e) => setSommelierMood(e.target.value)}
                  placeholder="E.g., Nostalgic and reflective, wanting calm isolation from the storm outside"
                  className="w-full bg-white border border-[#D9D3CC] p-3 text-sm focus:outline-none focus:border-[#2A2624] leading-relaxed font-light"
                />
              </div>

              {/* Sommelier Input 2 */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C847C] block mb-2">
                  Describe the Setting or Ideal Memory
                </label>
                <textarea 
                  rows={2}
                  value={sommelierSetting}
                  onChange={(e) => setSommelierSetting(e.target.value)}
                  placeholder="E.g., A rainy evening inside a wood-paneled study filled with old vintage books and hot spiced tea"
                  className="w-full bg-white border border-[#D9D3CC] p-3 text-sm focus:outline-none focus:border-[#2A2624] leading-relaxed font-light"
                />
              </div>

              {/* Sommelier Input 3 */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C847C] block mb-2">
                  Preferred Botanicals or Excluded Accents (Optional)
                </label>
                <input 
                  type="text"
                  value={sommelierPrefs}
                  onChange={(e) => setSommelierPrefs(e.target.value)}
                  placeholder="E.g., Include cedar and pine, no heavy patchouli"
                  className="w-full bg-white border border-[#D9D3CC] p-3 text-sm focus:outline-none focus:border-[#2A2624] font-light"
                />
              </div>

              {sommelierError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-mono leading-relaxed">
                  <span className="font-bold">Sommelier Error:</span> {sommelierError}
                </div>
              )}

              {/* Submit Consultation button */}
              <button 
                onClick={handleConsultSommelier}
                disabled={isSommelierLoading}
                className={`w-full py-4 bg-[#2A2624] text-[#FDFCFB] text-[11px] uppercase tracking-[0.3em] font-semibold transition-all flex items-center justify-center gap-3 relative ${
                  isSommelierLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#433b37]"
                }`}
              >
                {isSommelierLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Scent Chemistry...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span>Consult Fragrance Sommelier</span>
                  </>
                )}
              </button>

            </div>
          </div>

          {/* AI Result Showcase Section */}
          {sommelierResult ? (
            <div className="mt-12 bg-white p-6 border border-amber-200 shadow-md animate-fade-in relative">
              <div className="absolute top-4 right-4 text-[9px] uppercase tracking-widest text-[#8ea399] font-semibold flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" /> Sommelier Formulated
              </div>

              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="p-2 border border-dashed border-[#D9D3CC] bg-[#FDFCFB]">
                  <CandleVisualizer 
                    candle={sommelierResult} 
                    isLit={activeCandle.id === sommelierResult.id && isLit} 
                    onToggleLight={() => selectActiveCandle(sommelierResult)} 
                    size="sm" 
                  />
                </div>

                <div className="flex-1">
                  <h4 className="font-serif text-xl italic text-[#2A2624] uppercase mb-1">{sommelierResult.name}</h4>
                  <p className="text-xs text-[#5C5650] leading-relaxed mb-4 italic font-light">
                    "{sommelierResult.description}"
                  </p>

                  <div className="grid grid-cols-3 gap-2 border-t border-[#EBE6E0] pt-4 mb-4">
                    <div>
                      <span className="text-[8px] uppercase tracking-widest text-[#A69E96] block">Top Scent</span>
                      <span className="text-xs font-serif italic text-[#2A2624]">{sommelierResult.topNotes[0]}</span>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-widest text-[#A69E96] block">Heart Body</span>
                      <span className="text-xs font-serif italic text-[#2A2624]">{sommelierResult.heartNotes[0]}</span>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-widest text-[#A69E96] block">Base Anchor</span>
                      <span className="text-xs font-serif italic text-[#2A2624]">{sommelierResult.baseNotes[0]}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-base font-serif italic text-[#2A2624]">{formatPrice(sommelierResult.price)}</span>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => selectActiveCandle(sommelierResult)}
                        className="px-3 py-2 border border-[#D9D3CC] hover:bg-[#EBE6E0]/50 text-[10px] uppercase tracking-widest font-semibold transition-colors rounded-lg cursor-pointer"
                      >
                        Chamber Showcase
                      </button>
                      <button 
                        onClick={() => addToCart(sommelierResult)}
                        className="px-3 py-2 bg-white hover:bg-gray-100 text-[#2A2624] border border-[#2A2624]/20 text-[10px] uppercase tracking-widest font-semibold rounded-lg cursor-pointer"
                      >
                        Add to Order
                      </button>
                      <button 
                        onClick={() => buyNow(sommelierResult)}
                        className="px-4 py-2 bg-[#2A2624] text-[#FDFCFB] text-[10px] uppercase tracking-widest hover:bg-brand-plum font-bold rounded-lg cursor-pointer flex items-center gap-1 border border-transparent hover:border-brand-gold/30"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-brand-gold" />
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-12 bg-white/40 p-8 border border-dashed border-[#D9D3CC] text-center text-xs text-[#8C847C] font-light leading-relaxed">
              "When you consult the Scent Sommelier, our custom sensory model processes your setting description to synthesize the notes, recommending an elegant wax color and premium apothecary details."
            </div>
          )}

        </div>
      </section>

      {/* CURATIVE ETHOS & JOURNALING STORY BENTO */}
      <section className="py-20 px-6 md:px-12 lg:px-16 bg-[#FDFCFB] border-b border-[#EBE6E0]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#A69E96] block mb-2 font-semibold">Our Philosophy</span>
            <h2 className="text-3xl md:text-5xl font-serif italic text-[#2A2624] uppercase mb-4">
              Pure Natural Intimacy
            </h2>
            <div className="w-12 h-[1px] bg-[#2A2624] mx-auto my-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border border-[#EBE6E0] bg-white/40">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#A69E96] font-semibold block mb-4">01 / Botanical Extraction</span>
              <h3 className="font-serif text-xl italic text-[#2A2624] mb-3">100% Essential Essence</h3>
              <p className="text-xs text-[#5C5650] leading-relaxed font-light">
                We use raw cold-pressed plant extracts and steam-distilled pure botanical oils. No synthetic musks, phthalates, or artificial stabilizers enter our wax vats.
              </p>
            </div>
            
            <div className="p-8 border border-[#EBE6E0] bg-white/40">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#A69E96] font-semibold block mb-4">02 / Crackling Cherrywood</span>
              <h3 className="font-serif text-xl italic text-[#2A2624] mb-3">Therapeutic Acoustics</h3>
              <p className="text-xs text-[#5C5650] leading-relaxed font-light">
                Our wooden wicks are cut from certified sustainably managed American cherry forests. They synthesize an organic crackle that brings fireplace comfort to any urban flat.
              </p>
            </div>

            <div className="p-8 border border-[#EBE6E0] bg-white/40">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#A69E96] font-semibold block mb-4">03 / Circular Re-Use</span>
              <h3 className="font-serif text-xl italic text-[#2A2624] mb-3">Apothecary Vessels</h3>
              <p className="text-xs text-[#5C5650] leading-relaxed font-light">
                Every single hand-pressed ceramic block and heavy amber glass jar is designed to find a second life as a delicate flower vase, pencil container, or dry herbal storage jar.
              </p>
            </div>
          </div>
        </div>
      </section>
        </>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex-1 w-full"
          >
            {/* ==============================================
                VIEW 2: PRESTIGE MARKETPLACE
                ============================================== */}
            {currentView === "marketplace" && (
              <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-12 space-y-12 animate-fade-in">
                {/* Marketplace Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.4em] text-brand-gold font-bold font-mono">Curated Collections</span>
                    <h2 className="text-3xl md:text-5xl font-serif italic text-brand-plum uppercase font-extrabold mt-1">Prestige Catalog</h2>
                  </div>
                  <p className="text-xs text-[#5C5650] max-w-md font-light leading-relaxed">
                    Support our student cooperative by choosing from our premium catalog. Formulated, poured, and inspected by the Prestige Chemistry team.
                  </p>
                </div>

                {/* CURATED RECIPE RECOMMENDATIONS / SUGGESTIONS SECTION */}
                <div className="bg-[#FAF6F0] border border-brand-gold/15 p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-brand-plum" />
                    <h4 className="text-xs uppercase tracking-wider font-bold text-brand-plum">Student Curated Recipes & Suggestions</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 border border-gray-100 rounded-xl space-y-2 shadow-xs">
                      <span className="text-[8px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full uppercase font-bold">Exam Focus</span>
                      <h5 className="font-serif italic text-sm text-gray-800 font-bold">The Scholastic Revision</h5>
                      <p className="text-[11px] text-gray-500 leading-relaxed font-light">Peppermint, Rosemary, and rich Virginian Cedarwood. Designed to enhance cognitive speed and concentration.</p>
                    </div>
                    <div className="bg-white p-4 border border-gray-100 rounded-xl space-y-2 shadow-xs">
                      <span className="text-[8px] font-mono bg-pink-50 text-pink-800 px-2 py-0.5 rounded-full uppercase font-bold">Calm & Cozy</span>
                      <h5 className="font-serif italic text-sm text-gray-800 font-bold">Twilight Sanctuary</h5>
                      <p className="text-[11px] text-gray-500 leading-relaxed font-light">Organic Lavender buds, sweet Madagascan Vanilla, and soft white Musk. Perfect for evening wind-downs.</p>
                    </div>
                    <div className="bg-white p-4 border border-gray-100 rounded-xl space-y-2 shadow-xs">
                      <span className="text-[8px] font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full uppercase font-bold">Ocean Fresh</span>
                      <h5 className="font-serif italic text-sm text-gray-800 font-bold">Macuti Sand Dunes</h5>
                      <p className="text-[11px] text-gray-500 leading-relaxed font-light">Sea Salt, bitter Orange Neroli, and weathered Driftwood. Inspired by Beira's stunning Indian Ocean horizon.</p>
                    </div>
                  </div>
                </div>

                {/* DYNAMIC SCENT PERSONALITY QUIZ */}
                <div className="bg-brand-cream/10 border-2 border-brand-gold/30 p-6 rounded-2xl shadow-md space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h4 className="text-sm font-serif italic text-brand-plum uppercase font-bold tracking-wider flex items-center gap-2">
                        <span>✨ Scent Matcher Quiz</span>
                      </h4>
                      <p className="text-[11px] text-gray-500 font-mono">Discover your signature student fragrance with 3 quick sensory questions</p>
                    </div>
                    {!isQuizActive && (
                      <button
                        onClick={() => {
                          setIsQuizActive(true);
                          setQuizStep(0);
                          setQuizAnswers([]);
                          setQuizResult(null);
                        }}
                        className="px-5 py-2 bg-brand-plum text-white text-[10px] uppercase font-bold tracking-widest hover:bg-brand-plum-dark transition-all rounded-full cursor-pointer shadow-sm"
                      >
                        Start Scent Finder
                      </button>
                    )}
                  </div>

                  {isQuizActive && (
                    <div className="bg-white border border-brand-gold/20 p-5 rounded-xl space-y-4 transition-all">
                      {/* STEP 1: AFTERNOON MOOD */}
                      {quizStep === 0 && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-[10px] uppercase font-mono font-bold text-brand-gold">
                            <span>Question 1 of 3</span>
                            <span>Aromatic Vibe</span>
                          </div>
                          <h5 className="font-serif text-sm font-bold text-brand-plum">How do you prefer to spend your ideal afternoon on school premises?</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => {
                                setQuizAnswers(['A']);
                                setQuizStep(1);
                              }}
                              className="p-3 border border-gray-100 rounded-xl text-left text-xs bg-gray-50 hover:bg-brand-cream/10 hover:border-brand-gold/30 transition-all cursor-pointer font-medium"
                            >
                              📚 Studying for final exams with deep silence & focus
                            </button>
                            <button
                              onClick={() => {
                                setQuizAnswers(['B']);
                                setQuizStep(1);
                              }}
                              className="p-3 border border-gray-100 rounded-xl text-left text-xs bg-gray-50 hover:bg-brand-cream/10 hover:border-brand-gold/30 transition-all cursor-pointer font-medium"
                            >
                              🌊 Sitting outside with friends, enjoying fresh ocean breezes
                            </button>
                            <button
                              onClick={() => {
                                setQuizAnswers(['C']);
                                setQuizStep(1);
                              }}
                              className="p-3 border border-gray-100 rounded-xl text-left text-xs bg-gray-50 hover:bg-brand-cream/10 hover:border-brand-gold/30 transition-all cursor-pointer font-medium"
                            >
                              🏆 Celebrating academic honors or hosting family tea ceremonies
                            </button>
                            <button
                              onClick={() => {
                                setQuizAnswers(['D']);
                                setQuizStep(1);
                              }}
                              className="p-3 border border-gray-100 rounded-xl text-left text-xs bg-gray-50 hover:bg-brand-cream/10 hover:border-brand-gold/30 transition-all cursor-pointer font-medium"
                            >
                              ✨ Winding down under a starry sky with a peaceful diary
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP 2: SCENT ACCENT */}
                      {quizStep === 1 && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-[10px] uppercase font-mono font-bold text-brand-gold">
                            <span>Question 2 of 3</span>
                            <span>Aromatherapy Notes</span>
                          </div>
                          <h5 className="font-serif text-sm font-bold text-brand-plum">Which type of natural raw ingredient instantly puts your mind at ease?</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => {
                                setQuizAnswers([...quizAnswers, 'A']);
                                setQuizStep(2);
                              }}
                              className="p-3 border border-gray-100 rounded-xl text-left text-xs bg-gray-50 hover:bg-brand-cream/10 hover:border-brand-gold/30 transition-all cursor-pointer font-medium"
                            >
                              🪵 Woodsy cedarwood, ancient parchment, and leather bound library books
                            </button>
                            <button
                              onClick={() => {
                                setQuizAnswers([...quizAnswers, 'B']);
                                setQuizStep(2);
                              }}
                              className="p-3 border border-gray-100 rounded-xl text-left text-xs bg-gray-50 hover:bg-brand-cream/10 hover:border-brand-gold/30 transition-all cursor-pointer font-medium"
                            >
                              🍊 Bitter orange blossom, weathered sea-driftwood, and marine salt
                            </button>
                            <button
                              onClick={() => {
                                setQuizAnswers([...quizAnswers, 'C']);
                                setQuizStep(2);
                              }}
                              className="p-3 border border-gray-100 rounded-xl text-left text-xs bg-gray-50 hover:bg-brand-cream/10 hover:border-brand-gold/30 transition-all cursor-pointer font-medium"
                            >
                              👑 Saffron spice, sweet royal honey combs, and burning resins
                            </button>
                            <button
                              onClick={() => {
                                setQuizAnswers([...quizAnswers, 'D']);
                                setQuizStep(2);
                              }}
                              className="p-3 border border-gray-100 rounded-xl text-left text-xs bg-gray-50 hover:bg-brand-cream/10 hover:border-brand-gold/30 transition-all cursor-pointer font-medium"
                            >
                              🌿 Organic relaxing lavender, clean eucalyptus leaves, and soft vanilla pods
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP 3: ATMOSPHERE GOAL */}
                      {quizStep === 2 && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-[10px] uppercase font-mono font-bold text-brand-gold">
                            <span>Question 3 of 3</span>
                            <span>Desired Atmosphere</span>
                          </div>
                          <h5 className="font-serif text-sm font-bold text-brand-plum">What kind of energy or aura do you want this hand-poured candle to invite?</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => {
                                const finalAnswers = [...quizAnswers, 'A'];
                                setQuizAnswers(finalAnswers);
                                
                                // Matches:
                                const countA = finalAnswers.filter(x => x === 'A').length;
                                const countB = finalAnswers.filter(x => x === 'B').length;
                                const countC = finalAnswers.filter(x => x === 'C').length;

                                let bestCol = "Prestige Heritage";
                                if (countA >= countB && countA >= countC) {
                                  bestCol = "Scholastic Scholar";
                                } else if (countB >= countA && countB >= countC) {
                                  bestCol = "Coastal & Nature";
                                }

                                let matchedCandle = candlesList.find(c => c.collection === bestCol && (c.stockCount ?? 0) > 0);
                                if (!matchedCandle) {
                                  matchedCandle = candlesList.find(c => (c.stockCount ?? 0) > 0) || candlesList[0];
                                }
                                setQuizResult(matchedCandle);
                                setQuizStep(3);
                              }}
                              className="p-3 border border-gray-100 rounded-xl text-left text-xs bg-gray-50 hover:bg-brand-cream/10 hover:border-brand-gold/30 transition-all cursor-pointer font-medium"
                            >
                              🎯 Academic speed, sharp memory recall, and deep exam concentration
                            </button>
                            <button
                              onClick={() => {
                                const finalAnswers = [...quizAnswers, 'B'];
                                setQuizAnswers(finalAnswers);
                                
                                const countA = finalAnswers.filter(x => x === 'A').length;
                                const countB = finalAnswers.filter(x => x === 'B').length;
                                const countC = finalAnswers.filter(x => x === 'C').length;

                                let bestCol = "Coastal & Nature";
                                if (countA >= countB && countA >= countC) {
                                  bestCol = "Scholastic Scholar";
                                } else if (countC >= countA && countC >= countB) {
                                  bestCol = "Prestige Heritage";
                                }

                                let matchedCandle = candlesList.find(c => c.collection === bestCol && (c.stockCount ?? 0) > 0);
                                if (!matchedCandle) {
                                  matchedCandle = candlesList.find(c => (c.stockCount ?? 0) > 0) || candlesList[0];
                                }
                                setQuizResult(matchedCandle);
                                setQuizStep(3);
                              }}
                              className="p-3 border border-gray-100 rounded-xl text-left text-xs bg-gray-50 hover:bg-brand-cream/10 hover:border-brand-gold/30 transition-all cursor-pointer font-medium"
                            >
                              ✨ Positive solar energy, fresh air flow, and coastal Beira vibes
                            </button>
                            <button
                              onClick={() => {
                                const finalAnswers = [...quizAnswers, 'C'];
                                setQuizAnswers(finalAnswers);

                                const countA = finalAnswers.filter(x => x === 'A').length;
                                const countB = finalAnswers.filter(x => x === 'B').length;
                                const countC = finalAnswers.filter(x => x === 'C').length;

                                let bestCol = "Prestige Heritage";
                                if (countA >= countB && countA >= countC) {
                                  bestCol = "Scholastic Scholar";
                                } else if (countB >= countA && countB >= countC) {
                                  bestCol = "Coastal & Nature";
                                }

                                let matchedCandle = candlesList.find(c => c.collection === bestCol && (c.stockCount ?? 0) > 0);
                                if (!matchedCandle) {
                                  matchedCandle = candlesList.find(c => (c.stockCount ?? 0) > 0) || candlesList[0];
                                }
                                setQuizResult(matchedCandle);
                                setQuizStep(3);
                              }}
                              className="p-3 border border-gray-100 rounded-xl text-left text-xs bg-gray-50 hover:bg-brand-cream/10 hover:border-brand-gold/30 transition-all cursor-pointer font-medium"
                            >
                              🌟 Pure majestic luxury, high-end warmth, and celebratory prestige
                            </button>
                            <button
                              onClick={() => {
                                const finalAnswers = [...quizAnswers, 'D'];
                                setQuizAnswers(finalAnswers);

                                // Sovereign relaxer: find Starry Solitude / Twilight Sanctuary / sleep candles
                                let matchedCandle = candlesList.find(c => 
                                  (c.name.toLowerCase().includes("silence") || c.name.toLowerCase().includes("sanctuary") || c.description.toLowerCase().includes("lavender")) && (c.stockCount ?? 0) > 0
                                );
                                if (!matchedCandle) {
                                  matchedCandle = candlesList.find(c => (c.stockCount ?? 0) > 0) || candlesList[0];
                                }
                                setQuizResult(matchedCandle);
                                setQuizStep(3);
                              }}
                              className="p-3 border border-gray-100 rounded-xl text-left text-xs bg-gray-50 hover:bg-brand-cream/10 hover:border-brand-gold/30 transition-all cursor-pointer font-medium"
                            >
                              💤 Deep relaxation, stress relief, and cozy sleep sanctuary
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP 4: RECOMMENDATION RESULT VIEW */}
                      {quizStep === 3 && quizResult && (
                        <div className="space-y-4 animate-fade-in">
                          <div className="text-center">
                            <span className="text-[10px] uppercase font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                              🎯 Scent Personality Match Found!
                            </span>
                          </div>

                          <div className="flex flex-col md:flex-row gap-5 items-center bg-gray-50 p-4 rounded-xl">
                            <div className="w-32 h-32 rounded-lg overflow-hidden shrink-0 border border-brand-gold/20 flex items-center justify-center bg-white relative">
                              {quizResult.imageUri ? (
                                <img src={quizResult.imageUri} alt={quizResult.name} className="w-full h-full object-cover" />
                              ) : (
                                <InteractiveCandle3D color={quizResult.color} name={quizResult.name} vessel={quizResult.vessel} isLit={false} className="w-full h-full" />
                              )}
                            </div>
                            <div className="space-y-1.5 text-left flex-1 w-full">
                              <span className="text-[9px] uppercase font-bold tracking-wider text-brand-gold">{quizResult.collection}</span>
                              <h4 className="font-serif text-lg font-extrabold text-brand-plum leading-tight">{quizResult.name}</h4>
                              <p className="text-[10px] text-brand-gold font-bold tracking-wider uppercase">{quizResult.tagline}</p>
                              <p className="text-xs text-gray-500 font-light leading-relaxed line-clamp-2">{quizResult.description}</p>
                              
                              <div className="flex justify-between items-center pt-1.5 border-t border-gray-200">
                                <span className="font-serif italic font-extrabold text-brand-plum text-sm">{formatPrice(quizResult.price)}</span>
                                <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full ${
                                  (quizResult.stockCount ?? 0) > 0 ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"
                                }`}>
                                  {(quizResult.stockCount ?? 0) > 0 ? `${quizResult.stockCount} Candles Present` : "Sold Out"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end pt-2">
                            <button
                              onClick={() => {
                                setQuizStep(0);
                                setQuizAnswers([]);
                                setQuizResult(null);
                              }}
                              className="px-4 py-2 border border-gray-200 text-gray-500 hover:text-gray-700 text-[10px] uppercase font-bold tracking-wider rounded-lg cursor-pointer"
                            >
                              Retake Quiz
                            </button>
                             <button
                              disabled={(quizResult.stockCount ?? 0) <= 0}
                              onClick={() => {
                                addToCart(quizResult);
                                setIsQuizActive(false);
                              }}
                              className={`px-4 py-2 text-[10px] uppercase font-bold tracking-widest rounded-lg transition-all border ${
                                (quizResult.stockCount ?? 0) > 0
                                  ? "bg-white text-brand-plum border-gray-200 hover:bg-gray-50 cursor-pointer"
                                  : "bg-gray-100 text-gray-400 border-transparent cursor-not-allowed"
                              }`}
                            >
                              Add to Order
                            </button>
                            <button
                              disabled={(quizResult.stockCount ?? 0) <= 0}
                              onClick={() => {
                                buyNow(quizResult);
                                setIsQuizActive(false);
                              }}
                              className={`px-5 py-2 text-[10px] uppercase font-bold tracking-widest rounded-lg transition-all flex items-center gap-1.5 ${
                                (quizResult.stockCount ?? 0) > 0
                                  ? "bg-brand-plum text-white hover:bg-brand-plum-dark cursor-pointer shadow-sm"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              <CreditCard className="w-3.5 h-3.5 text-brand-gold" />
                              Buy Now
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Admin Area for adding new custom candle */}
                {isAdminMode && (
                  <div className="bg-emerald-50/50 border border-emerald-200 p-6 rounded-2xl shadow-inner space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-800 flex items-center gap-2">
                        <Settings className="w-4 h-4 animate-spin text-emerald-600" /> Admin Inventory Manager
                      </h4>
                      <button
                        onClick={() => setShowAddNewForm(!showAddNewForm)}
                        className="px-4 py-1.5 bg-emerald-600 text-white text-[10px] uppercase font-bold tracking-widest hover:bg-emerald-700 cursor-pointer rounded-lg"
                      >
                        {showAddNewForm ? "Cancel New Candle" : "Add New Candle Product"}
                      </button>
                    </div>

                    {/* Admin general payment settings */}
                    <div className="bg-emerald-100/40 p-4 rounded-xl border border-emerald-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-emerald-800 mb-1">
                          Default Mobile Payment Channel
                        </label>
                        <select
                          value={adminPaymentChannel}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setAdminPaymentChannel(val);
                            localStorage.setItem("admin_payment_channel", val);
                            triggerNotification(`Default channel updated to ${val}`);
                          }}
                          className="w-full bg-white border border-emerald-200 p-2 font-semibold text-emerald-900 focus:outline-none rounded-lg"
                        >
                          <option value="M-Pesa">M-Pesa (Vodacom)</option>
                          <option value="e-Mola">e-Mola (Movitel)</option>
                          <option value="m-Kesh">m-Kesh (Mcash)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-emerald-800 mb-1">
                          Seller's Mobile Money Number
                        </label>
                        <input
                          type="text"
                          value={adminPaymentNumber}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminPaymentNumber(val);
                            localStorage.setItem("admin_payment_number", val);
                          }}
                          placeholder="E.g., +258 84 123 4567"
                          className="w-full bg-white border border-emerald-200 p-2 font-mono font-semibold text-emerald-900 focus:outline-none rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Admin Announcement Ticker & Notifications Manager */}
                    <div className="bg-emerald-100/30 p-4 rounded-xl border border-emerald-200/80 text-xs space-y-3 shadow-inner">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                        <span className="block text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                          📢 Live Broadcast / Notification Ticker Manager
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Reset notifications back to school defaults?")) {
                              setNotices([
                                "🏆 Prestige Chess Knights capture provincial championship! Congratulations to our grandmasters!",
                                "🔬 Admissions open for Academic Year 2026/2027. Enroll your child in Beira's leading international academy.",
                                "🌟 Grade 12 Scholar project on eco-perfumery receives honorary award from Sofala Governor."
                              ]);
                              setCurrentNoticeIndex(0);
                              triggerNotification("Notices reset to default.");
                            }
                          }}
                          className="text-[9px] uppercase font-mono font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                        >
                          Reset Defaults
                        </button>
                      </div>
                      
                      {/* Add new notice form */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="new-notice-input"
                          placeholder="Broadcast new alert, e.g. '📢 Sports Gala starts tomorrow at 8 AM!'"
                          className="flex-1 bg-white border border-emerald-200 p-2 text-emerald-950 focus:outline-none rounded-lg text-xs"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const input = e.currentTarget;
                              const text = input.value.trim();
                              if (text) {
                                setNotices((prev) => [text, ...prev]);
                                setCurrentNoticeIndex(0);
                                input.value = "";
                                triggerNotification("Broadcast announcement added live!");
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById("new-notice-input") as HTMLInputElement;
                            const text = input?.value?.trim();
                            if (text) {
                              setNotices((prev) => [text, ...prev]);
                              setCurrentNoticeIndex(0);
                              input.value = "";
                              triggerNotification("Broadcast announcement added live!");
                            }
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[9px] tracking-widest rounded-lg cursor-pointer transition-colors"
                        >
                          Broadcast
                        </button>
                      </div>

                      {/* List of currently active notices */}
                      <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                        {notices.map((notice, index) => (
                          <div key={index} className="flex justify-between items-center bg-white border border-emerald-100 p-2.5 rounded-lg gap-2">
                            <span className="text-xs text-emerald-950 truncate flex-1 font-mono">{notice}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[9px] text-gray-400 font-bold">#{index + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (notices.length <= 1) {
                                    triggerNotification("Must have at least one notice active.");
                                    return;
                                  }
                                  setNotices((prev) => prev.filter((_, i) => i !== index));
                                  setCurrentNoticeIndex(0);
                                  triggerNotification("Notice removed from ticker.");
                                }}
                                className="text-red-500 hover:text-red-700 p-1 cursor-pointer transition-colors"
                                title="Delete broadcast"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {showAddNewForm && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 border border-emerald-100 rounded-xl">
                        <div className="space-y-3">
                          <div>
                            <label className="text-[9px] uppercase font-bold block mb-1 text-gray-500">Candle Name</label>
                            <input
                              type="text"
                              value={newCandleName}
                              onChange={(e) => setNewCandleName(e.target.value)}
                              placeholder="E.g., Imperial Gold"
                              className="w-full bg-gray-50 border border-gray-200 p-2 text-xs focus:outline-none rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] uppercase font-bold block mb-1 text-gray-500">Tagline</label>
                            <input
                              type="text"
                              value={newCandleTagline}
                              onChange={(e) => setNewCandleTagline(e.target.value)}
                              placeholder="E.g., A Regal Blend of Saffron & Myrrh"
                              className="w-full bg-gray-50 border border-gray-200 p-2 text-xs focus:outline-none rounded-lg"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] uppercase font-bold block mb-1 text-gray-500">Price (MZN / USD)</label>
                              <input
                                type="number"
                                value={newCandlePrice}
                                onChange={(e) => setNewCandlePrice(Number(e.target.value))}
                                className="w-full bg-gray-50 border border-gray-200 p-2 text-xs focus:outline-none rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] uppercase font-bold block mb-1 text-gray-500">Wax Hex Color</label>
                              <input
                                type="color"
                                value={newCandleColor}
                                onChange={(e) => setNewCandleColor(e.target.value)}
                                className="w-full h-8 bg-gray-50 border border-gray-200 cursor-pointer rounded-lg"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] uppercase font-bold block mb-1 text-gray-500">Collection</label>
                              <select
                                value={newCandleCollection}
                                onChange={(e) => setNewCandleCollection(e.target.value as any)}
                                className="w-full bg-gray-50 border border-gray-200 p-2 text-xs focus:outline-none rounded-lg cursor-pointer"
                              >
                                <option value="Prestige Heritage">Prestige Heritage</option>
                                <option value="Scholastic Scholar">Scholastic Scholar</option>
                                <option value="Coastal & Nature">Coastal & Nature</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[9px] uppercase font-bold block mb-1 text-gray-500">Candles Present (Stock) *</label>
                              <input
                                type="number"
                                min="0"
                                value={newCandleStock}
                                onChange={(e) => setNewCandleStock(Number(e.target.value))}
                                className="w-full bg-gray-50 border border-gray-200 p-2 text-xs focus:outline-none rounded-lg"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[9px] uppercase font-bold block mb-1 text-gray-500">Submit Picture / Photo of Candle</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setNewCandleImage(reader.result as string);
                                    triggerNotification("Candle photo submitted successfully!");
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="w-full text-[10px] text-gray-500 bg-gray-50 border border-gray-200 p-1.5 rounded-lg"
                            />
                            {newCandleImage && (
                              <div className="mt-2 text-center">
                                <span className="text-[8px] uppercase font-bold text-gray-400 block mb-1">Image Preview:</span>
                                <img src={newCandleImage} alt="Preview" className="h-16 mx-auto border border-gray-200 rounded object-cover" />
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="text-[9px] uppercase font-bold block mb-1 text-gray-500">Product Description</label>
                            <textarea
                              rows={2}
                              value={newCandleDesc}
                              onChange={(e) => setNewCandleDesc(e.target.value)}
                              placeholder="E.g., Hand-poured with exotic saffron, warm honey notes, and deep myrrh tree bark resins."
                              className="w-full bg-gray-50 border border-gray-200 p-2 text-xs focus:outline-none rounded-lg"
                            />
                          </div>

                          <button
                            onClick={() => {
                              if (!newCandleName) return alert("Please specify a name.");
                              const newCandle: Candle = {
                                id: `preset-admin-${Date.now()}`,
                                name: newCandleName,
                                tagline: newCandleTagline || "Signature Student Blend",
                                description: newCandleDesc || "Custom student blend.",
                                price: newCandlePrice,
                                topNotes: ["Custom Notes"],
                                heartNotes: ["Master Essence"],
                                baseNotes: ["Grounding resins"],
                                color: newCandleColor,
                                vessel: "Premium Glass Apothecary",
                                wick: "Nachhaltiges Cherrywood",
                                rating: 5.0,
                                reviewsCount: 1,
                                burnTime: "60 Hours",
                                weight: "9 oz",
                                category: "Classic",
                                collection: newCandleCollection,
                                stockCount: newCandleStock,
                                imageUri: newCandleImage
                              };
                              setCandlesList([newCandle, ...candlesList]);
                              setNewCandleName("");
                              setNewCandleTagline("");
                              setNewCandleDesc("");
                              setNewCandleStock(10);
                              setNewCandleImage("");
                              setShowAddNewForm(false);
                              triggerNotification(`Added "${newCandle.name}" successfully!`);
                            }}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[10px] tracking-wider cursor-pointer rounded-lg"
                          >
                            Save Candle to Catalog
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Low Stock Alert Banner */}
                {(() => {
                  const lowStockCandles = candlesList.filter(c => (c.stockCount ?? 0) <= 3);
                  if (lowStockCandles.length === 0) return null;

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-amber-50/85 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-100/70 rounded-xl text-amber-800 shrink-0 mt-0.5 md:mt-0">
                          <AlertTriangle className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs uppercase tracking-wider font-extrabold text-amber-950 font-mono flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            Student Lab Restock Alert
                          </h4>
                          <p className="text-xs text-amber-800/90 font-medium leading-relaxed">
                            {lowStockCandles.length} {lowStockCandles.length === 1 ? "product requires" : "products require"} immediate replenishment in the Stage 9 Scent Lab.
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {lowStockCandles.map(c => {
                              const stock = c.stockCount ?? 0;
                              return (
                                <span
                                  key={c.id}
                                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-md border ${
                                    stock === 0
                                      ? "bg-red-100/80 text-red-800 border-red-200"
                                      : "bg-amber-100/80 text-amber-800 border-amber-200"
                                  }`}
                                >
                                  <span className={`w-1 h-1 rounded-full ${stock === 0 ? "bg-red-500" : "bg-amber-500"}`} />
                                  {c.name}: {stock === 0 ? "SOLD OUT" : `${stock} left`}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      
                      {/* Interactive Restock Action */}
                      {isAdminMode && (
                        <button
                          onClick={() => {
                            setCandlesList(prev => prev.map(c => {
                              if ((c.stockCount ?? 0) <= 3) {
                                return { ...c, stockCount: 10 };
                              }
                              return c;
                            }));
                            triggerNotification("Replenished all low stock items to 10 units!");
                          }}
                          className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white font-mono text-[9px] uppercase font-bold tracking-wider rounded-lg shrink-0 transition-colors shadow-xs cursor-pointer"
                        >
                          Quick Restock (+10)
                        </button>
                      )}
                    </motion.div>
                  );
                })()}

                {/* Product Catalog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {candlesList.map((candle) => {
                    const candleComments = commentsList.filter((c) => c.candleId === candle.id);
                    const isEditing = editingCandleId === candle.id;

                    return (
                      <div
                        key={candle.id}
                        className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-mono font-bold bg-brand-plum/10 text-brand-plum px-2.5 py-1 rounded-full uppercase">
                              {candle.collection || "Signature"}
                            </span>
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-serif font-bold text-brand-plum">
                                {formatPrice(candle.price)}
                              </span>
                              {(() => {
                                const stock = candle.stockCount ?? 0;
                                if (stock === 0) {
                                  return (
                                    <span className="text-[9px] font-mono font-bold uppercase mt-1 px-2 py-0.5 rounded-full text-red-700 bg-red-50 border border-red-100">
                                      Sold Out
                                    </span>
                                  );
                                } else if (stock <= 3) {
                                  return (
                                    <span className="text-[9px] font-mono font-bold uppercase mt-1 px-2 py-0.5 rounded-full text-amber-700 bg-amber-50 border border-amber-200 animate-pulse flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                      Low Stock: {stock} left
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span className="text-[9px] font-mono font-bold uppercase mt-1 px-2 py-0.5 rounded-full text-emerald-700 bg-emerald-50 border border-emerald-100">
                                      {stock} Present
                                    </span>
                                  );
                                }
                              })()}
                            </div>
                          </div>

                          {/* Canvas-based rotating interactive candle preview */}
                          <div className="h-44 bg-gradient-to-b from-[#FFFDF9]/80 to-gray-100/30 rounded-xl flex items-center justify-center relative overflow-hidden">
                            {candle.imageUri ? (
                              <img 
                                src={candle.imageUri} 
                                alt={candle.name} 
                                className="w-full h-full object-cover rounded-xl transition-transform hover:scale-105 duration-300"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <>
                                <InteractiveCandle3D 
                                  color={candle.color} 
                                  vessel={candle.vessel}
                                  name={candle.name}
                                  isLit={false} 
                                  intensity={0.8}
                                  className="w-full h-full" 
                                />
                                <div className="absolute top-2 right-2 bg-white/70 backdrop-blur-sm p-1 rounded-full text-gray-400">
                                  <RotateCw className="w-3.5 h-3.5 animate-spin-slow text-brand-plum" />
                                </div>
                              </>
                            )}
                          </div>

                          {/* Typography Details */}
                          <div className="space-y-1">
                            <h4 className="font-serif text-lg font-extrabold text-brand-plum leading-tight">
                              {candle.name}
                            </h4>
                            <p className="text-[9px] text-brand-gold font-bold tracking-widest uppercase">
                              {candle.tagline}
                            </p>
                            <p className="text-xs text-[#5C5650] font-light leading-relaxed line-clamp-3">
                              {candle.description}
                            </p>
                          </div>

                          {/* Admin Customizer Fields */}
                          {isAdminMode && (
                            <div className="border-t border-dashed border-emerald-200 pt-3 space-y-2 text-xs bg-emerald-50/20 p-3 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="font-mono text-[9px] font-bold text-emerald-800">🛠️ Admin Styling</span>
                                <button
                                  onClick={() => {
                                    if (isEditing) {
                                      setEditingCandleId(null);
                                    } else {
                                      setEditingCandleId(candle.id);
                                      setEditCandleName(candle.name);
                                      setEditCandleTagline(candle.tagline);
                                      setEditCandlePrice(candle.price);
                                      setEditCandleDesc(candle.description);
                                      setEditCandleColor(candle.color);
                                      setEditCandleStock(candle.stockCount ?? 10);
                                      setEditCandleImage(candle.imageUri ?? "");
                                    }
                                  }}
                                  className="text-[9px] uppercase font-bold text-emerald-700 underline cursor-pointer"
                                >
                                  {isEditing ? "Done" : "Edit Properties"}
                                </button>
                              </div>

                              {isEditing && (
                                <div className="space-y-2">
                                  <div>
                                    <label className="text-[8px] font-bold text-gray-500 block">Edit Name</label>
                                    <input
                                      type="text"
                                      value={editCandleName}
                                      onChange={(e) => setEditCandleName(e.target.value)}
                                      className="w-full bg-white border border-gray-200 p-1 text-xs rounded"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-1">
                                    <div>
                                      <label className="text-[8px] font-bold text-gray-500 block">Price (MZN / USD)</label>
                                      <input
                                        type="number"
                                        value={editCandlePrice}
                                        onChange={(e) => setEditCandlePrice(Number(e.target.value))}
                                        className="w-full bg-white border border-gray-200 p-1 text-xs rounded"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[8px] font-bold text-gray-500 block">Wax Color</label>
                                      <input
                                        type="color"
                                        value={editCandleColor}
                                        onChange={(e) => setEditCandleColor(e.target.value)}
                                        className="w-full h-6 bg-white border border-gray-200 cursor-pointer rounded"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-1">
                                    <div>
                                      <label className="text-[8px] font-bold text-gray-500 block">Stock Count</label>
                                      <input
                                        type="number"
                                        min="0"
                                        value={editCandleStock}
                                        onChange={(e) => setEditCandleStock(Number(e.target.value))}
                                        className="w-full bg-white border border-gray-200 p-1 text-xs rounded"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[8px] font-bold text-gray-500 block">Change Photo</label>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                              setEditCandleImage(reader.result as string);
                                              triggerNotification("New photo uploaded!");
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                        className="w-full text-[8px] text-gray-500"
                                      />
                                    </div>
                                  </div>

                                  {editCandleImage && (
                                    <div className="text-center">
                                      <span className="text-[7px] text-gray-400 block mb-0.5">Custom Image Preview:</span>
                                      <img src={editCandleImage} alt="Preview" className="h-10 mx-auto border rounded object-cover" />
                                      <button
                                        type="button"
                                        onClick={() => setEditCandleImage("")}
                                        className="text-[8px] text-red-500 underline mt-0.5"
                                      >
                                        Remove Photo (revert to 3D)
                                      </button>
                                    </div>
                                  )}

                                  <button
                                    onClick={() => {
                                      setCandlesList((prev) =>
                                        prev.map((c) =>
                                          c.id === candle.id
                                            ? {
                                                ...c,
                                                name: editCandleName,
                                                price: editCandlePrice,
                                                color: editCandleColor,
                                                stockCount: editCandleStock,
                                                imageUri: editCandleImage,
                                              }
                                            : c
                                        )
                                      );
                                      setEditingCandleId(null);
                                      triggerNotification(`Updated "${candle.name}" details!`);
                                    }}
                                    className="w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[8px] font-bold uppercase tracking-wider rounded cursor-pointer"
                                  >
                                    Save Updates
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm("Delete this candle from catalog?")) {
                                        setCandlesList(candlesList.filter((c) => c.id !== candle.id));
                                        triggerNotification("Removed candle from catalog.");
                                      }
                                    }}
                                    className="w-full py-1 bg-red-600 hover:bg-red-700 text-white text-[8px] font-bold uppercase tracking-wider rounded cursor-pointer"
                                  >
                                    Delete Product
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Scent Reviews / Comments */}
                          <div className="border-t border-gray-100 pt-3 space-y-2">
                            <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold font-mono">
                              <span>Scent Reviews & Comments</span>
                              <span>{candleComments.length} review(s)</span>
                            </div>

                            {candleComments.length === 0 ? (
                              <p className="text-[10px] italic text-gray-400 font-light">
                                No comments yet. Support our student project to leave feedback!
                              </p>
                            ) : (
                              <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                                {candleComments.map((comment) => (
                                  <div key={comment.id} className="bg-[#FAF9F6] p-2 rounded-lg text-[10px] space-y-0.5">
                                    <div className="flex justify-between items-center">
                                      <span className="font-bold text-gray-700">{comment.author}</span>
                                      <span className="text-brand-gold font-bold">{"★".repeat(comment.rating)}</span>
                                    </div>
                                    <p className="text-gray-600 font-light italic">"{comment.comment}"</p>
                                    {comment.suggestion && (
                                      <div className="text-[8px] text-brand-gold-dark font-mono mt-0.5">
                                        💡 Suggested Blend: {comment.suggestion}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order button */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-1.5 flex-wrap">
                          <span className="text-[9px] text-gray-400 font-mono">60hr Study burn</span>
                          <div className="flex gap-1.5">
                            <button
                              disabled={(candle.stockCount ?? 0) <= 0}
                              onClick={() => addToCart(candle)}
                              className={`px-3 py-1.5 text-[9px] uppercase font-bold tracking-wider transition-all rounded-lg border ${
                                (candle.stockCount ?? 0) > 0
                                  ? "bg-white text-brand-plum border-gray-200 hover:bg-gray-50 cursor-pointer"
                                  : "bg-gray-100 text-gray-400 border-transparent cursor-not-allowed"
                              }`}
                            >
                              Add
                            </button>
                            <button
                              disabled={(candle.stockCount ?? 0) <= 0}
                              onClick={() => buyNow(candle)}
                              className={`px-3.5 py-1.5 text-[9px] uppercase font-bold tracking-wider transition-all rounded-lg flex items-center gap-1 ${
                                (candle.stockCount ?? 0) > 0
                                  ? "bg-brand-plum text-white hover:bg-brand-plum-dark cursor-pointer shadow-xs"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              <CreditCard className="w-3 h-3 text-brand-gold" />
                              Buy Now
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* BOTTOM SCROLLING TICKER AD */}
                {tickerActive && (
                  <div className="bg-brand-plum text-white rounded-xl py-3 px-4 sm:px-6 shadow-md relative overflow-hidden flex flex-col sm:flex-row items-stretch sm:items-center border border-brand-gold/20 gap-3">
                    <div className="bg-brand-plum-dark -ml-4 -mt-3 -mb-3 sm:-ml-6 px-4 flex items-center text-[9px] font-bold font-mono text-brand-gold border-r border-brand-gold/15 shrink-0 py-2 sm:py-0">
                      📢 NEWS FLASH
                    </div>
                    
                    <div 
                      className="flex-1 overflow-hidden relative min-h-[24px] flex items-center select-none"
                      onMouseEnter={() => setIsTickerPlaying(false)}
                      onMouseLeave={() => setIsTickerPlaying(true)}
                    >
                      <AnimatePresence mode="wait">
                        {notices.length > 0 ? (
                          <motion.div
                            key={currentNoticeIndex}
                            initial={{ opacity: 0, x: 25 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -25 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="text-xs font-mono tracking-wide text-pink-50 pr-4 block truncate leading-relaxed"
                            title="Hover to pause auto-scroll"
                          >
                            {notices[currentNoticeIndex]}
                          </motion.div>
                        ) : (
                          <span className="text-xs font-mono text-gray-400 italic">No broadcasts active at this moment.</span>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 z-10 shrink-0 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                      {/* Notice Navigator & Scrolling Controls */}
                      {notices.length > 1 && (
                        <div className="flex items-center gap-1.5 bg-brand-plum-dark/40 px-2 py-1 rounded-lg border border-white/5">
                          <button
                            type="button"
                            onClick={() => {
                              setIsTickerPlaying(false);
                              setCurrentNoticeIndex((prev) => (prev - 1 + notices.length) % notices.length);
                            }}
                            className="p-1 hover:text-brand-gold text-pink-200 hover:bg-white/5 transition-all cursor-pointer rounded"
                            title="Previous Notice"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[9px] font-mono font-bold text-brand-gold select-none px-1">
                            {currentNoticeIndex + 1}/{notices.length}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsTickerPlaying(false);
                              setCurrentNoticeIndex((prev) => (prev + 1) % notices.length);
                            }}
                            className="p-1 hover:text-brand-gold text-pink-200 hover:bg-white/5 transition-all cursor-pointer rounded"
                            title="Next Notice"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsTickerPlaying(!isTickerPlaying)}
                            className="p-1 hover:text-brand-gold text-pink-200 hover:bg-white/5 transition-all cursor-pointer rounded ml-1 border-l border-white/10 pl-1.5"
                            title={isTickerPlaying ? "Pause Auto-scroll" : "Resume Auto-scroll"}
                          >
                            {isTickerPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 animate-pulse" />}
                          </button>
                        </div>
                      )}

                      {/* Small clear notice button */}
                      {notices.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Reset/Clear notification ticker?")) {
                              setNotices([
                                "🏆 Prestige Chess Knights capture provincial championship! Congratulations to our grandmasters!",
                                "🔬 Admissions open for Academic Year 2026/2027. Enroll your child in Beira's leading international academy.",
                                "🌟 Grade 12 Scholar project on eco-perfumery receives honorary award from Sofala Governor."
                              ]);
                              setCurrentNoticeIndex(0);
                              triggerNotification("Notification ticker reset to school announcements.");
                            }
                          }}
                          className="text-[9px] font-mono uppercase bg-white/5 hover:bg-white/10 text-pink-200 border border-white/10 hover:border-brand-gold/30 px-2.5 py-1 rounded-lg cursor-pointer transition-all"
                          title="Reset notices to school default"
                        >
                          Reset
                        </button>
                      )}

                      <button
                        onClick={() => setTickerActive(false)}
                        className="p-1 text-pink-300 hover:text-brand-gold text-[9px] font-mono font-bold border border-pink-300/15 hover:border-brand-gold/30 cursor-pointer rounded px-2"
                        title="Close Notice Bar"
                      >
                        CLOSE
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==============================================
                VIEW 3: ORDER REGISTRY & LIVE F2F WORKFLOW
                ============================================== */}
            {currentView === "registry" && (
              <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-12 space-y-10 animate-fade-in">
                {/* Header Block */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-gray-200 pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:justify-start gap-4 w-full lg:w-auto">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.4em] text-brand-gold font-bold font-mono">Face-to-Face kiosk station</span>
                      <h2 className="text-3xl md:text-5xl font-serif italic text-brand-plum uppercase font-extrabold mt-1">Live Order Desk</h2>
                    </div>

                    {/* Small button to clear the registry immediately with absolute simplicity */}
                    <button
                      onClick={() => {
                        if (confirm("🚨 DANGER ZONE: Are you sure you want to clear ALL order registry logs? This action is permanent and resets your sales record!")) {
                          setPlacedOrders([]);
                          triggerNotification("Full Order Registry cleared successfully.");
                        }
                      }}
                      className="px-3.5 py-2 bg-red-50 hover:bg-red-100/80 border border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 text-[10px] uppercase font-bold tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-center mt-2 sm:mt-0"
                      title="Clear Order Registry History"
                      id="clear-registry-header-btn"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Registry</span>
                    </button>
                  </div>

                  {/* Aggregated Statistics */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs w-full lg:w-auto">
                    <div className="bg-[#FAF6F0] p-3 border border-brand-plum/10 rounded-xl">
                      <span className="text-[8px] uppercase text-gray-400 block font-bold">Total Orders</span>
                      <span className="text-base font-serif font-extrabold text-brand-plum">{placedOrders.length}</span>
                    </div>
                    <div className="bg-[#FAF6F0] p-3 border border-brand-plum/10 rounded-xl">
                      <span className="text-[8px] uppercase text-gray-400 block font-bold">Funds Raised</span>
                      <span className="text-base font-serif font-extrabold text-emerald-700">
                        {formatPrice(placedOrders.reduce((acc, order) => acc + (currency === order.currency ? order.total : (order.currency === "USD" ? order.total * EXCHANGE_RATE : order.total / EXCHANGE_RATE)), 0))}
                      </span>
                    </div>
                    <div className="bg-[#FAF6F0] p-3 border border-brand-plum/10 rounded-xl col-span-2 sm:col-span-1">
                      <span className="text-[8px] uppercase text-gray-400 block font-bold">Poured Candles</span>
                      <span className="text-base font-serif font-extrabold text-brand-gold-dark">
                        {placedOrders.reduce((acc, order) => acc + order.items.reduce((sum, item) => sum + item.quantity, 0), 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* F2F ACTIVE HANDOVER DESK */}
                <div className="bg-white border border-brand-gold/25 shadow-lg rounded-2xl p-6 space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                      <h3 className="text-xs uppercase tracking-widest font-bold text-brand-plum">
                        🎁 Face-to-Face Active Handover Desk
                      </h3>
                    </div>
                    <span className="text-[10px] bg-brand-gold/15 text-brand-gold-dark font-mono px-2.5 py-1 rounded-full font-bold">
                      Seller & Student Station
                    </span>
                  </div>

                  {placedOrders.filter(o => o.deliveryStatus !== "confirmed_completed").length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-400 font-light">
                      No pending handovers. Check out some candles in Scent Studio or Marketplace to test this live flow!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-[11px] text-[#5C5650] italic font-light">
                        This panel allows you (the Seller) and the buyer (the Student) to complete handovers live at the school booth.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {placedOrders.filter(o => o.deliveryStatus !== "confirmed_completed").map((order) => (
                          <div
                            key={order.orderId}
                            className={`p-4 border rounded-xl space-y-3 relative overflow-hidden transition-all ${
                              order.deliveryStatus === "delivered"
                                ? "bg-amber-50/50 border-amber-300"
                                : "bg-[#FFFDFB] border-brand-gold/20"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-bold text-xs text-brand-plum">{order.studentName}</h5>
                                <p className="text-[9px] font-mono text-gray-400">Order Ref: {order.orderId}</p>
                              </div>
                              <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                                order.deliveryStatus === "delivered"
                                  ? "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                                  : "bg-blue-50 text-blue-800 border border-blue-200"
                              }`}>
                                {order.deliveryStatus === "delivered" ? "Awaiting Confirm" : "With Seller (Pending)"}
                              </span>
                            </div>

                            <div className="bg-gray-50/70 p-2 rounded text-[11px] font-mono">
                              <span className="text-[8px] text-gray-400 block uppercase font-bold">Items Purchased:</span>
                              {order.items.map((it) => (
                                <div key={it.candle.id} className="text-gray-700 font-semibold truncate">
                                  &bull; {it.quantity}x {it.candle.name}
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2">
                              {/* Seller Actions */}
                              <button
                                disabled={order.deliveryStatus === "delivered"}
                                onClick={() => {
                                  setPlacedOrders((prev) =>
                                    prev.map((o) =>
                                      o.orderId === order.orderId
                                        ? { ...o, deliveryStatus: "delivered" }
                                        : o
                                    )
                                  );
                                  triggerNotification(`Order ${order.orderId} marked as DELIVERED by seller!`);
                                }}
                                className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                                  order.deliveryStatus === "delivered"
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-300 font-semibold"
                                    : "bg-brand-plum text-white hover:bg-brand-plum-dark shadow-sm cursor-pointer"
                                }`}
                              >
                                {order.deliveryStatus === "delivered" ? "✓ Handed Over" : "🎁 Seller Handover"}
                              </button>

                              {/* Buyer Actions */}
                              <button
                                disabled={order.deliveryStatus !== "delivered"}
                                onClick={() => {
                                  setPlacedOrders((prev) =>
                                    prev.map((o) =>
                                      o.orderId === order.orderId
                                        ? { ...o, deliveryStatus: "confirmed_completed" }
                                        : o
                                    )
                                  );
                                  setFeedbackPopupOrder(order);
                                  setFeedbackRating(5);
                                  setFeedbackText("");
                                  setFeedbackSuggestion("");
                                  setFeedbackAuthor(order.studentName);
                                  triggerNotification(`Buyer confirmed receipt of ${order.orderId}.`);
                                }}
                                className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                                  order.deliveryStatus !== "delivered"
                                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                    : "bg-brand-gold text-brand-plum hover:bg-brand-gold-dark shadow-md cursor-pointer border border-brand-gold/30"
                                }`}
                              >
                                🙋 Confirm Receipt
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Registry History List */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="text-xs font-mono font-semibold text-gray-400 font-bold">All Device Orders ({placedOrders.length})</span>
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to clear this device's local registry?")) {
                          setPlacedOrders([]);
                          triggerNotification("Device registry cleared.");
                        }
                      }}
                      className="text-[10px] uppercase font-bold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear History
                    </button>
                  </div>

                  {placedOrders.length === 0 ? (
                    <p className="text-xs text-gray-500 italic font-light text-center py-10">No order history found on this school kiosk.</p>
                  ) : (
                    <>
                      {/* Desktop layout */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-gray-200 text-[9px] uppercase tracking-wider text-brand-plum font-bold bg-[#FAF6F0]/50">
                              <th className="px-3 py-2.5">Student & Class</th>
                              <th className="px-3 py-2.5">Order ID & Date</th>
                              <th className="px-3 py-2.5">Curated Scent Selection</th>
                              <th className="px-3 py-2.5">Delivery Node</th>
                              <th className="px-3 py-2.5">Total</th>
                              <th className="px-3 py-2.5 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-[11px]">
                            {placedOrders.map((order, idx) => {
                              const isDelivered = order.deliveryStatus === "delivered";
                              const isConfirmed = order.deliveryStatus === "confirmed_completed";
                              return (
                                <motion.tr 
                                  key={order.orderId}
                                  initial={{ opacity: 0, y: 12 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.4), ease: "easeOut" }}
                                  className={`border-b border-gray-100 transition-colors ${
                                    isDelivered
                                      ? "animate-pulse-delivered bg-amber-50/20"
                                      : isConfirmed
                                      ? "animate-pulse-confirmed bg-emerald-50/10"
                                      : "hover:bg-gray-50/50"
                                  }`}
                                >
                                  <td className="px-3 py-2">
                                    <div className="font-bold text-brand-plum flex items-center gap-1.5">
                                      <User className="w-3 h-3 text-brand-gold shrink-0" />
                                      <span className="truncate max-w-[150px]">{order.studentName}</span>
                                    </div>
                                    <div className="text-[9px] text-gray-500 font-mono mt-0.5">
                                      <span className="bg-brand-plum/10 text-brand-plum px-1 py-0.2 rounded-none font-semibold">
                                        {order.gradeClass}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 font-mono text-[9px]">
                                    <div className="font-semibold text-gray-700">{order.orderId}</div>
                                    <div className="text-gray-400 mt-0.5">{order.timestamp}</div>
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="space-y-0.5">
                                      {order.items.map((item, itemIdx) => (
                                        <div key={itemIdx} className="flex items-center gap-1.5">
                                          <span className="font-mono bg-brand-gold/15 text-brand-gold-dark px-1 py-0.1 font-bold text-[8px] rounded-xs">
                                            {item.quantity}x
                                          </span>
                                          <span className="text-gray-800 font-semibold truncate max-w-[150px]">{item.candle.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-gray-600 font-mono text-[10px]">
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-brand-gold shrink-0" />
                                      <span className="truncate max-w-[100px]">{order.deliveryMethod}</span>
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 font-serif font-bold text-brand-plum text-[11px]">
                                    {currency === order.currency
                                      ? formatPrice(order.total)
                                      : formatPrice(order.currency === "USD" ? order.total * EXCHANGE_RATE : order.total / EXCHANGE_RATE)
                                    }
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-mono font-bold rounded-full border ${
                                      isConfirmed
                                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                        : isDelivered
                                        ? "bg-amber-100 text-amber-800 border-amber-300 animate-pulse"
                                        : "bg-blue-100 text-blue-800 border-blue-300"
                                    }`}>
                                      {isConfirmed
                                        ? "✓ Received"
                                        : isDelivered
                                        ? "🎁 Handed"
                                        : "● Pending"}
                                    </span>
                                  </td>
                                </motion.tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile cards */}
                      <div className="md:hidden grid grid-cols-1 gap-3">
                        {placedOrders.map((order, idx) => {
                          const isDelivered = order.deliveryStatus === "delivered";
                          const isConfirmed = order.deliveryStatus === "confirmed_completed";
                          
                          return (
                            <motion.div 
                              key={order.orderId}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.4), ease: "easeOut" }}
                              className={`bg-white border rounded-xl p-3 space-y-2.5 shadow-xs transition-all ${
                                isDelivered
                                  ? "animate-pulse-delivered bg-amber-50/15"
                                  : isConfirmed
                                  ? "animate-pulse-confirmed bg-emerald-50/5"
                                  : "border-gray-100"
                              }`}
                            >
                              {/* Header: Student name & Status */}
                              <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                  <div className="font-bold text-xs text-brand-plum truncate">{order.studentName}</div>
                                  <span className="inline-block text-[9px] bg-brand-plum/10 text-brand-plum px-1 py-0.2 font-mono mt-0.5">
                                    {order.gradeClass}
                                  </span>
                                </div>
                                <span className={`shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-mono font-bold rounded-full border ${
                                  isConfirmed
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : isDelivered
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : "bg-blue-50 text-blue-800 border-blue-200"
                                }`}>
                                  {isConfirmed
                                    ? "✓ Received"
                                    : isDelivered
                                    ? "🎁 Handed"
                                    : "● Pending"}
                                </span>
                              </div>

                              {/* Order Metadata Row */}
                              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] text-gray-500 font-mono border-t border-gray-100/70 pt-2">
                                <div className="truncate">
                                  <span className="text-gray-400">ID:</span> <span className="font-semibold text-gray-700">{order.orderId}</span>
                                </div>
                                <div className="text-right truncate">
                                  <span className="text-gray-400">Node:</span> <span className="font-semibold text-gray-700">{order.deliveryMethod}</span>
                                </div>
                                <div className="truncate col-span-2">
                                  <span className="text-gray-400">Date:</span> <span className="text-gray-600">{order.timestamp}</span>
                                </div>
                              </div>

                              {/* Items list */}
                              <div className="bg-[#FAF9F6]/80 p-2 rounded-lg text-[10px] space-y-1">
                                {order.items.map((it, itemIdx) => (
                                  <div key={itemIdx} className="flex items-center gap-1.5 text-gray-700 font-medium">
                                    <span className="font-mono bg-brand-gold/15 text-brand-gold-dark px-1 py-0.1 font-bold text-[8px] rounded-sm">
                                      {it.quantity}x
                                    </span>
                                    <span className="truncate">{it.candle.name}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Footer: Order Total */}
                              <div className="flex justify-between items-center text-[10px] border-t border-gray-100/70 pt-2 font-mono">
                                <span className="text-gray-400 uppercase tracking-wider text-[8px]">Total paid</span>
                                <span className="font-serif font-extrabold text-brand-plum text-xs">
                                  {currency === order.currency
                                    ? formatPrice(order.total)
                                    : formatPrice(order.currency === "USD" ? order.total * EXCHANGE_RATE : order.total / EXCHANGE_RATE)
                                  }
                                </span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ==============================================
                VIEW 4: SCHOOL BULLETIN & ADS
                ============================================== */}
            {currentView === "ads" && (
              <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-12 space-y-12 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.4em] text-brand-gold font-bold font-mono">Student notice board</span>
                    <h2 className="text-3xl md:text-5xl font-serif italic text-brand-plum uppercase font-extrabold mt-1">Prestige Bulletin</h2>
                  </div>
                  <p className="text-xs text-[#5C5650] max-w-sm font-light leading-relaxed">
                    Keeping our students, parents, and community informed about academic excellence and cooperative enterprises at Prestige Academy.
                  </p>
                </div>

                {/* Bento Grid School Ads */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* AD 1 */}
                  <div className="bg-white border-2 border-brand-gold rounded-2xl overflow-hidden shadow-md flex flex-col justify-between">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-1.5 text-brand-gold text-xs font-bold font-mono">
                        <GraduationCap className="w-4 h-4 text-brand-gold" />
                        <span>ADMISSIONS OPEN</span>
                      </div>
                      <h4 className="font-serif text-xl font-bold text-brand-plum leading-tight">Enroll Your Future Leader Today</h4>
                      <p className="text-xs text-[#5C5650] font-light leading-relaxed">
                        Prestige Academy in Beira, Mozambique is accepting applications for the 2026/2027 scholastic year. Experience first-rate science & entrepreneurship.
                      </p>
                    </div>
                    <div className="bg-brand-plum p-4 text-center">
                      <a href="mailto:prestigeschoolbeira@gmail.com" className="text-brand-gold font-bold font-mono text-[9px] uppercase tracking-widest block hover:underline">
                        Apply via Mail Now
                      </a>
                    </div>
                  </div>

                  {/* AD 2 */}
                  <div className="bg-[#FAF6F0] border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-1.5 text-brand-gold-dark text-xs font-bold font-mono">
                        <Award className="w-4 h-4" />
                        <span>CHESS CHAMPIONS</span>
                      </div>
                      <h4 className="font-serif text-xl font-bold text-brand-plum leading-tight">Prestige Knights Take Sofala Gold</h4>
                      <p className="text-xs text-[#5C5650] font-light leading-relaxed">
                        Our Student Chess Club won first prize in the Sofala Provincial Championships! Analytical chemistry study habits and mental focus made the difference.
                      </p>
                    </div>
                    <div className="bg-gray-100 p-4 text-center font-mono text-[9px] uppercase tracking-widest font-bold text-gray-500">
                      🏆 Congratulations Knights!
                    </div>
                  </div>

                  {/* AD 3 */}
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-1.5 text-brand-plum text-xs font-bold font-mono">
                        <Flame className="w-4 h-4 text-brand-gold" />
                        <span>COOPERATIVE</span>
                      </div>
                      <h4 className="font-serif text-xl font-bold text-brand-plum leading-tight">Stage 9 Organic Synthesis Lab</h4>
                      <p className="text-xs text-[#5C5650] font-light leading-relaxed">
                        Learn how we turn standard natural soy, essential plant oils, and sustainable cherrywood into luxury candle products.
                      </p>
                    </div>
                    <div className="bg-brand-gold/15 p-4 text-center">
                      <button onClick={() => setCurrentView("studio")} className="text-brand-plum font-bold font-mono text-[9px] uppercase tracking-widest block hover:underline w-full cursor-pointer">
                        Learn & Blend Scent
                      </button>
                    </div>
                  </div>

                  {/* AD 4 */}
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold font-mono">
                        <Sparkles className="w-4 h-4 text-brand-gold" />
                        <span>SPORTSDAY FINALS</span>
                      </div>
                      <h4 className="font-serif text-xl font-bold text-brand-plum leading-tight">Phoenix vs Lions Field Showdown</h4>
                      <p className="text-xs text-[#5C5650] font-light leading-relaxed">
                        Join us this Friday at the Macuti sports court! Basketball finals and student food booths. Scent Studio candles sold live at the entry kiosk!
                      </p>
                    </div>
                    <div className="bg-emerald-50 p-4 text-center font-mono text-[9px] uppercase tracking-widest font-bold text-emerald-800">
                      🏀 Friday at 4:00 PM
                    </div>
                  </div>
                </div>

                {/* Scent Chemistry Story */}
                <div className="bg-[#FAF6F0]/60 p-6 rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <h3 className="font-serif text-2xl italic text-brand-plum">Prestige Academy: Cultivating Bright Futures</h3>
                    <p className="text-xs text-[#5C5650] leading-relaxed font-light">
                      At Prestige Academy, our curriculum merges academic rigor with real entrepreneurship. In the Stage 9 Scent Studio, students apply classroom organic chemistry to physical cosmetic formulations and operate the live storefront at our Macuti campus booth.
                    </p>
                    <p className="text-xs text-[#5C5650] leading-relaxed font-light">
                      Every candle purchased funds school sports equipment, lab glassware, and educational excursions for underrepresented Sofala youth.
                    </p>
                  </div>
                  <div className="bg-white p-5 border border-gray-200 rounded-xl space-y-3">
                    <div className="text-[10px] uppercase font-mono tracking-widest text-brand-gold font-bold font-semibold">Initiative Metrics</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-gray-400 block font-light">Participants</span>
                        <span className="text-2xl font-serif text-brand-plum font-extrabold">120+ Scholars</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block font-light">Botanicals</span>
                        <span className="text-2xl font-serif text-brand-plum font-extrabold">24 Extracts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* PRESTIGE SCHOOL SCENT STUDIO FOOTER */}
      <footer className="border-t border-[#EBE6E0] bg-[#FAF6F0]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 text-[#2A2624]">
          <div>
            <div className="text-lg font-serif tracking-[0.2em] font-extrabold text-brand-plum mb-2">PRESTIGE SCHOOL SCENT STUDIO</div>
            <p className="text-[11px] text-[#8C847C] font-mono leading-relaxed">
              Youth Cooperative Entrepreneurship Project &bull; Beira, Mozambique
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 text-[10px] uppercase tracking-[0.2em] text-[#5C5650] font-semibold">
            <div className="flex flex-col gap-2">
              <span className="text-brand-plum font-bold uppercase tracking-wider">Contacts</span>
              <span className="text-xs font-mono lowercase">prestigeschoolbeira@gmail.com</span>
              <span className="text-xs font-mono">(+258) 84 444 3179 / 86-744-3179</span>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-brand-plum font-bold uppercase tracking-wider">Location</span>
              <span>Moçambique-Sofala-Beira-Macuti</span>
              <span className="text-emerald-700">100% Student Crafted & Managed</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#EBE6E0] py-6 px-6 md:px-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between text-[9px] uppercase tracking-[0.2em] text-[#A69E96] font-semibold max-w-7xl mx-auto">
          <div>© {new Date().getFullYear()} Prestige School Scent Studio. All rights reserved.</div>
          <div className="flex space-x-12 mt-4 md:mt-0">
            <span>Local Homeroom Delivery</span>
            <span>Sustainable Chemistry Initiative</span>
          </div>
        </div>
      </footer>

      {/* CART DRAWER PANEL */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-[#2A2624]/40 backdrop-blur-sm transition-opacity"
          />

          <div className="relative w-full max-w-md bg-[#FDFCFB] shadow-2xl h-full flex flex-col justify-between z-10 border-l border-[#EBE6E0]">
            
            {/* Header */}
            <div className="p-6 border-b border-[#EBE6E0] flex justify-between items-center bg-white">
              <div>
                <h3 className="text-lg font-serif italic text-[#2A2624] uppercase">Your Curated Order</h3>
                <span className="text-[10px] font-mono text-[#A69E96]">Lumina Scent Studio &bull; Checkout</span>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-[#8C847C] hover:text-[#2A2624] text-[11px] uppercase tracking-widest font-semibold focus:outline-none"
              >
                Close
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-xs text-[#8C847C] font-light space-y-4">
                  <ShoppingBag className="w-8 h-8 opacity-40 text-[#2A2624]" />
                  <p className="italic">"Your sensory order is currently vacant."</p>
                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      const collectionsEl = document.getElementById("collections-section");
                      if (collectionsEl) collectionsEl.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-6 py-2.5 bg-[#2A2624] text-[#FDFCFB] text-[10px] uppercase tracking-widest font-semibold"
                  >
                    Browse Collections
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.candle.id} className="flex gap-4 p-4 border border-[#EBE6E0] bg-white">
                    {/* Tiny preview */}
                    <div className="w-16 h-20 bg-[#F5F2EE] flex items-center justify-center border border-[#EBE6E0] overflow-hidden relative">
                      <div className="scale-[0.4] transform origin-center absolute">
                        <CandleVisualizer 
                          candle={item.candle} 
                          isLit={activeCandle.id === item.candle.id && isLit} 
                          onToggleLight={() => selectActiveCandle(item.candle)} 
                          size="sm" 
                        />
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-serif text-sm italic text-[#2A2624] uppercase font-semibold">
                            {item.candle.name}
                          </h4>
                          <button 
                            onClick={() => removeFromCart(item.candle.id)}
                            className="text-[#8C847C] hover:text-red-700 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-[#8C847C] font-mono leading-none mt-1">
                          {item.candle.vessel} &bull; {item.candle.wick.split(" ")[0]}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center space-x-2 border border-[#D9D3CC] px-2 py-0.5 bg-[#FDFCFB]">
                          <button 
                            onClick={() => updateQuantity(item.candle.id, -1)}
                            className="text-xs text-[#5C5650] hover:text-[#2A2624] focus:outline-none"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono font-semibold text-[#2A2624] w-4 text-center">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.candle.id, 1)}
                            className="text-xs text-[#5C5650] hover:text-[#2A2624] focus:outline-none"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-serif italic text-sm text-[#2A2624] font-semibold">
                          {formatPrice(item.candle.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-[#EBE6E0] bg-white space-y-4">
                <div className="space-y-1.5 font-mono text-xs text-[#5C5650]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-serif italic text-sm text-[#2A2624] font-semibold">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Worldwide Shipping</span>
                    <span className="text-emerald-700 font-bold uppercase text-[10px]">Free</span>
                  </div>
                </div>

                <div className="border-t border-[#EBE6E0] pt-4 flex justify-between items-center mb-2">
                  <span className="text-xs uppercase tracking-wider text-[#2A2624] font-semibold">Total Curated Order</span>
                  <span className="text-xl font-serif italic text-[#2A2624] font-bold">{formatPrice(cartTotal)}</span>
                </div>

                <button 
                  onClick={() => {
                    setIsCheckoutFormOpen(true);
                  }}
                  className="w-full py-4 bg-brand-plum text-white text-[11px] uppercase tracking-[0.25em] hover:bg-brand-plum-dark transition-all font-bold shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-4 h-4 text-brand-gold" />
                  <span>Register Student Order</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* STUDENT REGISTRAR FORM MODAL */}
      {isCheckoutFormOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 overflow-y-auto flex justify-center p-4">
          <div className="bg-white max-w-lg w-full border-2 border-brand-plum shadow-2xl p-6 sm:p-8 animate-fade-in relative rounded-2xl my-auto">
            <button 
              onClick={() => setIsCheckoutFormOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-brand-plum font-bold cursor-pointer text-lg p-1"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
              <GraduationCap className="w-8 h-8 text-brand-plum" />
              <div>
                <h3 className="font-serif text-lg font-bold text-brand-plum uppercase tracking-wider">Fast Student Checkout</h3>
                <p className="text-[10px] text-gray-500 font-mono">Simple & direct handover registration between students</p>
              </div>
            </div>

            {/* Strict F2F Delivery Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs flex gap-2.5 items-start">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-800 font-bold uppercase tracking-wider block text-[10px] mb-0.5">School Premises Handover Only</strong>
                <p className="text-amber-700 leading-relaxed text-[11px]">
                  No home delivery! Direct face-to-face handover on the school premises. Pay at school or transfer using mobile money below.
                </p>
              </div>
            </div>

            <form onSubmit={handlePlaceStudentOrder} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-brand-plum block mb-1">
                  Student/Buyer Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter full name (e.g. Afonso Macuti)"
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 pl-10 text-sm focus:outline-none focus:border-brand-plum rounded-xl"
                  />
                </div>
              </div>

              {/* Grade / Class Selection */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-brand-plum block mb-1">
                  Grade or Class *
                </label>
                <select
                  value={gradeClass}
                  onChange={(e) => setGradeClass(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 text-sm focus:outline-none focus:border-brand-plum rounded-xl cursor-pointer"
                >
                  <option value="Tiny Tots">Tiny Tots</option>
                  <option value="Nursery">Nursery</option>
                  <option value="Reception">Reception</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                  <option value="Grade 13">Grade 13</option>
                  <option value="Teachers & Staff">Teachers & Staff</option>
                </select>
              </div>

              {/* PAYMENT METHOD SELECTOR */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-brand-plum block mb-2">
                  Choose Payment Method *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentType("cash")}
                    className={`p-2.5 border rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer ${
                      paymentType === "cash"
                        ? "border-brand-plum bg-brand-cream/10 ring-1 ring-brand-plum"
                        : "border-gray-200 bg-gray-50/50 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-bold text-brand-plum">Cash (F2F)</span>
                      <span className="w-2.5 h-2.5 rounded-full transition-colors" style={{ backgroundColor: paymentType === "cash" ? "#8A1540" : "#D1D5DB" }} />
                    </div>
                    <span className="text-[9px] text-gray-400 font-light">Pay cash physically at school.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType("mpesa")}
                    className={`p-2.5 border rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer ${
                      paymentType === "mpesa"
                        ? "border-brand-plum bg-brand-cream/10 ring-1 ring-brand-plum"
                        : "border-gray-200 bg-gray-50/50 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-bold text-[#E61C24] flex items-center gap-1">M-Pesa</span>
                      <span className="w-2.5 h-2.5 rounded-full transition-colors" style={{ backgroundColor: paymentType === "mpesa" ? "#8A1540" : "#D1D5DB" }} />
                    </div>
                    <span className="text-[9px] text-gray-400 font-light">Vodacom mobile money transfer.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType("emola")}
                    className={`p-2.5 border rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer ${
                      paymentType === "emola"
                        ? "border-brand-plum bg-brand-cream/10 ring-1 ring-brand-plum"
                        : "border-gray-200 bg-gray-50/50 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-bold text-[#FF8200] flex items-center gap-1">e-Mola</span>
                      <span className="w-2.5 h-2.5 rounded-full transition-colors" style={{ backgroundColor: paymentType === "emola" ? "#8A1540" : "#D1D5DB" }} />
                    </div>
                    <span className="text-[9px] text-gray-400 font-light">Movitel mobile money transfer.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType("mcash")}
                    className={`p-2.5 border rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer ${
                      paymentType === "mcash"
                        ? "border-brand-plum bg-brand-cream/10 ring-1 ring-brand-plum"
                        : "border-gray-200 bg-gray-50/50 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-bold text-[#00A896] flex items-center gap-1">m-Kesh</span>
                      <span className="w-2.5 h-2.5 rounded-full transition-colors" style={{ backgroundColor: paymentType === "mcash" ? "#8A1540" : "#D1D5DB" }} />
                    </div>
                    <span className="text-[9px] text-gray-400 font-light">m-Kesh (Mcash) payment.</span>
                  </button>
                </div>
              </div>

              {/* MOBILE MONEY TRANSFER DETAILS PANEL */}
              {paymentType !== "cash" && (
                <div className="bg-brand-plum/5 border border-brand-plum/10 rounded-xl p-3.5 space-y-3">
                  <div className="text-xs text-brand-plum font-semibold">
                    📲 How to Pay via {paymentType === "mpesa" ? "M-Pesa" : paymentType === "emola" ? "e-Mola" : "m-Kesh (Mcash)"}:
                  </div>
                  <div className="bg-white p-2.5 border border-gray-100 rounded-lg text-xs flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase font-mono font-bold">Seller's Transfer Number</span>
                      <span className="font-mono text-sm font-bold text-brand-plum">{adminPaymentNumber}</span>
                    </div>
                    <span className="text-[9px] bg-brand-plum/15 text-brand-plum px-2.5 py-1 rounded-full uppercase font-mono font-bold">
                      {paymentType === "mpesa" ? "M-Pesa Channel" : paymentType === "emola" ? "e-Mola Channel" : "m-Kesh Channel"}
                    </span>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-[0.1em] font-bold text-gray-500 block mb-1">
                      Enter YOUR Phone Number (Paid From) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={buyerPaymentPhone}
                      onChange={(e) => setBuyerPaymentPhone(e.target.value)}
                      placeholder="E.g., +258 84 XXX XXXX"
                      className="w-full bg-white border border-gray-200 p-2 text-xs focus:outline-none focus:border-brand-plum rounded-lg font-mono"
                    />
                    <span className="text-[9px] text-gray-400 block mt-1 font-light">
                      The seller will use this number to confirm your transfer before handover.
                    </span>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-brand-plum block mb-1">
                  Optional Message / Note for Seller
                </label>
                <input
                  type="text"
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  placeholder="E.g., Please keep it wrapped as a surprise gift!"
                  className="w-full bg-gray-50 border border-gray-200 p-2 text-xs focus:outline-none focus:border-brand-plum rounded-lg"
                />
              </div>

              {/* TOTAL AND SUBMIT */}
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-semibold">Total to Pay</span>
                  <span className="font-serif italic text-lg text-brand-plum font-extrabold">{formatPrice(cartTotal)}</span>
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-plum text-white hover:bg-brand-plum-dark transition-all text-xs uppercase tracking-widest font-bold flex items-center gap-2 shadow-md cursor-pointer rounded-xl"
                >
                  <Check className="w-4 h-4 text-brand-gold" />
                  <span>Confirm Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAP TO PAY CONTACTLESS MODAL TERMINAL */}
      {isTapToPayOpen && (
        <TapToPay 
          totalAmount={cartTotal}
          formatPrice={formatPrice}
          onPaymentSuccess={handleNfcPaymentSuccess}
          onClose={() => setIsTapToPayOpen(false)}
        />
      )}

      {/* Prestige Student Webmail Simulator */}
      <SchoolWebmail 
        orders={placedOrders} 
        formatPrice={(amount, orderCurrency) => {
          if (orderCurrency === "MZN") {
            const mznAmount = Math.round(amount * EXCHANGE_RATE);
            return `${mznAmount.toLocaleString("pt-MZ")} MT`;
          }
          return `$${amount}`;
        }} 
      />

    </div>
  );
}
