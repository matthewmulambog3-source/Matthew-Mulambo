import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mail, 
  Inbox, 
  X, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft, 
  Check, 
  Clock, 
  MapPin, 
  Sparkles, 
  Award,
  BookOpen,
  Info
} from "lucide-react";
import { StudentOrder, CartItem } from "../types";

export interface MockEmail {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  date: string;
  time: string;
  bodyHtml: string;
  isUnread: boolean;
  avatarInitials: string;
  avatarBg: string;
}

interface SchoolWebmailProps {
  orders: StudentOrder[];
  formatPrice: (amount: number, currency: "MZN" | "USD") => string;
}

export const SchoolWebmail: React.FC<SchoolWebmailProps> = ({ orders, formatPrice }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [emails, setEmails] = useState<MockEmail[]>([]);
  const [activeEmailId, setActiveEmailId] = useState<string | null>(null);
  const [hasNewPulse, setHasNewPulse] = useState(false);
  const processedOrderIds = useRef<Set<string>>(new Set());

  // 1. Play synthesized Webmail "Ding!"
  const playEmailDing = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // First high chime
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain1.gain.setValueAtTime(0, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      
      // Second harmony chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1109.73, ctx.currentTime + 0.08); // C#6
      gain2.gain.setValueAtTime(0, ctx.currentTime + 0.08);
      gain2.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.5);
      osc2.stop(ctx.currentTime + 0.6);
    } catch (e) {
      // Audio context block by browser security is safe to ignore
    }
  };

  // 2. Initialize default school advisory emails on mount
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    
    const welcomeEmail: MockEmail = {
      id: "welcome-system",
      sender: "Prestige YEI Committee",
      senderEmail: "yei@prestigeacademy.edu",
      subject: "Welcome to the Stage 9 Scent Studio!",
      date: formattedDate,
      time: "08:15 AM",
      isUnread: true,
      avatarInitials: "PY",
      avatarBg: "bg-brand-plum text-brand-gold",
      bodyHtml: `
        <div style="font-family: system-ui, sans-serif; color: #2D3748; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; background: #FFF;">
          <div style="background: #8A1540; padding: 24px; text-align: center; border-bottom: 2px solid #D4AF37;">
            <h1 style="color: #FFF; font-family: Georgia, serif; font-size: 20px; font-weight: 800; letter-spacing: 2px; margin: 0; text-transform: uppercase;">PRESTIGE ACADEMY</h1>
            <p style="color: #D4AF37; font-size: 10px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 3px; font-weight: bold;">Young Entrepreneurs Initiative</p>
          </div>
          <div style="padding: 24px; background: #FFF;">
            <h2 style="font-family: Georgia, serif; font-size: 18px; color: #8A1540; margin-top: 0;">Immersive Commerce & Perfumery</h2>
            <p>Dear Student,</p>
            <p>We are delighted to welcome you to the launch of <strong>Stage 9 Scent Studio</strong>, our signature student-led commercial laboratory. Combining organic chemistry with luxury branding, this initiative empowers student makers to handcraft, market, and distribute premium candles.</p>
            <p>All proceeds from this venture directly fund local educational supplies and clean chemistry lab setups in Maputo under our youth empowerment outreach program.</p>
            <div style="background: #FDFCFB; border-left: 3px solid #D4AF37; padding: 16px; margin: 20px 0; border-radius: 0 4px 4px 0;">
              <h4 style="margin: 0 0 8px 0; color: #8A1540; font-size: 13px;">🔑 Essential Features in Your Studio Dashboard:</h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 12px; space-y: 6px;">
                <li><strong>Interactive Lab Builder:</strong> Construct bespoke combinations of base, heart, and top notes using organic soy wax.</li>
                <li><strong>AI Scent Sommelier:</strong> Tell our specialized LLM Advisor your mood or memories, and receive customized blend formulas.</li>
                <li><strong>Scent Finder Quiz:</strong> Take our 3-question scholastic diagnostic to discover curated pre-blended recommendations.</li>
              </ul>
            </div>
            <p>Once you place an order, our production committee will receive the formula sheets, trigger a localized email notification here, and commence safe hand-pouring.</p>
            <p>Best Regards,</p>
            <p style="margin-bottom: 0;"><strong>The YEI Executive Board</strong><br><span style="font-size: 12px; color: #718096;">Prestige Academy, Mozambique</span></p>
          </div>
          <div style="background: #F7FAFC; padding: 16px; text-align: center; font-size: 11px; color: #A0AEC0; border-top: 1px solid #E2E8F0;">
            This is an automated educational transmission. &bull; Outlook Webmail Simulator
          </div>
        </div>
      `
    };

    const safetyEmail: MockEmail = {
      id: "safety-chemistry",
      sender: "Ms. Emily Carter (Advisory)",
      senderEmail: "e.carter@prestigeacademy.edu",
      subject: "Stage 9 Lab Safety & Candle Care Guide",
      date: formattedDate,
      time: "09:00 AM",
      isUnread: true,
      avatarInitials: "EC",
      avatarBg: "bg-blue-800 text-blue-100",
      bodyHtml: `
        <div style="font-family: system-ui, sans-serif; color: #2D3748; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; background: #FFF;">
          <div style="background: #2D3748; padding: 20px; text-align: center; border-bottom: 2px solid #3182CE;">
            <h1 style="color: #FFF; font-family: Georgia, serif; font-size: 18px; margin: 0; text-transform: uppercase; tracking-spacing: 1.5px;">SCIENCE DEPT. LABORATORY</h1>
            <p style="color: #63B3ED; font-size: 10px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">Prestige Chemistry & Safety Standards</p>
          </div>
          <div style="padding: 24px; background: #FFF;">
            <p>Dear Aspiring Chemists,</p>
            <p>As we begin hand-pouring the Stage 9 custom candle collections, it is critical that we align our commercial processes with strict laboratory safety guidelines.</p>
            <p>To ensure maximum olfactory throw and product safety, our design team has formulated these standard operating requirements:</p>
            <h3 style="color: #2B6CB0; font-size: 14px; margin-top: 20px; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px;">🔬 Chemistry Behind the Pour</h3>
            <ul style="font-size: 12.5px; padding-left: 20px;">
              <li><strong>Eco-Soy Wax:</strong> Clean-burning, biodegradable, non-toxic, and holds scent oils perfectly without carcinogenic paraffin.</li>
              <li><strong>Wooden Wicks:</strong> Made of natural cherrywood. They produce a calming fireplace crackle because of tiny steam pockets escaping the wood fibers.</li>
              <li><strong>Scent Ratios:</strong> Standard concentration of 9% oil mass prevents soot and ensures an even clean throw.</li>
            </ul>
            <h3 style="color: #2B6CB0; font-size: 14px; margin-top: 20px; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px;">🕯️ Candle Care for End-Users</h3>
            <ul style="font-size: 12.5px; padding-left: 20px;">
              <li><strong>The Crucial First Burn:</strong> Always let your candle burn until the melted wax pool entirely reaches the edge of the glass container. This takes 2 to 3 hours, preventing permanent "tunneling".</li>
              <li><strong>Wick Grooming:</strong> Keep the wick trimmed to exactly 1/4 inch (6mm). Too long leads to soot, too short limits heat.</li>
              <li><strong>Exhaustion:</strong> Extinguish your candle safely with a lid or snuffer to avoid soot, or let the smoke clear using a wick-dipper.</li>
            </ul>
            <p>Please share this wisdom with our student body and patrons!</p>
            <p style="margin-bottom: 0;">Sincerely,</p>
            <p><strong>Ms. Emily Carter</strong><br><span style="font-size: 12px; color: #718096;">Head of Science Advisory, Prestige Academy</span></p>
          </div>
        </div>
      `
    };

    setEmails([welcomeEmail, safetyEmail]);
  }, []);

  // 3. Process new incoming orders dynamically to generate confirmation emails
  useEffect(() => {
    if (orders.length === 0) return;

    let updated = false;
    const newMockEmails: MockEmail[] = [];

    // Loop through orders and find any that have not been compiled into emails yet
    orders.forEach((order) => {
      if (processedOrderIds.current.has(order.orderId)) return;

      processedOrderIds.current.add(order.orderId);
      updated = true;

      // Extract details for collection instructions
      const isNfc = !!order.transactionId;
      const paymentBadge = isNfc 
        ? `<span style="background: #E6FFFA; color: #047481; border: 1px solid #B2F5EA; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; text-transform: uppercase;">Paid Contactless (Tx: ${order.transactionId.substring(0, 12)})</span>`
        : `<span style="background: #FFFBEB; color: #975A16; border: 1px solid #FEEBC8; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; text-transform: uppercase;">Cash on Homeroom Delivery</span>`;

      // Build collection text based on delivery node choice
      let collectionHeader = "Package Delivery Notice";
      let collectionIcon = "🚚";
      let collectionBody = "";

      if (order.deliveryMethod === "Homeroom Delivery") {
        collectionHeader = "Scheduled Homeroom Delivery";
        collectionIcon = "🏫";
        collectionBody = `
          Our student logistics officers will pack your handcrafted candle in protective wrapping and deliver it directly to your homeroom, <strong>${order.gradeClass}</strong>, during Wednesday's business chemistry period. 
          No physical pickup is required on your part. Please ensure you are in class or inform your homeroom teacher.
        `;
      } else if (order.deliveryMethod.includes("Library")) {
        collectionHeader = "Library Desk Self-Collection";
        collectionIcon = "📚";
        collectionBody = `
          Your order will be available for pick-up at the <strong>Prestige Library Collection Desk</strong>. 
          Please present your Student ID (<strong>${order.studentId}</strong>) to the student librarian on duty. 
          <br/><span style="font-size: 11px; color: #718096;">Pickup Hours: Monday to Friday, 12:30 - 13:30 and 15:30 - 16:30.</span>
        `;
      } else {
        collectionHeader = "Main Office Collection";
        collectionIcon = "🏛️";
        collectionBody = `
          Your finished candle will be deposited at the <strong>Main Administrative Office Collection counter</strong>. 
          Please pick it up from Mrs. Alima. You will need to sign our Student Registrar book and verify your Student ID: <strong>${order.studentId}</strong>.
          <br/><span style="font-size: 11px; color: #718096;">Pickup Hours: School hours only (08:00 - 16:00).</span>
        `;
      }

      // Format individual cart items
      const itemsListHtml = order.items.map((item) => {
        const c = item.candle;
        const totalLinePrice = formatPrice(c.price * item.quantity, order.currency);
        const singlePrice = formatPrice(c.price, order.currency);
        return `
          <tr style="border-bottom: 1px solid #EDF2F7;">
            <td style="padding: 12px 8px; font-size: 13px;">
              <div style="font-weight: bold; color: #1A202C;">${c.name}</div>
              <div style="font-size: 11px; color: #718096; margin-top: 2px;">
                Vessel: <em>${c.vessel}</em> &bull; Wick: <em>${c.wick}</em> &bull; Weight: <em>${c.weight}</em>
              </div>
              ${order.notes ? `<div style="font-size: 11px; color: #B7791F; background: #FEFCBF; padding: 4px; border-radius: 4px; margin-top: 6px; display: inline-block;">Note: ${order.notes}</div>` : ""}
            </td>
            <td style="padding: 12px 8px; font-size: 13px; text-align: center; color: #4A5568;">
              ${item.quantity}
            </td>
            <td style="padding: 12px 8px; font-size: 13px; text-align: right; font-weight: bold; color: #1A202C;">
              ${totalLinePrice}
            </td>
          </tr>
        `;
      }).join("");

      // Build simulated school email address
      const studentSlug = order.studentName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const simulatedEmailAddress = `${studentSlug}@prestigeacademy.edu`;

      const orderEmail: MockEmail = {
        id: `order-email-${order.orderId}`,
        sender: "Stage 9 Scent Studio",
        senderEmail: "scentstudio@prestigeacademy.edu",
        subject: `Order Confirmed: ${order.orderId} — Handcrafting Commenced`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        isUnread: true,
        avatarInitials: "SS",
        avatarBg: "bg-brand-plum text-brand-gold font-bold",
        bodyHtml: `
          <div style="font-family: system-ui, sans-serif; color: #2D3748; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; background: #FFF; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <!-- YEI Official Header -->
            <div style="background: #8A1540; padding: 24px; text-align: center; border-bottom: 2px solid #D4AF37;">
              <h1 style="color: #FFF; font-family: Georgia, serif; font-size: 21px; font-weight: 800; letter-spacing: 2px; margin: 0; text-transform: uppercase;">STAGE 9 SCENT STUDIO</h1>
              <p style="color: #D4AF37; font-size: 10px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 3px; font-weight: bold;">Official Order Confirmation & Receipt</p>
            </div>

            <!-- Email Body Content -->
            <div style="padding: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #EDF2F7; padding-bottom: 16px; margin-bottom: 20px;">
                <div>
                  <div style="font-size: 11px; text-transform: uppercase; color: #718096; tracking-spacing: 1px;">Registered Student</div>
                  <div style="font-size: 14px; font-weight: bold; color: #1A202C;">${order.studentName}</div>
                  <div style="font-size: 12px; color: #4A5568;">ID: ${order.studentId} &bull; ${order.gradeClass}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 11px; text-transform: uppercase; color: #718096; tracking-spacing: 1px;">Order Reference</div>
                  <div style="font-size: 14px; font-weight: bold; color: #8A1540;">${order.orderId}</div>
                  <div style="font-size: 12px; color: #4A5568;">${order.timestamp}</div>
                </div>
              </div>

              <p>Hello <strong>${order.studentName}</strong>,</p>
              <p>Thank you for supporting the Stage 9 Scent Studio, a student-led entrepreneurial chemistry project. Your order has been submitted successfully and entered into our live production queue.</p>
              
              <div style="margin: 20px 0; padding: 4px 0;">
                <span style="font-size: 12px; color: #4A5568; display: block; margin-bottom: 6px; font-weight: 600;">Payment Status:</span>
                ${paymentBadge}
              </div>

              <!-- Itemized Receipt -->
              <h4 style="margin: 24px 0 8px 0; color: #8A1540; font-family: Georgia, serif; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;">Your Handcrafted Items</h4>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <thead>
                  <tr style="background: #F7FAFC; border-bottom: 2px solid #E2E8F0;">
                    <th style="padding: 10px 8px; text-align: left; font-size: 11px; text-transform: uppercase; color: #4A5568; width: 60%;">Description</th>
                    <th style="padding: 10px 8px; text-align: center; font-size: 11px; text-transform: uppercase; color: #4A5568; width: 15%;">Qty</th>
                    <th style="padding: 10px 8px; text-align: right; font-size: 11px; text-transform: uppercase; color: #4A5568; width: 25%;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsListHtml}
                  <tr>
                    <td colspan="2" style="padding: 16px 8px 8px 8px; text-align: right; font-size: 13px; color: #4A5568; font-weight: bold;">Grand Total:</td>
                    <td style="padding: 16px 8px 8px 8px; text-align: right; font-size: 15px; color: #8A1540; font-weight: 800;">${formatPrice(order.total, order.currency)}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Collection Instructions -->
              <div style="background: #FFFDF9; border: 1px dashed #D4AF37; border-left: 4px solid #8A1540; padding: 20px; border-radius: 6px; margin: 24px 0;">
                <h4 style="margin: 0 0 10px 0; color: #8A1540; font-family: Georgia, serif; display: flex; align-items: center; font-size: 14px; text-transform: uppercase;">
                  <span style="font-size: 18px; margin-right: 8px;">${collectionIcon}</span> ${collectionHeader}
                </h4>
                <p style="margin: 0; font-size: 12.5px; color: #4A5568; line-height: 1.6;">
                  ${collectionBody}
                </p>
              </div>

              <!-- Candle Chemistry Guide Section -->
              <div style="background: #F7FAFC; border-radius: 6px; padding: 16px; font-size: 11.5px; color: #4A5568; margin-bottom: 20px;">
                <h5 style="margin: 0 0 8px 0; color: #2D3748; font-weight: bold; text-transform: uppercase; font-size: 11px;">🌱 Young Chemist's Burning Protocol:</h5>
                <ol style="margin: 0; padding-left: 16px; line-height: 1.5;">
                  <li style="margin-bottom: 4px;"><strong>No Paraffin:</strong> Our 100% soy base emits zero chemical toxins.</li>
                  <li style="margin-bottom: 4px;"><strong>Trim the wick:</strong> Always trim the organic cherrywood or Egyptian cotton wick to 1/4" before lighting to guarantee an even, soot-free burn.</li>
                  <li style="margin-bottom: 0;"><strong>Edge-to-Edge:</strong> On your first burn, let the candle burn for 3 hours until the melted pool touches all glass boundaries. This prevents wax memory tunnel defects.</li>
                </ol>
              </div>

              <p style="font-size: 12px; color: #718096;">
                Every candle supports secondary science lab provisions. By funding local school commerce networks, you play a critical role in Mozambican student excellence. Thank you.
              </p>

              <div style="border-top: 1px solid #EDF2F7; padding-top: 16px; margin-top: 24px;">
                <p style="margin: 0; font-weight: bold; color: #1A202C;">Scent Studio Committee Team</p>
                <p style="margin: 2px 0 0 0; font-size: 11px; color: #718096;">Stage 9 YEI Enterprise | Chemistry Division</p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #F7FAFC; padding: 16px; text-align: center; font-size: 11px; color: #A0AEC0; border-top: 1px solid #E2E8F0;">
              This mail was sent to <a href="mailto:${simulatedEmailAddress}" style="color: #8A1540; text-decoration: none;">${simulatedEmailAddress}</a>.<br/>
              Prestige Academy YEI Student Webmail Service &bull; Maputo, MZ
            </div>
          </div>
        `
      };

      newMockEmails.push(orderEmail);
    });

    if (updated) {
      setEmails((prev) => [...newMockEmails, ...prev]);
      playEmailDing();
      setHasNewPulse(true);
      // Automatically open the first unread email when the webmail client is opened
      if (newMockEmails.length > 0) {
        setActiveEmailId(newMockEmails[0].id);
      }
    }
  }, [orders, formatPrice]);

  const activeEmail = emails.find((e) => e.id === activeEmailId);
  const unreadCount = emails.filter((e) => e.isUnread).length;

  const handleOpenEmail = (emailId: string) => {
    setActiveEmailId(emailId);
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, isUnread: false } : e))
    );
  };

  const handleMarkAllRead = () => {
    setEmails((prev) => prev.map((e) => ({ ...e, isUnread: false })));
  };

  return (
    <>
      {/* FLOATING ACTION MAIL CLIENT TRIGGERS */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 10 }}
              className="mb-2 bg-brand-plum text-brand-gold px-3 py-1.5 rounded-full border border-brand-gold/20 shadow-xl flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider cursor-pointer"
              onClick={() => {
                setIsOpen(true);
                setHasNewPulse(false);
              }}
            >
              <Sparkles className="w-3 h-3 text-brand-gold animate-pulse" />
              <span>{unreadCount} Unread Prestige Mail</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={hasNewPulse ? {
            scale: [1, 1.15, 1, 1.15, 1],
            rotate: [0, -5, 5, -5, 0],
          } : {}}
          transition={{ duration: 0.6 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setHasNewPulse(false);
          }}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer border-2 transition-all duration-300 relative ${
            unreadCount > 0 
              ? "bg-brand-plum border-brand-gold text-brand-gold shadow-brand-gold/15" 
              : "bg-[#1E1B18] border-white/10 text-gray-300 hover:text-white"
          }`}
          title="Prestige Student Webmail"
        >
          <Mail className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white font-mono text-[9px] font-bold w-5.5 h-5.5 rounded-full flex items-center justify-center animate-bounce shadow-md border-2 border-white">
              {unreadCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* WEBMAIL INTERFACE DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="fixed bottom-24 right-6 w-[92vw] sm:w-[440px] h-[550px] bg-white border-2 border-brand-plum rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-40 overflow-hidden flex flex-col"
          >
            {/* Header / School Mail Branding */}
            <div className="bg-brand-plum text-white p-4 flex items-center justify-between border-b-2 border-brand-gold/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                  <Mail className="w-4.5 h-4.5 text-brand-gold" />
                </div>
                <div>
                  <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-white">Prestige Academy Mail</h4>
                  <p className="text-[8px] font-mono text-brand-gold uppercase tracking-widest">student.outlook.prestige.edu</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[8px] uppercase tracking-wider text-brand-gold font-mono hover:underline cursor-pointer bg-white/5 py-1 px-2 rounded"
                  >
                    Mark All Read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-brand-gold p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Simulated Webmail Content Area */}
            <div className="flex-1 overflow-hidden bg-gray-50 flex flex-col relative">
              <AnimatePresence mode="wait">
                {!activeEmailId ? (
                  // INBOX LIST VIEW
                  <motion.div
                    key="inbox"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    {/* Secondary Status Filter Bar */}
                    <div className="bg-white border-b border-gray-100 py-2.5 px-4 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Inbox className="w-3.5 h-3.5 text-brand-plum" />
                        <span>Inbox &bull; <strong>{emails.length}</strong> items</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        <span>Connected</span>
                      </div>
                    </div>

                    {/* Mail Items Scroll Box */}
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                      {emails.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 space-y-2">
                          <Inbox className="w-8 h-8 mx-auto stroke-1" />
                          <p className="text-xs font-light">Your student mailbox is empty.</p>
                        </div>
                      ) : (
                        emails.map((email) => (
                          <div
                            key={email.id}
                            onClick={() => handleOpenEmail(email.id)}
                            className={`p-4 transition-all cursor-pointer flex gap-3 text-left relative ${
                              email.isUnread 
                                ? "bg-amber-50/15 hover:bg-amber-50/25 border-l-4 border-brand-plum font-semibold" 
                                : "bg-white hover:bg-gray-50 border-l-4 border-transparent"
                            }`}
                          >
                            {/* Avatar */}
                            <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-mono font-bold ${email.avatarBg}`}>
                              {email.avatarInitials}
                            </div>

                            {/* Text Columns */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex justify-between items-baseline">
                                <span className="text-xs text-brand-plum font-bold truncate pr-2">{email.sender}</span>
                                <span className="text-[8px] text-gray-400 font-mono shrink-0">{email.time}</span>
                              </div>
                              <div className={`text-[11px] truncate ${email.isUnread ? "text-gray-950" : "text-gray-700"}`}>
                                {email.subject}
                              </div>
                              <p className="text-[10px] text-gray-400 font-light truncate">
                                {email.senderEmail} &bull; {email.date}
                              </p>
                            </div>

                            {/* Unread marker dot */}
                            {email.isUnread && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-500 shadow-md animate-pulse" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                ) : (
                  // EMAIL FULL DETAIL VIEW
                  <motion.div
                    key="detail"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex-1 flex flex-col overflow-hidden bg-white"
                  >
                    {/* Detail Header / Nav Bar */}
                    <div className="border-b border-gray-100 py-2.5 px-4 bg-gray-50 flex justify-between items-center shrink-0">
                      <button
                        onClick={() => setActiveEmailId(null)}
                        className="flex items-center gap-1.5 text-xs text-brand-plum hover:text-brand-plum-dark font-bold cursor-pointer font-serif"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Inbox</span>
                      </button>

                      <div className="text-[9px] font-mono text-gray-400">
                        Outlook Server &bull; {activeEmail?.time}
                      </div>
                    </div>

                    {/* Email Meta Data Panel */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3 shrink-0 text-left">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-mono font-bold ${activeEmail?.avatarBg}`}>
                        {activeEmail?.avatarInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-serif font-extrabold text-brand-plum">{activeEmail?.subject}</h4>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5 truncate">
                          From: <strong className="text-gray-700">{activeEmail?.sender}</strong> &lt;{activeEmail?.senderEmail}&gt;
                        </div>
                      </div>
                    </div>

                    {/* Scrollable Email Rich HTML Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-100/50">
                      <div 
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: activeEmail?.bodyHtml || "" }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
