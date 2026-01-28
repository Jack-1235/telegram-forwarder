console.log("BOT FILE IS RUNNING");
console.log("BOT STARTING...");

const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage, EditedMessage } = require("telegram/events");

const apiId = 31581826;
const apiHash = "3e159192e5ad7e5052530bb69325994c";
const stringSession = new StringSession("YOUR_STRING_SESSION_HERE");

const SOURCE_CHAT = -1002201450581;
const DEST_CHAT = -1003424003343;

// Map original message → copied message
const messageMap = new Map();

const client = new TelegramClient(stringSession, apiId, apiHash, {
connectionRetries: 5,
});

(async () => {
await client.start();
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

let sent;

try {
// Send text
sent = await client.sendMessage(DEST_CHAT, {
message: msg.text || "",
});
} catch (err) {
console.log("⚠️ Could not forward message:", err.message);
return;
}

console.log("✅ Message forwarded");

// Save mapping for edits
messageMap.set(msg.id, sent.id);
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
new EditedMessage({
chats: [SOURCE_CHAT],
})
);
})();