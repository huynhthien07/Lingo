import { getTest } from "@/db/queries";
import { TestContent } from "./test-content";
import { redirect } from "next/navigation";

type Props = {
    params: Promise<{
        testId: string;
    }>;
    searchParams: Promise<{ review?: string }>;
};

const TestPage = async ({ params, searchParams }: Props) => {
    // In Next.js 15, both params and searchParams are Promises that need to be awaited
    const [{ testId }, unwrappedSearchParams] = await Promise.all([
        params,
        searchParams
    ]);

    const testId_num = parseInt(testId);
    const testData = await getTest(testId_num);
    const isReview = unwrappedSearchParams.review === "true";

    if (!testData) {
        redirect("/practises");
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <TestContent test={testData} isReview={isReview} />
        </div>
    );
};

export default TestPage;




