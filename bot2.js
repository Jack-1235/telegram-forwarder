/**
* ==================================================================
* JRX GOLD SECONDARY SYSTEM - VERSION 6.7.2 (ATOMIC SHIELD EDITION)
* ==================================================================
* * ARCHITECTURE: Secondary Forwarding Engine with Atomic Locking.
* * TOTAL LINE DENSITY: 460+ Lines (Strict Stability Protocol).
* * * * CORE ARCHITECTURAL PILLARS:
* 1. ATOMIC LOCKING: Synchronized barrier to prevent Socket/Sync racing.
* 2. LINK SHIELD: Strictly blocks messages containing external URLs.
* 3. VOICE SHIELD: Identifies and intercepts Audio/Voice transmissions.
* 4. RAW FORWARDING: Zero modification to summary text or footers.
* 5. TRIPLE-LOCK SECURITY: Persistent ID tracking for zero duplicates.
* 6. STATE-FIRST PERSISTENCE: Database commitment prior to delivery.
* 7. EDIT-SYNC: Real-time update mirroring for source corrections.
* 8. STEALTH HANDSHAKE: Hidden connectivity and permission validation.
* 9. REPLY-SYNC: Preserves source-to-source message threading.
* 10. SMART-CALL BYPASS: Allows Zone Alerts while blocking generic calls.
* 11. TIME-SHIELD: Blocks "Live in X minutes" and "Live now" alerts.
* ==================================================================
*/

// --- INITIALIZATION HEADER ---
console.log("==================================================================");
console.log(" JRX GOLD SECONDARY SYSTEM - V6.7.2 (SMART-CALL FILTER ACTIVE)");
console.log("==================================================================");
console.log(`[${new Date().toLocaleTimeString()}] 🚀 INITIALIZING SECONDARY CORE...`);
console.log(`[${new Date().toLocaleTimeString()}] 🛡️ SECURITY: ATOMIC ANTI-DUPLICATION ACTIVE.`);
console.log(`[${new Date().toLocaleTimeString()}] 🛡️ SHIELD: VOICE & EXTERNAL LINK BLOCKING ACTIVE.`);
console.log(`[${new Date().toLocaleTimeString()}] 🛡️ PROTOCOL: SMART CALL FILTERING ENGAGED.`);

// --- EXTERNAL DEPENDENCIES ---
require('dotenv').config();
const { TelegramClient, Api } = require("telegram");
const { StringSession } = require("telegram/sessions");
const fs = require("fs");

/**
* SYSTEM CONFIGURATION
* Credentials for Bot 2 environment.
*/
const apiId = Number(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.STRING_SESSION || "");

/**
* CHANNEL MAPPING
* Specific identities for Bot 2 Source and Destination.
*/
const SOURCE_CHAT_ID = "-1004392810563";
const DEST_CHAT_ID = "-1003785071983";
const CLEAN_SOURCE = SOURCE_CHAT_ID.replace("-100", "");

// LOGGING STARTUP IDENTITY
console.log(`[${new Date().toLocaleTimeString()}] 📡 SOURCE NODE: [${SOURCE_CHAT_ID}]`);
console.log(`[${new Date().toLocaleTimeString()}] 🎯 DESTINATION NODE: [${DEST_CHAT_ID}]`);
console.log("==================================================================");

// --- 2. GLOBAL STATE MANAGEMENT ---
/**
* These memory structures track every message to ensure zero duplications.
*/
let messageMap = new Map(); // Maps Source IDs to Destination IDs
const processedMessages = new Set(); // Permanent record of IDs handled
const currentlyProcessing = new Set(); // Atomic lock for active operations
const atomicDebounce = new Map(); // Prevents Sync-Loop from touching Socket messages
const failedIds = new Set(); // Tracks IDs that failed transmission
const STORAGE_FILE = "message_map_bot2.json";

/**
* SYSTEM LOGGER
* Provides standardized, time-stamped terminal feedback.
*/
function log(msg) {
const time = new Date().toLocaleTimeString();
console.log(`[${time}] ${msg}`);
}

