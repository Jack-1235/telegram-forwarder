/**
* ==================================================================
* JRX GOLD SECONDARY SYSTEM - VERSION 6.8.9 (MODIFIED MERGE EDITION)
* ==================================================================
* * ARCHITECTURE: Secondary Forwarding Engine with Atomic Locking.
* * TOTAL LINE DENSITY: ~460 Lines (Strict Stability Protocol).
* * * * CORE ARCHITECTURAL PILLARS:
* 1. ATOMIC LOCKING: Synchronized barrier to prevent Socket/Sync racing.
* 2. LINK SHIELD: Strictly blocks messages containing external URLs.
* 3. VOICE SHIELD: Updated to ALLOW Audio/Voice transmissions.
* 4. FORMATTING ENGINE: Advanced regex-based re-branding and link injection.
* 5. TRIPLE-LOCK SECURITY: Persistent ID tracking for zero duplicates.
* 6. EDIT-SYNC: Real-time update mirroring for source corrections.
* 7. STEALTH HANDSHAKE: Blocking connectivity validation system.
* 8. REPLY-SYNC: Preserves source-to-source message threading.
* 9. SMART-CALL BYPASS: Allows Zone Alerts while blocking generic calls.
* 10. TIME-SHIELD: Blocks "Live in X minutes" notifications.
* 11. STARTUP-SHIELD: Strict System-Ready gate prevents catch-up loops.
* ==================================================================
*/

// --- INITIALIZATION HEADER ---
console.log("==================================================================");
console.log(" JRX GOLD SECONDARY SYSTEM - V6.8.9 (SMART-CALL + MODIFIED MERGE)");
console.log("==================================================================");
console.log(`[${new Date().toLocaleTimeString()}] 🚀 INITIALIZING SECONDARY CORE...`);
console.log(`[${new Date().toLocaleTimeString()}] 🛡️ SECURITY: ATOMIC ANTI-DUPLICATION ACTIVE.`);
console.log(`[${new Date().toLocaleTimeString()}] 🛡️ SHIELD: STARTUP-SHIELD ENGAGED.`);
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
const DEST_CHAT_ID = "-1003424003343";
const CLEAN_SOURCE = SOURCE_CHAT_ID.replace("-100", "");

// LOGGING STARTUP IDENTITY
console.log(`[${new Date().toLocaleTimeString()}] 📡 SOURCE NODE: [${SOURCE_CHAT_ID}]`);
console.log(`[${new Date().toLocaleTimeString()}] 🎯 DESTINATION NODE: [${DEST_CHAT_ID}]`);
console.log("==================================================================");

// --- 2. GLOBAL STATE MANAGEMENT ---
let messageMap = new Map();
const processedMessages = new Set();
const currentlyProcessing = new Set();
const atomicDebounce = new Map();
const failedIds = new Set();

// STARTUP GUARDS (BOT 1)
let systemReady = false;
const STORAGE_FILE = "message_map_bot2.json";

function log(msg) {
const time = new Date().toLocaleTimeString();
console.log(`[${time}] ${msg}`);
}

