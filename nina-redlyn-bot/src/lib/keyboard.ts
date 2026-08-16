import { InlineKeyboard } from "grammy";
import type { Button } from "../db.js";

/**
 * Buttons are written one per line, `Label - https://url`. Two buttons on the
 * same line share a row when separated by ` | `.
 */
export function parseButtons(input: string): {
  buttons: Button[];
  errors: string[];
} {
  const buttons: Button[] = [];
  const errors: string[] = [];

  for (const line of input.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    for (const cell of trimmed.split("|")) {
      const piece = cell.trim();
      if (!piece) continue;

      // Split on the last " - " so labels may themselves contain a dash.
      const separator = piece.lastIndexOf(" - ");
      if (separator === -1) {
        errors.push(`"${piece}" — expected \`Label - https://url\``);
        continue;
      }
      const text = piece.slice(0, separator).trim();
      const url = piece.slice(separator + 3).trim();

      if (!text) {
        errors.push(`"${piece}" — the label is empty`);
        continue;
      }
      if (!/^(https?:\/\/|tg:\/\/|https:\/\/t\.me\/)/i.test(url)) {
        errors.push(`"${text}" — "${url}" is not a valid http(s) or tg link`);
        continue;
      }
      buttons.push({ text, url });
    }
  }

  if (buttons.length > 20) {
    errors.push("Telegram allows at most 20 buttons on one post.");
  }
  return { buttons, errors };
}

/** Lays buttons out two per row, which reads well on a phone. */
export function buildKeyboard(buttons: Button[]): InlineKeyboard | undefined {
  if (buttons.length === 0) return undefined;
  const keyboard = new InlineKeyboard();
  buttons.forEach((button, index) => {
    keyboard.url(button.text, button.url);
    const isLastInRow = index % 2 === 1;
    if (isLastInRow && index !== buttons.length - 1) keyboard.row();
  });
  return keyboard;
}
