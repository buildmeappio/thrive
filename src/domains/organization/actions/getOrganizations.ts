import { getCurrentUser } from "@/domains/auth/server/session";
import handlers from "../server/handlers";
import { redirect } from "next/navigation";


const getOrganizations = async () => {
    const user = await getCurrentUser();
    if (!user) {
        redirect("/login");
    }
    const organizations = await handlers.getOrganizations();
    return organizations;
};

export default getOrganizations;
