console.log("BOT FILE IS RUNNING");
console.log("BOT STARTING...");

const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const http = require("http");

const apiId = 31581826;
const apiHash = "3e159192e5ad7e5052530bb69325994c";

// ✅ Your saved session (DO NOT run bot in 2 places at once)
const stringSession = new StringSession("1BAAOMTQ5LjE1NC4xNjcuOTEAUFThHWFUK4muyu1Puogz/pt986InAjK6VPCepQac2nUvM9xflqeBvlcQKjf43RpMmSQmsJ3yw7iykJ+U1y0YKwWkAmvPglPS0ZdTQEvkk+Pfd+oHnEKnuy2dLFseonRtCcTuCZ69nH7mxyLKMJzFXXkDOpeNFwpOaG1c7HDw4cyob8dOUYeRHEBgI++W4g6CLVNNlAfH67KneO3uquzofko+IJ84Cb9kZcq3ssCxEW5XlbHhRvRl/jkbXRI+hB4psM0DDYyumM6qaVhFLRLpEv4cnrTsJhVU86yPFkOsMVKjEFIOdxnEQ5uYJIjNXvwyc6+6ky+wCJ9+ZsjnPjbAiCQ=");

const SOURCE_CHAT = -1002201450581;
const DEST_CHAT = -1003424003343;

// Map original → copied message
const messageMap = new Map();

(async () => {
try {
const client = new TelegramClient(stringSession, apiId, apiHash, {
connectionRetries: 5,
});

console.log("🔌 Connecting to Telegram...");
await client.connect();
console.log("✅ Logged in and running...");

// ================= NEW MESSAGE HANDLER =================
client.addEventHandler(
async (event) => {
if (!event.message) return;
const msg = event.message;
if (!msg.id) return;

console.log("📩 Message detected:", msg.id);

const text = (msg.text || "").toLowerCase();

// 🚫 Scam filter
if (
text.includes("connect your wallet") ||
text.includes("claiming") ||
text.includes("migrating") ||
text.includes("validate") ||
text.includes("rectify") ||
text.includes("rewards") ||
(text.includes("t.me/") && text.includes("bot"))
) {
console.log("🚫 Scam message blocked");
return;
}

try {
let sent;

// 🖼 If message has media (image/video/file)
if (msg.media) {
sent = await client.sendFile(DEST_CHAT, {
file: msg.media,
caption: msg.text || "",
});
} else {
// 📝 Text only
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
const PORT = process.env.PORT; // Railway REQUIRES this

http.createServer((req, res) => {
res.writeHead(200);
res.end("Bot is running");
}).listen(PORT, () => {
console.log(`🌍 Web server running on port ${PORT} — Railway will not sleep`);
});