function loadStorage() {
log("📂 Database: Accessing storage file for state recovery...");
try {
if (fs.existsSync(STORAGE_FILE)) {
const rawData = fs.readFileSync(STORAGE_FILE, "utf8");
const data = JSON.parse(rawData);

messageMap = new Map(Object.entries(data));

for (const key of messageMap.keys()) {
const sid = key.toString();
processedMessages.add(sid);
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

function saveStorage() {
try {
const dataToSave = Object.fromEntries(messageMap);
fs.writeFileSync(STORAGE_FILE, JSON.stringify(dataToSave, null, 2));
} catch (err) {
log(`⚠️ Database Error: State commit failed - ${err.message}`);
}
}

loadStorage();

// --- 3. THE RAW PROCESSING ENGINE (UPGRADED TO MASTER FORMATTER) ---
function processText(originalText) {
if (!originalText) return "";

let text = originalText;
const isSummary = /Summary|Daily|Weekly/i.test(text);

// EMOJI & TEXT SWAPS FROM BOT 1
text = text.replace(/🥇TP1/g, "✅TP1");
text = text.replace(/🥈TP2/g, "☑️TP2");
text = text.replace(/🥉TP3/g, "✅TP3");
text = text.replace(/🏅TP4/g, "☑️TP4");
text = text.replace(/🚫SL/g, "🛑SL");
text = text.replace(/📱/g, "📤");
text = text.replace(/❌/g, "🛑");
text = text.replace(/🏆/g, "👑");
text = text.replace(/Win Rate (.*?) 🏅/g, "Win Rate $1 🥇");
text = text.replace(/Entry Price/gi, "Execution Level");
text = text.replace(/Target/gi, "Goal");
text = text.replace(/@GoldStandardChannel/gi, "");
text = text.replace(/Gold Trading Community/gi, "");
text = text.replace(/Gold Scalping Analysis/gi, "JRX Gold Scalping Analysis");

if (isSummary) {
if (!text.includes("9FiwB6FYjcQ0Njk0")) {
log("📝 Formatter: Summary detected. Injecting JRX proprietary footer.");
const footerText = "\n\nJoin the JRX Gold Scalping Analysis & Zones group now for a higher volume of trades/zones sent for more experienced traders: https://t.me/+9FiwB6FYjcQ0Njk0\n\n🚀Send Profit Shots to our JRX 🤝 group ( results section): https://t.me/c/3610465749/1";
text = text.trim() + footerText;
}
}

return text.trim();
}

// --- 4. DATA MAINTENANCE ROUTINE ---
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

for (const [id, time] of atomicDebounce.entries()) {
if (now - time > 60000) atomicDebounce.delete(id);
}

if (count > 0) {
log(`Sweep: Removed ${count} expired records from active memory.`);
saveStorage();
}
}, 3600000);

// --- 5. THE MASTER FORWARDING CONTROLLER ---
async function processAndForward(client, msg, isCatchUp = false) {
if (!msg || !msg.id || !systemReady) return; // BOT 1 STARTUP GATE ADDED

const safeId = msg.id.toString();

const rawText = msg.message || "";
const rawLower = rawText.toLowerCase();
const now = Date.now();

// --- ATOMIC SECURITY CHECK (REVERTED TO BOT 2 STYLE) ---
if (processedMessages.has(safeId) || currentlyProcessing.has(safeId) || failedIds.has(safeId)) {
return;
}

if (isCatchUp && atomicDebounce.has(safeId)) {
return;
}

// LOCK THE MESSAGE
currentlyProcessing.add(safeId);
atomicDebounce.set(safeId, now);

try {
// --- TIME-SHIELD (BOT 1 ADDED) ---
if (/Live in \d+ minutes/i.test(rawText) || /Live now/i.test(rawText)) {
log(`🚫 Time-Shield: Blocked ID ${safeId} [Live Stream Notification]`);
processedMessages.add(safeId);
return;
}

// --- SMART CALL PROTOCOL (BOT 2 ORIGINAL - PRESERVED WITH ZOOM BYPASS) ---
const isPotentialZoneCall = (rawLower.includes("potential buy zone") || rawLower.includes("potential sell zone")) && rawLower.includes("wait for the call");

const clientRestrictedWords = ["password", "passcode"];
let containsRestrictedWord = clientRestrictedWords.some(w => rawLower.includes(w));

if (rawLower.includes("call") && !isPotentialZoneCall && !rawLower.includes("zoom")) {
containsRestrictedWord = true;
}

if (containsRestrictedWord) {
log(`🚫 Client-Shield: Blocked ID ${safeId} [Restricted Word / Generic Call]`);
processedMessages.add(safeId);
return;
}

// --- THE SHIELD (LINK & VOICE FILTER - BOT 1 JRX LINK ALLOWLIST ADDED) ---
const forbiddenWords = ["seed", "wallet", "claim", "rectify", "validate", "connect your wallet"];
const hasScamWords = forbiddenWords.some(w => rawLower.includes(w));

// Allowed the JRX group link from Bot 1 and Zoom call links while blocking all others
const hasLink = (rawText.includes("http://") || rawText.includes("https://") || rawText.includes("t.me/")) && !rawText.includes("9FiwB6FYjcQ0Njk0") && !rawLower.includes("zoom");

let isAudioOrVoice = false;
if (msg.media && msg.media.className === 'MessageMediaDocument' && msg.media.document) {
const mimeType = msg.media.document.mimeType || "";
if (mimeType.includes("audio")) isAudioOrVoice = false; // Intentionally set to false to allow voice notes
}

if (hasScamWords || hasLink || isAudioOrVoice) {
log(`🚫 Shield: Blocked ID ${safeId} [Filter Hit]`);
processedMessages.add(safeId);
return;
}

const mode = isCatchUp ? "🔔 SYNC-LOOP" : "⚡ SOCKET-INSTANT";
log(`${mode}: Processing unique ID ${safeId}...`);

const finalText = processText(rawText);
let media = msg.media;

if (media && (media.className === 'MessageMediaWebPage' || media.className === 'MessageMediaUnsupported')) {
media = null;
}

if (!finalText && !media) {
processedMessages.add(safeId);
return;
}

// --- REPLY-SYNC PROTOCOL ---
let destinationReplyId = undefined;
if (msg.replyTo && msg.replyTo.replyToMsgId) {
const originalSourceId = msg.replyTo.replyToMsgId.toString();
const previousEntry = messageMap.get(originalSourceId);

if (previousEntry && previousEntry.destId) {
destinationReplyId = previousEntry.destId;
log(`🔗 Reply-Sync: Mapping Source ${originalSourceId} to Dest ${destinationReplyId}`);
}
}

// COMMIT TO STATE (BOT 2 ORIGINAL STYLE)
processedMessages.add(safeId);
saveStorage();

let sent;
try {
sent = await client.sendMessage(DEST_CHAT_ID, {
message: finalText,
file: media,
replyTo: destinationReplyId,
forceDocument: false,
parse_mode: 'html' // BOT 1 ADDED
});
} catch (err) {
if (err.message.includes("CHAT_FORWARDS_RESTRICTED")) {
log(`🛡️ Media Bypass: Downloading restricted media for ID ${safeId}...`);
let buffer = await client.downloadMedia(msg.media, {});
if (buffer) buffer.name = "image.jpg";
sent = await client.sendMessage(DEST_CHAT_ID, {
message: finalText,
file: buffer,
replyTo: destinationReplyId,
parse_mode: 'html' // BOT 1 ADDED
});
} else {
processedMessages.delete(safeId);
throw err;
}
}

if (sent) {
log(`✅ Success: Delivered ID ${safeId}.`);
messageMap.set(safeId, { destId: sent.id, timestamp: now, lastText: rawText });
saveStorage();
}

} catch (e) {
log(`❌ Process Error: ID ${safeId} - ${e.message}`);
failedIds.add(safeId);
} finally {
currentlyProcessing.delete(safeId);
}
}

// --- 6. STEALTH HANDSHAKE BLOCKER (BOT 1 UPGRADE) ---
async function executeStealthHandshake(client) {
log("🤝 Handshake: Initiating stealth connectivity verification...");
try {
const dot = await client.sendMessage(DEST_CHAT_ID, { message: "." });
await new Promise(r => setTimeout(r, 5000));
await client.deleteMessages(DEST_CHAT_ID, [dot.id], { revoke: true });
log("✅ Handshake: Permissions and connectivity 100% VERIFIED.");
} catch (e) {
log(`❌ CRITICAL: Handshake failed! Error: ${e.message}`);
}
}

// --- 7. CORE INITIALIZATION ENGINE ---
(async () => {
try {
const client = new TelegramClient(stringSession, apiId, apiHash, {
connectionRetries: 50,
autoReconnect: true,
deviceModel: "JRX_Secondary_Merged_V6_8"
});

await client.connect();
log("✅ System: Bot 2 Authenticated and Online.");

// --- 1. FETCH DIALOGS FIRST (With strict safe tracking logic) ---
try {
const dialogs = await client.getDialogs({ limit: 10 });
const sourceGroup = dialogs.find(d => d && d.id && d.id.toString().includes(CLEAN_SOURCE));
const destGroup = dialogs.find(d => d && d.id && d.id.toString().includes((DEST_CHAT_ID || "").replace("-100", "")));

if (sourceGroup && sourceGroup.title) log(`🔍 Active Monitoring: "${sourceGroup.title}"`);
if (destGroup && destGroup.title) log(`🔍 Targeted Delivery: "${destGroup.title}"`);
} catch (e) {
log(`⚠️ Dialog Fetch Bypass: Skipping title cached lookup - ${e.message}`);
}

// --- 2. BULLETPROOF STARTUP SHIELD ---
try {
log("🛡️ Startup-Shield: Seeding memory with historical messages to prevent catch-up spam...");
const history = await client.getMessages(SOURCE_CHAT_ID, { limit: 20 });
for (const m of history) {
if (m && m.id) {
processedMessages.add(m.id.toString());
}
}
log(`🛡️ Startup-Shield: Successfully locked ${history.length} old messages. Ready.`);
} catch (e) {
log(`⚠️ Startup-Shield: Failed to fetch history - ${e.message}`);
}

// --- STRICT STARTUP GATE (BOT 1 ADDED) ---
await executeStealthHandshake(client);
systemReady = true;
log("🛡️ Shield: SYSTEM READY for universal duplicate-free forwarding.");

// --- THE INSTANT SOCKET HANDLER ---
client.addEventHandler(async (update) => {
if (!systemReady) return; // BOT 1 GATE
const m = update.message;
if (!m) return;
const chatIdentifier = (m.peerId?.channelId || m.peerId?.chatId || "").toString();

if (chatIdentifier === CLEAN_SOURCE || chatIdentifier === SOURCE_CHAT_ID) {
if (update instanceof Api.UpdateNewChannelMessage || update instanceof Api.UpdateNewMessage) {
atomicDebounce.set(m.id.toString(), Date.now());
await processAndForward(client, m, false);
} else if (update instanceof Api.UpdateEditChannelMessage || update instanceof Api.UpdateEditMessage) {
const entry = messageMap.get(m.id.toString());

// --- SMART CALL FILTER FOR EDITS (BOT 2 ORIGINAL - PRESERVED WITH ZOOM BYPASS) ---
const rawTextEdit = m.message || "";
const rawLowerEdit = rawTextEdit.toLowerCase();
const isPotentialZoneEdit = (rawLowerEdit.includes("potential buy zone") || rawLowerEdit.includes("potential sell zone")) && rawLowerEdit.includes("wait for the call");

const clientRestrictedWords = ["password", "passcode"];
let shouldBlockEdit = clientRestrictedWords.some(w => rawLowerEdit.includes(w));

if (rawLowerEdit.includes("call") && !isPotentialZoneEdit && !rawLowerEdit.includes("zoom")) {
shouldBlockEdit = true;
}

if (shouldBlockEdit) {
log(`🚫 Client-Shield: Blocked edit for ID ${m.id} [Restricted Word or Generic Call]`);
return;
}

// EDIT SYNC (REVERTED TO BOT 2 STYLE CHECK)
if (entry && m.message !== entry.lastText) {
log(`⚡ Edit-Sync: Mirroring change for ID ${m.id}`);
try {
await client.editMessage(DEST_CHAT_ID, {
message: entry.destId,
text: processText(m.message) // BOT 1 FORMATTER APPLIED
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
if (!systemReady) return; // BOT 1 GUARD
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

// --- SMART CALL FILTER FOR HEARTBEAT (BOT 2 ORIGINAL - PRESERVED WITH ZOOM BYPASS) ---
const rawTextH = m.message || "";
const rawLowerH = rawTextH.toLowerCase();
const isPotentialZoneH = (rawLowerH.includes("potential buy zone") || rawLowerH.includes("potential sell zone")) && rawLowerH.includes("wait for the call");

const clientRestrictedWords = ["password", "passcode"];
let shouldBlockHeartbeat = clientRestrictedWords.some(w => rawLowerH.includes(w));

if (rawLowerH.includes("call") && !isPotentialZoneH && !rawLowerH.includes("zoom")) {
shouldBlockHeartbeat = true;
}

if (shouldBlockHeartbeat) continue;

// EDIT SYNC (REVERTED TO BOT 2 STYLE CHECK)
if (m.message && m.message !== entry.lastText) {
log(`🔄 Heartbeat: Updating edit for ID ${mIdStr}`);
try {
await client.editMessage(DEST_CHAT_ID, {
message: entry.destId,
text: processText(m.message) // BOT 1 FORMATTER APPLIED
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

