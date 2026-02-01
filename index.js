console.log("BOT FILE IS RUNNING");
console.log("BOT STARTING...");

const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const http = require("http");

const apiId = 31581826;
const apiHash = "3e159192e5ad7e5052530bb69325994c";

// === SESSION HANDLING - DIFFERENT FOR LOCAL vs PRODUCTION ===
const isProduction = process.env.NODE_ENV === "production" || process.env.RAILWAY_ENVIRONMENT;

const sessionKey = isProduction ? "railway-forwarder-session" : "local-forwarder-session";

// Start empty by default (forces login if no saved session)
let stringSession = new StringSession("");

// In production: prefer loading from Railway environment variable
if (isProduction && process.env.SESSION_STRING) {
stringSession = new StringSession(process.env.SESSION_STRING);
console.log("Loaded production session from SESSION_STRING env var");
}

const SOURCE_CHAT = -1002201450581;
const DEST_CHAT = -1003424003343;

// Map original → copied message
const messageMap = new Map();

(async () => {
try {
const client = new TelegramClient(stringSession, apiId, apiHash, {
connectionRetries: 5,
});

console.log("🔗 Connecting to Telegram...");
await client.connect();

// If we connected successfully, log the current session string (useful for first setup)
const currentSession = stringSession.save(); // this gives the full string
if (currentSession && currentSession.length > 10) {
console.log("CURRENT SESSION STRING (copy this after first login):");
console.log(currentSession);
console.log("Paste it into Railway Variables → Key: SESSION_STRING");
}

console.log("✅ Logged in and running...");

// ================= NEW MESSAGE HANDLER =================
client.addEventHandler(
async (event) => {
if (!event.message) return;
const msg = event.message;

if (!msg.id) return;

console.log("📩 Message detected:", msg.id);

const text = (msg.text || "").toLowerCase();

// Scam filter
if (
text.includes("connect your wallet") ||
text.includes("claiming") ||
text.includes("migrating") ||
text.includes("validate") ||
text.includes("rectify") ||
text.includes("rewards") ||
(text.includes("t.me") && text.includes("bot"))
) {
console.log("🚫 Scam message blocked");
return;
}

try {
let sent;
if (msg.media) {
// Message has media (image/video/file)
sent = await client.sendFile(DEST_CHAT, {
file: msg.media,
caption: msg.text || "",
});
} else {
// Text only
sent = await client.sendMessage(DEST_CHAT, {
message: msg.text || "",
});
}

console.log("✅ Message forwarded");
messageMap.set(msg.id, sent.id);
} catch (err) {
console.log("⚠️ Could not forward message:", err.message);
}
},
new NewMessage({
chats: [SOURCE_CHAT],
incoming: true,
})
);

// ================= EDIT HANDLER =================
client.addEventHandler(
async (event) => {
const msg = event.message;
if (!msg || !msg.text) return;

console.log("✏️ Edited message detected:", msg.id);

if (messageMap.has(msg.id)) {
const copiedMsgId = messageMap.get(msg.id);
await client.editMessage(DEST_CHAT, {
message: copiedMsgId,
text: msg.text,
});
console.log("✅ Copy updated");
}
},
new NewMessage({
chats: [SOURCE_CHAT],
edited: true,
})
);

} catch (err) {
console.error("❌ BOT CRASHED:", err);
}
})();

// ================= RAILWAY KEEP-ALIVE SERVER =================
const PORT = process.env.PORT;
http
.createServer((req, res) => {
res.writeHead(200);
res.end("Bot is running");
})
.listen(PORT, () => {
console.log(`🌐 Web server running on port ${PORT} – Railway will not sleep`);
});
