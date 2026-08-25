import type { Metadata } from "next";
import { SpeakingView } from "@/components/features/speaking-view";

export const metadata: Metadata = { title: "Speaking" };

export default function SpeakingPage() {
  return <SpeakingView />;
}
