import WritingPage, { writingMetadata } from "@/features/writing-tools/WritingPage";
export const metadata = writingMetadata("h1-heading");
export default function Page() { return <WritingPage kind="h1-heading" />; }
