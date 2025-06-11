
import { getTests } from "@/db/queries";
import { List } from "./list";

const PracticesPage = async () => {
    const tests = await getTests();

    return (
        <div className="h-full max-w-[912px] px-3 mx-auto">
            <h1 className="text-2xl font-bold text-neutral-700">
                Available Tests
            </h1>
            <List tests={tests} />
        </div>
    );
}

export default PracticesPage;

