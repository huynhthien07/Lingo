"use client";

import dynamic from "next/dynamic";

const AdminClient = dynamic(() => import("./AdminClient"), { ssr: false });

const AdminClientWrapper = () => {
    return <AdminClient />;
};

export default AdminClientWrapper;
