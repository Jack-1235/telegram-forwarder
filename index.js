console.log("BOT FILE IS RUNNING");
console.log("BOT STARTING...");

const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const http = require("http"); // Railway keep-alive server

const apiId = 31581826;
const apiHash = "3e159192e5ad7e5052530bb69325994c";
const stringSession = new StringSession("1BAAOMTQ5LjE1NC4xNjcuOTEAUIH2vLewdbRoDQ734df/DiWSe2CVlbcFF15YpJx2ttrwHVsL8ORHZONo1RlGv6R0reeX2tdvpNuLwKWdjiWWapd9DjNYDgGOQnNlkfd7iUAeAcaG64SgBvZZ+ta56VxDxOKZbABhKa+zhUUskNiaMIuARNXaYDA0Cm4gpBNVASA+Y7OW4g8FnkA2p2xUVvCzWiF720LUQvZtzsvSRNO2B8WaOIibDnVjSSRBNEPZtyHs1AxbqQ/+gxVIbqI61b2Qu2yMati2SE6+Q3PIAAIEPKw/uZiZ92Y8xyHYhNdhBQJje4mlK+dPWXZfkwm+Of8/RoFcwufP0BRrrCmG2dx/18k=");

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
const sent = await client.sendMessage(DEST_CHAT, {
message: msg.text || "",
});

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
http.createServer((req, res) => {
res.writeHead(200);
res.end("Bot is running");
}).listen(process.env.PORT || 3000, () => {
console.log("🌍 Web server running — Railway will not sleep");
});
