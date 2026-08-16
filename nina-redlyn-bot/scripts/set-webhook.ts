/**
 * Registers (or inspects, or removes) the Telegram webhook.
 *
 *   npm run webhook:set -- https://your-deployment.vercel.app
 *   npm run webhook:info
 *   npm run webhook:delete
 */
import "dotenv/config";
import { Bot } from "grammy";
import { ADMIN_COMMANDS, MEMBER_COMMANDS } from "../src/bot.js";
import { config } from "../src/config.js";

async function main() {
  const bot = new Bot(config().BOT_TOKEN);
  await bot.init();
  const args = process.argv.slice(2);

  if (args.includes("--info")) {
    console.log(await bot.api.getWebhookInfo());
    return;
  }

  if (args.includes("--delete")) {
    await bot.api.deleteWebhook({ drop_pending_updates: false });
    console.log("Webhook removed — the bot is now idle.");
    return;
  }

  const base = args.find((a) => a.startsWith("http"));
  if (!base) {
    console.error(
      "Give me the deployment URL:\n" +
        "  npm run webhook:set -- https://your-deployment.vercel.app",
    );
    process.exit(1);
  }

  const url = `${base.replace(/\/$/, "")}/api/telegram`;
  await bot.api.setWebhook(url, {
    secret_token: config().WEBHOOK_SECRET,
    allowed_updates: [
      "message",
      "edited_message",
      "callback_query",
      "my_chat_member",
      "chat_member",
    ],
    drop_pending_updates: true,
  });

  // Members and admins see different menus.
  await bot.api.setMyCommands(MEMBER_COMMANDS, {
    scope: { type: "all_private_chats" },
  });
  for (const adminId of config().ADMIN_IDS) {
    await bot.api
      .setMyCommands([...MEMBER_COMMANDS, ...ADMIN_COMMANDS], {
        scope: { type: "chat", chat_id: adminId },
      })
      .catch(() => {
        console.warn(
          `Could not set the admin menu for ${adminId} — they need to /start the bot first.`,
        );
      });
  }

  console.log(`Webhook set to ${url}`);
  console.log(`Bot is @${bot.botInfo.username}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
