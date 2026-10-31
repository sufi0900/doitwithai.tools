import WritingPage, { writingMetadata } from "@/features/writing-tools/WritingPage";
export const metadata = writingMetadata("meta-description");
export default function Page() { return <WritingPage kind="meta-description" />; }
