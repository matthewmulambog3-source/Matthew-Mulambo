import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client safely
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API Client initialized successfully.");
  } else {
    console.warn("GEMINI_API_KEY is missing. Scent Sommelier will run in fallback/demo mode.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini API Client:", error);
}

// 1. AI Scent Sommelier API Route
app.post("/api/sommelier", async (req, res) => {
  const { mood, setting, customPreferences } = req.body;

  if (!mood && !setting && !customPreferences) {
    return res.status(400).json({ error: "Please provide some preferences, mood, or setting description." });
  }

  // Fallback data in case Gemini key is missing or api fails
  const getFallbackCandle = () => {
    const fallbacks = [
      {
        name: "Rain-Slicked Library",
        description: "An evocative fragrance evoking rain-slicked slate, vintage leather-bound classics, and a warm crackling hearth.",
        topNotes: ["Rainwater Accord", "Bergamot"],
        heartNotes: ["Teakwood", "Damask Rose"],
        baseNotes: ["Warm Leather", "Amber Crystals"],
        color: "#bfb19c",
        vessel: "Matte Ceramic Slate",
        wick: "Wooden Wick (Crackling)"
      },
      {
        name: "Fireside Meditation",
        description: "A soothing blend of smoking embers, toasted vanilla, and soothing cedar branches, perfect for calming a busy mind.",
        topNotes: ["Clove Bud", "Smoked Eucalyptus"],
        heartNotes: ["Sandalwood", "Spiced Pumpkin"],
        baseNotes: ["Rich Vanilla Suede", "Fireside Oak"],
        color: "#dfaa77",
        vessel: "Amber Glass",
        wick: "Wooden Wick (Crackling)"
      },
      {
        name: "Morning Dew & Peppermint",
        description: "A bright, invigorating crisp breath of fresh air, mountain streams, and cold peppermint leaves to focus the senses.",
        topNotes: ["Peppermint Leaf", "Wild Spearmint"],
        heartNotes: ["Crushed Pine Needles", "White Thyme"],
        baseNotes: ["Eucalyptus Bark", "Sheer Musk"],
        color: "#a4cbb4",
        vessel: "Frosted Quartz",
        wick: "Organic Cotton (Even Glow)"
      }
    ];
    // Return one based on length
    const idx = Math.abs((mood || "").length + (setting || "").length) % fallbacks.length;
    return fallbacks[idx];
  };

  if (!ai) {
    console.warn("No Gemini Client. Returning premium fallback candle.");
    return res.json(getFallbackCandle());
  }

  try {
    const prompt = `You are the Prestige School's Scent Sommelier, an expert perfumer creating custom candles for students, study spaces, exam concentration, and school memory lanes. 
Analyze the student or teacher's input and craft a completely bespoke, high-quality candle scent blend that matches their desired scholastic atmosphere perfectly.

User Preferences:
- Current Mood/Vibe/Study State: "${mood || 'Ambient'}"
- Desired Setting/Class/Subject/Activity: "${setting || 'Cozy Library'}"
- Special requests/ingredients: "${customPreferences || 'None'}"

Design a scholastic-inspired candle with an elegant, school-themed name (e.g., incorporating Prestige, Crown, Laurel, Stars, Beira Macuti, or subjects/study spaces) and immersive sensory description. Ensure the notes (Top, Heart, Base) are elegant and realistic. Provide a color, vessel and wick recommendations that match the blend's aesthetic.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert luxury fragrance sommelier. Create poetic, extremely descriptive scent names and luxury profiles. Always output strictly valid JSON conforming to the schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "A poetic, premium name for this custom luxury candle" },
            description: { type: Type.STRING, description: "A rich, evocative sensory paragraph describing the mood and fragrance journey" },
            topNotes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "1-2 delicate, immediate fragrance notes" },
            heartNotes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "1-2 core, full-bodied aromatic notes" },
            baseNotes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "1-2 lingering, deep foundation notes" },
            color: { type: Type.STRING, description: "A muted, luxurious candle wax hex code (e.g. #dfbda0 or #8fa996)" },
            vessel: { type: Type.STRING, description: "The recommended vessel: 'Amber Glass', 'Matte Ceramic Slate', or 'Frosted Quartz'" },
            wick: { type: Type.STRING, description: "The recommended wick: 'Wooden Wick (Crackling)' or 'Organic Cotton (Even Glow)'" }
          },
          required: ["name", "description", "topNotes", "heartNotes", "baseNotes", "color", "vessel", "wick"]
        }
      }
    });

    if (response.text) {
      try {
        const candleData = JSON.parse(response.text.trim());
        return res.json(candleData);
      } catch (parseError) {
        console.error("Failed to parse Gemini JSON output. Returning fallback. Text was:", response.text);
        return res.json(getFallbackCandle());
      }
    } else {
      console.warn("Empty response from Gemini API. Returning fallback.");
      return res.json(getFallbackCandle());
    }
  } catch (error) {
    console.error("Gemini API call failed:", error);
    return res.json(getFallbackCandle());
  }
});

// 2. Vite integration as middleware or static files
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(__dirname, "dist");
  app.use(express.static(distPath));
  app.get("*all", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Lumina Candle Market server running at http://0.0.0.0:${PORT}`);
});
