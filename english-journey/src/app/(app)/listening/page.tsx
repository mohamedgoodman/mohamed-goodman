import type { Metadata } from "next";
import { ListeningView } from "@/components/features/listening-view";

export const metadata: Metadata = { title: "Listening" };

export default function ListeningPage() {
  return <ListeningView />;
}