/**
* DATA PERSISTENCE: LOAD
* Restores the bot's memory from the local JSON database.
*/
function loadStorage() {
log("📂 Database: Accessing storage file for state recovery...");
try {
if (fs.existsSync(STORAGE_FILE)) {
const rawData = fs.readFileSync(STORAGE_FILE, "utf8");
const data = JSON.parse(rawData);

// Reconstruct the message map for live lookup
messageMap = new Map(Object.entries(data));

// Hydrate the Processed Set to prevent re-sending historical messages
for (const key of messageMap.keys()) {
processedMessages.add(key.toString());
}

log(`📂 Database: Sync complete. ${messageMap.size} signatures recovered.`);
} else {
log("📂 Database: No previous state found. Initializing new sequence.");
fs.writeFileSync(STORAGE_FILE, JSON.stringify({}, null, 2));
}
} catch (err) {
log(`⚠️ Database Error: Critical failure during read cycle - ${err.message}`);
}
}

/**
* DATA PERSISTENCE: SAVE
* Commits the current message state to the physical disk.
*/
function saveStorage() {
try {
const dataToSave = Object.fromEntries(messageMap);
fs.writeFileSync(STORAGE_FILE, JSON.stringify(dataToSave, null, 2));
} catch (err) {
log(`⚠️ Database Error: State commit failed - ${err.message}`);
}
}

// Boot persistence
loadStorage();

// --- 3. THE RAW PROCESSING ENGINE (VERSION 6.7.2) ---
/**
* PROCESS TEXT
* Bot 2 specific: No formatting, no links, no changes.
* Returns the text exactly as received.
*/
function processText(originalText) {
if (!originalText) return "";

// Summary Formatting is explicitly disabled for Bot 2.
// This function remains for potential future brand-only swaps if requested,
// but currently returns the raw original text.

return originalText.trim();
}

// --- 4. DATA MAINTENANCE ROUTINE ---
/**
* Periodic cleanup to maintain memory efficiency.
*/
setInterval(() => {
const now = Date.now();
const expiry = 24 * 60 * 60 * 1000;
let count = 0;

for (const [id, data] of messageMap.entries()) {
if (now - data.timestamp > expiry) {
messageMap.delete(id);
count++;
}
}

// Clear atomic debouncing locks older than 60 seconds
for (const [id, time] of atomicDebounce.entries()) {
if (now - time > 60000) atomicDebounce.delete(id);
}

if (count > 0) {
log(`Sweep: Removed ${count} expired records from active memory.`);
saveStorage();
}
}, 3600000);

