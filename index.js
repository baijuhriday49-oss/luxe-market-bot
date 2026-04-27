const express = require("express");
const axios = require("axios");
const admin = require("firebase-admin");

// ── Firebase (orders only, no sessions) ────────────────────
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "luxe-market-91d12",
    clientEmail: "firebase-adminsdk-fbsvc@luxe-market-91d12.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDnpIR01sZtniAX\nIpGIGebBi0VxQ4Q/8FoCG8KJNbe6Rx7e3iMlJA6lgJ9jOpj4K/uJPlaipD+hIRPj\n1irXLvKCz3zzrrkQmK4XV4j3a+z9/Q/49O9b/i7Zp00pn6i1r8scbx0F8XktwUv8\neM7fkvwDSmtTgfselSZvg8iU19Lw+u/a1jB2YgRJ1q1nyDZY0NgjFmaZcOjvqN5t\noEzAv594MH+4OnWl0vwpzRGKyJ6LRYDDAJ2hckEvjuzos4G15AWuaUFVwqHsJHex\nCkW7yIEJz/nbLoqvsEVmSkn4ZnrDg5YbtXB4c3w+t7ug07DAS1BtBHrj3JQrQs0s\nlYvNhOtVAgMBAAECggEAJCBfXA2HAt+PZ6xHgC9x8qty2BhMjuBAWWXU8CtFjTK8\nWMvSNV+rPRqTQRmJc+MAJsZnIpR1K/8JqBXltoum3MnZVfPg/vqg5BkNznCxlGcc\nT5p7niBFVEKoYR56ZGOXTMbzgtLHMGCeJjD9Kpc04JqBpJN4A6wFQ40NAlGqn1Rn\ng+F0pTdPGzEUYipwRTfVi3IZAvUwzmEcuGbw99E0n13wPV6FeDhJJqr3gC3tsweS\nyDVirCVGa8JY9eOAVtoIQ8dXzEq814a7qPS5PvN3UcWSWDBco4jVV6n+DyICn6gL\n2rI+KIT/qZ8o4mSIS2JAE2PxhjtQK4qUss3TpqzTPQKBgQD8jG7ZxRG6vNfRUNxl\nauyhBnwstPyNOkLqtyXLceNuecQk8TMhGhYpaMCeqEWsgMOy5ZFW0U8PsHkYpyQ+\nDlc/Za9v1weQaRF8wjnijLD8sT4H2qwz27UUaOemO3Leh9+k2MB0yEKdtd1CrO2U\nyWLr1lEKyxzRA30CIPduJG6aKwKBgQDqzvFhsj3R6pCD/rSnIqMADXVSPHZ30k3O\nAUaZe+OrVN6gX7fJZOWKHtg/aSAj4nNupMznP1haUkIEo9SWUvVqcYLm6z5iOu0H\ntuApYoT9A5CqP/WOqMOkMOwtPXacBBIPGS1Q+jluPFdEMObRgOAKev/BsZYzPfHr\nRULvb+tQfwKBgGf130Ph7dRzHFxb7v4Ir/PxWXiF4Fi6nQVF81b2QOsfUPDsIWIE\n/Q56wqANIPFL6ENiYRvd+a+5s3/EfhTVjnDYiQl++OwndD1pLq7lv42l4KUXDUAj\ntzz5mjJB0p1sTVHsr/zi2xlU3gouaXaQGBqBFMdeqTQZPYJ8054RfT4VAoGAD0YM\nz4UPnmL6qYtc5u5K2gsGEaZbMmoco4TTudIkOhXYMWhohRIqGDTvbhiBfbQSPCU+\nKuCk96MYJkMd5fVZf2YI1MqCkVMx7emIZUjCS876jwiACZqSt1BzXHH+ECH3psHF\nf9n2+GO2bXoc2Y3fhO8BSfEqSwUBgoNL2lVWYjMCgYEA58R2RosjHifRxHmRbYw2\nfaf7BGruB0SHZfuIDktIlGtKiTjs4iEkO8DzAiV333pmM3ygJ3lQJs+B+vIbtB8p\ndCQpK9Hskc9/LWOGu17h/VV2URlr6SIM/g7vP6fwFc/nZ8n/J63nBPTnqNsRdA68\n0kIeY4cP1Ctah5uYVxvNm3k=\n-----END PRIVATE KEY-----\n"
  })
});
const db = admin.firestore();

const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const RENDER_URL = "https://luxe-market-bot.onrender.com";

const app = express();
app.use(express.json());

