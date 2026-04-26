const express = require("express");
const axios = require("axios");
const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const RENDER_URL = "https://luxe-market-bot.onrender.com";

const app = express();
app.use(express.json());

const products = [
  { id: 1,  name: "Amber Glass Diffuser",     price: 68,  emoji: "🕯️" },
  { id: 2,  name: "Woven Linen Throw",         price: 124, emoji: "🧶" },
  { id: 3,  name: "Cold Brew Pour Set",        price: 89,  emoji: "☕" },
  { id: 4,  name: "Leather Card Sleeve",       price: 45,  emoji: "👜" },
  { id: 5,  name: "Hammam Cotton Towel",       price: 55,  emoji: "🛁" },
  { id: 6,  name: "Beeswax Taper Candles ×6", price: 32,  emoji: "🕍" },
  { id: 7,  name: "Marble Tray — Onyx",        price: 98,  emoji: "🖤" },
  { id: 8,  name: "Raw Honey — Wildflower",    price: 22,  emoji: "🍯" },
];

async function getSession(chatId) {
  try {
    const doc = await db.collection("sessions").doc(String(chatId)).get();
    return doc.exists ? doc.data() : null;
  } catch { return null; }
}
async function setSession(chatId, data) {
  await db.collection("sessions").doc(String(chatId)).set(data);
}
async function deleteSession(chatId) {
  await db.collection("sessions").doc(String(chatId)).delete();
}

async function sendMessage(chatId, text, extra = {}) {
  await axios.post(`${TELEGRAM_API}/sendMessage`, { chat_id: chatId, text, parse_mode: "Markdown", ...extra });
}

async function sendCatalog(chatId) {
  const buttons = products.map((p) => [{ text: `${p.emoji} ${p.name} — $${p.price}`, callback_data: `product_${p.id}` }]);
  await sendMessage(chatId, "🛍️ *Luxe Market — Our Collection*\n\nChoose a product to order:", { reply_markup: { inline_keyboard: buttons } });
}

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);
  const update = req.body;

  if (update.callback_query) {
    const query = update.callback_query;
    const chatId = query.message.chat.id;
    const data = query.data;
    await axios.post(`${TELEGRAM_API}/answerCallbackQuery`, { callback_query_id: query.id });

    if (data.startsWith("product_")) {
      const product = products.find((p) => p.id === parseInt(data.replace("product_", "")));
      if (!product) return;
      await setSession(chatId, { step: "ask_name", product });
      await sendMessage(chatId, `Great choice! ${product.emoji} *${product.name}* — $${product.price}\n\nWhat's your *full name*? (for delivery)`);

    } else if (data === "confirm_order") {
      const session = await getSession(chatId);
      if (!session) {
        await sendMessage(chatId, "⚠️ Session expired. Tap *Browse Products* to order again.");
        return;
      }
      const orderRef = await db.collection("orders").add({
        product: session.product.name, price: session.product.price, emoji: session.product.emoji,
        customerName: session.name, address: session.address, phone: session.phone,
        status: "pending", chatId: chatId.toString(),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      await deleteSession(chatId);
      await sendMessage(chatId, `✅ *Order Confirmed!*\n\nOrder ID: \`${orderRef.id.slice(0, 8).toUpperCase()}\`\n\n${session.product.emoji} *${session.product.name}*\n👤 ${session.name}\n📍 ${session.address}\n📞 ${session.phone}\n\n💰 *Total: $${session.product.price}*\n\nWe'll contact you shortly to arrange delivery. Thank you! 🛍️`);

    } else if (data === "cancel_order") {
      await deleteSession(chatId);
      await sendMessage(chatId, "❌ Order cancelled. Type /start to begin again.");
    }
    return;
  }

  if (!update.message || !update.message.text) return;
  const msg = update.message;
  const chatId = msg.chat.id;
  const text = msg.text.trim();

  if (text === "/start") {
    await deleteSession(chatId);
    await sendMessage(chatId, `👋 Welcome to *Luxe Market*!\n\nHandpicked objects of everyday luxury, delivered with a personal touch.\n\nUse the menu below:`, {
      reply_markup: { keyboard: [[{ text: "🛍️ Browse Products" }], [{ text: "📦 My Orders" }, { text: "📞 Contact Us" }]], resize_keyboard: true }
    });
    return;
  }

  if (text === "🛍️ Browse Products") { await sendCatalog(chatId); return; }

  if (text === "📞 Contact Us") {
    await sendMessage(chatId, "📞 *Contact Us*\n\nTelegram: @hriday\nPhone: +91 8077200345\n\nAvailable 9am–9pm IST 🇮🇳");
    return;
  }

  if (text === "📦 My Orders") {
    const snapshot = await db.collection("orders").where("chatId", "==", chatId.toString()).orderBy("timestamp", "desc").limit(5).get();
    if (snapshot.empty) {
      await sendMessage(chatId, "📦 No orders yet. Tap *Browse Products* to start! 🛍️");
    } else {
      let replyMsg = "📦 *Your Recent Orders:*\n\n";
      snapshot.forEach((doc) => {
        const o = doc.data();
        const status = o.status === "pending" ? "⏳ Pending" : o.status === "confirmed" ? "✅ Confirmed" : "🚚 Shipped";
        replyMsg += `${o.emoji} *${o.product}* — $${o.price}\nStatus: ${status}\nID: \`${doc.id.slice(0, 8).toUpperCase()}\`\n\n`;
      });
      await sendMessage(chatId, replyMsg);
    }
    return;
  }

  const session = await getSession(chatId);
  if (!session) { await sendMessage(chatId, "Type /start to begin or tap *Browse Products* 🛍️"); return; }

  if (session.step === "ask_name") {
    await setSession(chatId, { ...session, name: text, step: "ask_phone" });
    await sendMessage(chatId, `Thanks *${text}*! 👋\n\nWhat's your *phone number*?`);
  } else if (session.step === "ask_phone") {
    await setSession(chatId, { ...session, phone: text, step: "ask_address" });
    await sendMessage(chatId, "Got it! 📞\n\nNow send your *delivery address*:");
  } else if (session.step === "ask_address") {
    await setSession(chatId, { ...session, address: text, step: "confirm" });
    await sendMessage(chatId,
      `📋 *Order Summary*\n\n${session.product.emoji} *${session.product.name}*\n💰 Price: $${session.product.price}\n👤 Name: ${session.name}\n📞 Phone: ${session.phone}\n📍 Address: ${text}\n\nConfirm your order?`,
      { reply_markup: { inline_keyboard: [[{ text: "✅ Confirm Order", callback_data: "confirm_order" }, { text: "❌ Cancel", callback_data: "cancel_order" }]] } }
    );
  }
});

app.get("/", (req, res) => res.send("Luxe Market Bot is running! 🛍️"));

setInterval(() => { axios.get(RENDER_URL).catch(() => {}); console.log("Keep-alive ping ✅"); }, 10 * 60 * 1000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
