import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/actions";
import { parseParameter } from "next/dist/shared/lib/router/utils/route-regex";

interface WorkspaceIdSettingsPageProps {
    params: {
        workspaceId: string;
    }
};

const WorkspaceIdSettingsPage = async ({ params }: WorkspaceIdSettingsPageProps) => {
    const user = await getCurrent();
    if(!user)   redirect("/signin");

    return (
        <div>
            WorkspaceIdSettingsPage: {params.workspaceId}
        </div>
    );
};

export default WorkspaceIdSettingsPage;