// ── In-memory sessions (safe since keep-alive prevents sleeping)
const sessions = {};

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

async function sendMessage(chatId, text, extra = {}) {
  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, { chat_id: chatId, text, parse_mode: "Markdown", ...extra });
  } catch (e) { console.error("sendMessage error:", e.message); }
}

async function sendCatalog(chatId) {
  const buttons = products.map((p) => [{ text: `${p.emoji} ${p.name} — $${p.price}`, callback_data: `product_${p.id}` }]);
  await sendMessage(chatId, "🛍️ *Luxe Market — Our Collection*\n\nChoose a product to order:", { reply_markup: { inline_keyboard: buttons } });
}

async function saveOrder(data) {
  try {
    const ref = await db.collection("orders").add({
      ...data,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return ref.id;
  } catch (e) {
    console.error("Firestore error:", e.message);
    return "LOCAL-" + Date.now();
  }
}

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);
  const update = req.body;

  try {
    if (update.callback_query) {
      const query = update.callback_query;
      const chatId = query.message.chat.id;
      const data = query.data;
      await axios.post(`${TELEGRAM_API}/answerCallbackQuery`, { callback_query_id: query.id }).catch(() => {});

      if (data.startsWith("product_")) {
        const product = products.find((p) => p.id === parseInt(data.replace("product_", "")));
        if (!product) return;
        sessions[chatId] = { step: "ask_name", product };
        await sendMessage(chatId, `Great choice! ${product.emoji} *${product.name}* — $${product.price}\n\nWhat's your *full name*? (for delivery)`);

      } else if (data === "confirm_order") {
        const session = sessions[chatId];
        if (!session) {
          await sendMessage(chatId, "⚠️ Session expired. Tap *Browse Products* to order again.");
          return;
        }
        const orderId = await saveOrder({
          product: session.product.name, price: session.product.price, emoji: session.product.emoji,
          customerName: session.name, address: session.address, phone: session.phone,
          status: "pending", chatId: chatId.toString(),
        });
        delete sessions[chatId];
        await sendMessage(chatId, `✅ *Order Confirmed!*\n\nOrder ID: \`${orderId.slice(0, 8).toUpperCase()}\`\n\n${session.product.emoji} *${session.product.name}*\n👤 ${session.name}\n📍 ${session.address}\n📞 ${session.phone}\n\n💰 *Total: $${session.product.price}*\n\nWe'll contact you shortly! Thank you! 🛍️`);

      } else if (data === "cancel_order") {
        delete sessions[chatId];
        await sendMessage(chatId, "❌ Order cancelled. Type /start to begin again.");
      }
      return;
    }

    if (!update.message || !update.message.text) return;
    const msg = update.message;
    const chatId = msg.chat.id;
    const text = msg.text.trim();

    if (text === "/start") {
      delete sessions[chatId];
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
      try {
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
      } catch (e) {
        await sendMessage(chatId, "📦 Could not load orders right now. Try again shortly.");
      }
      return;
    }

    const session = sessions[chatId];
    if (!session) { await sendMessage(chatId, "Type /start to begin or tap *Browse Products* 🛍️"); return; }

    if (session.step === "ask_name") {
      sessions[chatId] = { ...session, name: text, step: "ask_phone" };
      await sendMessage(chatId, `Thanks *${text}*! 👋\n\nWhat's your *phone number*?`);
    } else if (session.step === "ask_phone") {
      sessions[chatId] = { ...session, phone: text, step: "ask_address" };
      await sendMessage(chatId, "Got it! 📞\n\nNow send your *delivery address*:");
    } else if (session.step === "ask_address") {
      sessions[chatId] = { ...session, address: text, step: "confirm" };
      await sendMessage(chatId,
        `📋 *Order Summary*\n\n${session.product.emoji} *${session.product.name}*\n💰 Price: $${session.product.price}\n👤 Name: ${session.name}\n📞 Phone: ${session.phone}\n📍 Address: ${text}\n\nConfirm your order?`,
        { reply_markup: { inline_keyboard: [[{ text: "✅ Confirm Order", callback_data: "confirm_order" }, { text: "❌ Cancel", callback_data: "cancel_order" }]] } }
      );
    }
  } catch (e) {
    console.error("Webhook error:", e.message);
  }
});

app.get("/", (req, res) => res.send("Luxe Market Bot is running! 🛍️"));
setInterval(() => { axios.get(RENDER_URL).catch(() => {}); console.log("Keep-alive ping ✅"); }, 10 * 60 * 1000);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
