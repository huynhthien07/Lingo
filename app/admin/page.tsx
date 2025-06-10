//"use client";

import { getIsAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";


//const AdminClient = dynamic(()=> import ("./AdminClient"),{ssr: false});
import AdminClient from "./AdminClient";

const AdminPage = async ()=> {
    const isAdmin = await getIsAdmin();
    if (!isAdmin){
        redirect("/")
    }
    return <AdminClient/>
};

export default AdminPage;
