import { getIsAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import AdminClientWrapper from "./AdminClientWrapper";

const AdminPage = async () => {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
        redirect("/")
    }
    return <AdminClientWrapper />
};

export default AdminPage;
