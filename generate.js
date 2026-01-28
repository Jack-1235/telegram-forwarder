const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

const apiId = 31581826; // PUT YOUR API ID HERE
const apiHash = "3e159192e5ad7e5052530bb69325994c"; // PUT YOUR API HASH HERE

(async () => {
const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
connectionRetries: 5,
});

await client.start({
phoneNumber: async () => await input.text("Enter your phone number: "),
password: async () => await input.text("Enter 2FA password (if you have one): "),
phoneCode: async () => await input.text("Enter the code you received: "),
onError: (err) => console.log(err),
});

console.log("\n✅ YOUR STRING SESSION:\n");
console.log(client.session.save());
})();
