import type { Metadata } from "next";
import { RealEnglishView } from "@/components/features/real-english-view";

export const metadata: Metadata = { title: "Real English" };

export default function RealEnglishPage() {
  return <RealEnglishView />;
}
