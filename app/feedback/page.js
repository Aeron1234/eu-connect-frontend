import { Suspense } from "react";
import FeedbackBoard from "@/components/feedback-ui/FeedbackBoard";
import Loading from "./loading";
export const metadata = { title: "Feedback & Concerns" };
export default function FeedbackPage() { return <Suspense fallback={<Loading />}><FeedbackBoard /></Suspense>; }
