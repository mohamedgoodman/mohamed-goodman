import type { Metadata } from "next";
import { PronunciationView } from "@/components/features/pronunciation-view";

export const metadata: Metadata = { title: "Pronunciation" };

export default function PronunciationPage() {
  return <PronunciationView />;
}
