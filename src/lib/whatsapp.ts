import { brand } from "@/config/shop";
import { formatMAD } from "@/lib/money";
import { pick, type Product } from "@/lib/shop/types";

/**
 * WhatsApp is how a large share of Moroccan orders actually get placed, so the
 * link has to arrive with the order already written out — the customer should
 * only have to press send.
 */

export interface WhatsAppOrderInput {
  product: Pick<Product, "name" | "ref" | "price">;
  /** Display label, e.g. "M" or "42". */
  size?: string;
  /** Display name, e.g. "Écru". */
  color?: string;
  quantity?: number;
  locale?: string;
  /** Canonical product URL, so the shop can see exactly what's meant. */
  url?: string;
}

const GREETING: Record<string, string> = {
  fr: "Bonjour, je voudrais commander :",
  ar: "السلام عليكم، بغيت نطلب هاد القطعة:",
  en: "Hello, I'd like to order:",
};

const LABELS: Record<string, Record<string, string>> = {
  fr: {
    ref: "Réf.",
    size: "Taille",
    color: "Couleur",
    qty: "Quantité",
    price: "Prix",
  },
  ar: {
    ref: "المرجع",
    size: "المقاس",
    color: "اللون",
    qty: "الكمية",
    price: "الثمن",
  },
  en: {
    ref: "Ref.",
    size: "Size",
    color: "Colour",
    qty: "Quantity",
    price: "Price",
  },
};

/** Builds the pre-filled message body. Exported for testing and previews. */
export function buildWhatsAppMessage({
  product,
  size,
  color,
  quantity = 1,
  locale = "fr",
  url,
}: WhatsAppOrderInput): string {
  const l = LABELS[locale] ?? LABELS.fr;
  const lines = [
    GREETING[locale] ?? GREETING.fr,
    "",
    `• ${pick(product.name, locale)}`,
    `• ${l.ref} ${product.ref}`,
  ];

  if (color) lines.push(`• ${l.color} : ${color}`);
  if (size) lines.push(`• ${l.size} : ${size}`);
  if (quantity > 1) lines.push(`• ${l.qty} : ${quantity}`);
  lines.push(
    `• ${l.price} : ${formatMAD(product.price * quantity, { locale })}`,
  );
  if (url) lines.push("", url);

  return lines.join("\n");
}

/** Full wa.me deep link with the order pre-filled. */
export function buildWhatsAppOrderLink(input: WhatsAppOrderInput): string {
  const text = encodeURIComponent(buildWhatsAppMessage(input));
  return `https://wa.me/${brand.whatsapp}?text=${text}`;
}

/** Whole-basket message, used by the cart when handing off to WhatsApp. */
export function buildWhatsAppCartLink(
  lines: Array<{
    name: string;
    ref: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
  }>,
  subtotal: number,
  locale = "fr",
): string {
  const l = LABELS[locale] ?? LABELS.fr;
  const totals: Record<string, string> = {
    fr: "Total",
    ar: "المجموع",
    en: "Total",
  };

  const body = [
    GREETING[locale] ?? GREETING.fr,
    "",
    ...lines.map(
      (line) =>
        `• ${line.name} (${l.ref} ${line.ref}) — ${l.size} ${line.size}, ` +
        `${l.color} ${line.color} × ${line.quantity}`,
    ),
    "",
    `${totals[locale] ?? totals.fr} : ${formatMAD(subtotal, { locale })}`,
  ].join("\n");

  return `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(body)}`;
}

/** Plain "talk to us" link, for the header and contact points. */
export function buildWhatsAppContactLink(locale = "fr"): string {
  const openers: Record<string, string> = {
    fr: "Bonjour, j'ai une question.",
    ar: "السلام عليكم، عندي سؤال.",
    en: "Hello, I have a question.",
  };
  return `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(
    openers[locale] ?? openers.fr,
  )}`;
}
