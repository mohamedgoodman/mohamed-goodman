import type { Metadata } from "next";
import { ImmersionView } from "@/components/features/immersion-view";

export const metadata: Metadata = { title: "Immersion Mode" };

export default function ImmersionPage() {
  return <ImmersionView />;
}