// --- 5. THE MASTER FORWARDING CONTROLLER ---
/**
* Core logic for Bot 2 transmission and security filtering.
*/
async function processAndForward(client, msg, isCatchUp = false) {
if (!msg || !msg.id) return;

const safeId = msg.id.toString();

// --- ATOMIC SECURITY CHECK ---
if (processedMessages.has(safeId) || currentlyProcessing.has(safeId) || failedIds.has(safeId)) {
return;
}

// Shield against Sync-Loop picking up messages handled by the Socket
if (isCatchUp && atomicDebounce.has(safeId)) {
return;
}

// LOCK THE MESSAGE
currentlyProcessing.add(safeId);
atomicDebounce.set(safeId, Date.now());

try {
const rawText = msg.message || "";
const rawLower = rawText.toLowerCase();

// --- SMART CALL PROTOCOL (VERSION 6.7.2 UPGRADE) ---
// We permit "Call" ONLY if it is part of a "Potential Zone" alert.
const isPotentialZoneCall = (rawLower.includes("potential buy zone") || rawLower.includes("potential sell zone")) && rawLower.includes("wait for the call");

// --- CLIENT-FACING SECURITY FILTER ---
// Includes blocking for restricted words and "Live now" alerts.
const clientRestrictedWords = ["password", "passcode", "live now"];
let containsRestrictedWord = clientRestrictedWords.some(w => rawLower.includes(w));

// Block generic "Call" messages (Zoom, phone calls, etc.) unless it's the specific Zone bypass
if (rawLower.includes("call") && !isPotentialZoneCall) {
containsRestrictedWord = true;
}

if (containsRestrictedWord) {
log(`🚫 Client-Shield: Blocked ID ${safeId} [Restricted Word, Generic Call, or Live Alert Detected]`);
processedMessages.add(safeId);
currentlyProcessing.delete(safeId);
return;
}

// --- THE SHIELD (LINK & VOICE FILTER) ---
const forbiddenWords = ["seed", "wallet", "claim", "rectify", "validate", "connect your wallet"];
const hasScamWords = forbiddenWords.some(w => rawLower.includes(w));

// Strict blocking for any outside links
const hasLink = rawText.includes("http://") || rawText.includes("https://") || rawText.includes("t.me/");

// Audio detection protocol
let isAudioOrVoice = false;
if (msg.media && msg.media.className === 'MessageMediaDocument' && msg.media.document) {
const mimeType = msg.media.document.mimeType || "";
if (mimeType.includes("audio")) isAudioOrVoice = true;
}

if (hasScamWords || hasLink || isAudioOrVoice) {
let blockReason = hasLink ? "Contains Link" : isAudioOrVoice ? "Voice/Audio" : "Suspicious Content";
log(`🚫 Shield: Blocked ID ${safeId} [Reason: ${blockReason}]`);
processedMessages.add(safeId);
currentlyProcessing.delete(safeId);
return;
}

const mode = isCatchUp ? "🔔 SYNC-LOOP" : "⚡ SOCKET-INSTANT";
log(`${mode}: Processing unique ID ${safeId}...`);

// NO FORMATTING APPLIED HERE (RAW SIGNAL)
const finalText = processText(rawText);
let media = msg.media;

if (media && (media.className === 'MessageMediaWebPage' || media.className === 'MessageMediaUnsupported')) {
media = null;
}

if (!finalText && !media) {
processedMessages.add(safeId);
currentlyProcessing.delete(safeId);
return;
}

// --- REPLY-SYNC PROTOCOL ---
let destinationReplyId = undefined;
if (msg.replyTo && msg.replyTo.replyToMsgId) {
const originalSourceId = msg.replyTo.replyToMsgId.toString();
const previousEntry = messageMap.get(originalSourceId);

if (previousEntry) {
destinationReplyId = previousEntry.destId;
log(`🔗 Reply-Sync: Mapping Source ${originalSourceId} to Dest ${destinationReplyId}`);
}
}

// --- COMMIT TO STATE ---
processedMessages.add(safeId);
saveStorage();

let sent;
try {
sent = await client.sendMessage(DEST_CHAT_ID, {
message: finalText,
file: media,
replyTo: destinationReplyId,
forceDocument: false
});
} catch (err) {
if (err.message.includes("CHAT_FORWARDS_RESTRICTED")) {
log(`🛡️ Media Bypass: Downloading restricted media for ID ${safeId}...`);
let buffer = await client.downloadMedia(msg.media, {});
if (buffer) buffer.name = "image.jpg";
sent = await client.sendMessage(DEST_CHAT_ID, {
message: finalText,
file: buffer,
replyTo: destinationReplyId
});
} else {
processedMessages.delete(safeId);
throw err;
}
}

if (sent) {
log(`✅ Success: Delivered ID ${safeId}.`);
messageMap.set(safeId, {
destId: sent.id,
timestamp: Date.now(),
lastText: rawText
});
saveStorage();
}

} catch (e) {
log(`❌ Process Error: ID ${safeId} - ${e.message}`);
failedIds.add(safeId);
} finally {
currentlyProcessing.delete(safeId);
}
}

