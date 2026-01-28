console.log("BOT FILE IS RUNNING");
console.log("BOT STARTING...");

const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events"); // ❗ ONLY NewMessage

const apiId = 31581826;
const apiHash = "3e159192e5ad7e5052530bb69325994c";
const stringSession = new StringSession("1BAAOMTQ5LjE1NC4xNjcuOTEAUAnTuPcDAXwmy5yYMHlLReoR7nXplAXAPmPG3IdxtXlzGBsnskkf/vR8IWHt58ZCeT8fGMrmhy6BeFMoo7aEGvKaF8JZ2ZcwRzQK392t7ZF6HYV4+L/udesJAkv1cPpV3bfWydl1FsHm6CG/dLClGUIqhiSrXrxGN8Grp3sG4rp7vNhoGKhdWfDYkTPHS0/hBjDKyM1U5IydIqN5CXU/J97xE4XGmemvbTfWB7saP928c7nnJrBbPLfhZPMvQBVTMrjF6si2VDX1NoHkUoedDJbe8xh0w20CAA6QgtvlT2d0R8/uw0TCiweCrZeNRDjItfR/wGDErZmOO3dWtFRcYY0=");

const SOURCE_CHAT = -1002201450581;
const DEST_CHAT = -1003424003343;

// Map original → copied message
const messageMap = new Map();

const client = new TelegramClient(stringSession, apiId, apiHash, {
connectionRetries: 5,
});

(async () => {
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

// ================= EDIT HANDLER (CORRECT WAY) =================
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
edited: true, // 🔥 THIS replaces EditedMessage
})
);
})();