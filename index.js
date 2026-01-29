console.log("BOT FILE IS RUNNING");
console.log("BOT STARTING...");

const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const http = require("http");

const apiId = 31581826;
const apiHash = "3e159192e5ad7e5052530bb69325994c";

// 🔥 PASTE YOUR STRING SESSION BETWEEN THE QUOTES
const stringSession = new StringSession("1BAAOMTQ5LjE1NC4xNjcuOTEAUIbsSoZoQazAkuFXF+PRqtSM8ur+5Ca+FAgczF2DiLwugbljaL/2wo+Fk5LwsHg9ZC+OX7c5SQYFQETiRLmSSYxS3ZSC00wZlHZgE17/OGtqtriwjVfc42NwM+46miSC5C3I5cy4Aihh/gemB/glDyAl+81CHQyjD/tXVyECuWSbrtBs0+Q5pQrhzNN5H7BxEZqiu3lU3PyYJf4BSYMBupAoHJKfqkjTfB8dwkpmEoACTw5q+2Nlt/n7q3kuy3Km3izJm46UXfzayxCwveJpAGADPCsgpD065WsMlEVKGr1jr2lBUsqsOWog2C8tMYE2qaxrHL47WSahzvcZJQX8FjY=");

const SOURCE_CHAT = -1002201450581;
const DEST_CHAT = -1003424003343;

const messageMap = new Map();

// 🔁 SAFE SEND FUNCTION
async function safeSend(client, chatId, content, isFile = false) {
try {
if (isFile) {
return await client.sendFile(chatId, content);
} else {
return await client.sendMessage(chatId, content);
}
} catch (err) {
console.log("⚠️ Send failed, retrying in 5s...");
setTimeout(() => safeSend(client, chatId, content, isFile), 5000);
}
}

(async () => {
try {

const client = new TelegramClient(stringSession, apiId, apiHash, {
connectionRetries: 999999,
retryDelay: 5000,
autoReconnect: true
});

console.log("🔌 Connecting to Telegram...");
await client.connect(); // ✅ NOW WE USE CONNECT (NO LOGIN FLOW)
console.log("✅ Logged in and running...");

// ================= NEW MESSAGE HANDLER =================
client.addEventHandler(
async (event) => {
if (!event.message) return;
const msg = event.message;
if (!msg.id) return;

console.log("📩 Message detected:", msg.id);
const text = (msg.text || "").toLowerCase();

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

if (msg.media) {
sent = await safeSend(client, DEST_CHAT, {
file: msg.media,
caption: msg.text || "",
}, true);
} else {
sent = await safeSend(client, DEST_CHAT, {
message: msg.text || "",
});
}

if (sent) {
console.log("✅ Message forwarded");
messageMap.set(msg.id, sent.id);
}

} catch (err) {
console.log("⚠️ Forward error:", err.message);
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

try {
await client.editMessage(DEST_CHAT, {
message: copiedMsgId,
text: msg.text,
});
console.log("✅ Copy updated");
} catch (err) {
console.log("⚠️ Edit failed, reconnect likely");
}
}
},
new NewMessage({
chats: [SOURCE_CHAT],
edited: true,
})
);

// ❤️ Heartbeat
setInterval(() => {
console.log("💓 Bot heartbeat:", new Date().toISOString());
}, 60000);

} catch (err) {
console.error("❌ BOT CRASHED:", err);
}
})();

// Prevent crash on unhandled promise
process.on("unhandledRejection", err => console.log("Unhandled:", err.message));

// 🌍 Railway web server
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
res.writeHead(200);
res.end("Bot is running");
}).listen(PORT, () => {
console.log(`🌍 Web server running on port ${PORT}`);
});