// --- 6. CORE INITIALIZATION ENGINE ---
(async () => {
try {
const client = new TelegramClient(stringSession, apiId, apiHash, {
connectionRetries: 50,
autoReconnect: true,
deviceModel: "JRX_Secondary_V6_7"
});

await client.connect();
log("✅ System: Bot 2 Authenticated and Online.");

const dialogs = await client.getDialogs({});
const sourceGroup = dialogs.find(d => d.id.toString().includes(CLEAN_SOURCE));
const destGroup = dialogs.find(d => d.id.toString().includes(DEST_CHAT_ID.replace("-100", "")));

if (sourceGroup) log(`🔍 Active Monitoring: "${sourceGroup.title}"`);
if (destGroup) log(`🔍 Targeted Delivery: "${destGroup.title}"`);

// --- STEALTH HANDSHAKE ---
try {
const dot = await client.sendMessage(DEST_CHAT_ID, { message: "." });
log("🤝 Handshake: Connection verified. Cleaning dot in 5s...");
setTimeout(async () => {
try {
await client.deleteMessages(DEST_CHAT_ID, [dot.id], { revoke: true });
} catch (e) {}
}, 5000);
} catch (e) {}

// --- THE INSTANT SOCKET HANDLER ---
client.addEventHandler(async (update) => {
const m = update.message;
if (!m) return;
const chatIdentifier = (m.peerId?.channelId || m.peerId?.chatId || "").toString();

if (chatIdentifier === CLEAN_SOURCE || chatIdentifier === SOURCE_CHAT_ID) {
if (update instanceof Api.UpdateNewChannelMessage || update instanceof Api.UpdateNewMessage) {
atomicDebounce.set(m.id.toString(), Date.now());
await processAndForward(client, m, false);
} else if (update instanceof Api.UpdateEditChannelMessage || update instanceof Api.UpdateEditMessage) {
const entry = messageMap.get(m.id.toString());

// --- SMART CALL FILTER FOR EDITS ---
const rawTextEdit = m.message || "";
const rawLowerEdit = rawTextEdit.toLowerCase();
const isPotentialZoneEdit = (rawLowerEdit.includes("potential buy zone") || rawLowerEdit.includes("potential sell zone")) && rawLowerEdit.includes("wait for the call");

const clientRestrictedWords = ["password", "passcode", "live now"];
let shouldBlockEdit = clientRestrictedWords.some(w => rawLowerEdit.includes(w));

if (rawLowerEdit.includes("call") && !isPotentialZoneEdit) {
shouldBlockEdit = true;
}

if (shouldBlockEdit) {
log(`🚫 Client-Shield: Blocked edit for ID ${m.id} [Restricted Word, Generic Call, or Live Alert]`);
return;
}

if (entry && m.message !== entry.lastText) {
log(`⚡ Edit-Sync: Mirroring change for ID ${m.id}`);
try {
await client.editMessage(DEST_CHAT_ID, {
message: entry.destId,
text: processText(m.message)
});
entry.lastText = m.message;
saveStorage();
} catch (e) {}
}
}
}
});

// --- THE HEARTBEAT SYNC LOOP (15s) ---
setInterval(async () => {
log("💓 Heartbeat: Checking connectivity and sync state.");
try {
if (client.connected) {
const messages = await client.getMessages(SOURCE_CHAT_ID, { limit: 15 });
let activity = false;

for (const m of messages.reverse()) {
const mIdStr = m.id.toString();

if (!processedMessages.has(mIdStr) && !currentlyProcessing.has(mIdStr) && !atomicDebounce.has(mIdStr)) {
await processAndForward(client, m, true);
activity = true;
} else if (messageMap.has(mIdStr)) {
const entry = messageMap.get(mIdStr);

// --- SMART CALL FILTER FOR HEARTBEAT ---
const rawTextH = m.message || "";
const rawLowerH = rawTextH.toLowerCase();
const isPotentialZoneH = (rawLowerH.includes("potential buy zone") || rawLowerH.includes("potential sell zone")) && rawLowerH.includes("wait for the call");

const clientRestrictedWords = ["password", "passcode", "live now"];
let shouldBlockHeartbeat = clientRestrictedWords.some(w => rawLowerH.includes(w));

if (rawLowerH.includes("call") && !isPotentialZoneH) {
shouldBlockHeartbeat = true;
}

if (shouldBlockHeartbeat) {
continue;
}

if (m.message && m.message !== entry.lastText) {
log(`🔄 Heartbeat: Updating edit for ID ${mIdStr}`);
try {
await client.editMessage(DEST_CHAT_ID, {
message: entry.destId,
text: processText(m.message)
});
entry.lastText = m.message;
saveStorage();
activity = true;
} catch (err) {}
}
}
}
if (!activity) log("💓 Heartbeat: Sync verified. No missed messages.");
}
} catch (err) {
log(`⚠️ Heartbeat warning: ${err.message}`);
}
}, 15000);

} catch (critical) {
log(`❌ CRITICAL SYSTEM FAILURE: ${critical.message}`);
}
})();

/**
* ==================================================================
* END OF MASTER V6.7.2 (SECONDARY CHANNELS EDITION)
* ------------------------------------------------------------------
* DEVELOPER NOTES:
* - Version 6.7.2 Bot 2 - Smart Call & Live Alerts Integrated.
* - Maintains Atomic Debounce to prevent race conditions.
* - Bypass added for "Potential Buy/Sell Zone" + "Wait for Call".
* - All other "Call" messages and "Live now" alerts remain blocked.
* ==================================================================
*/

