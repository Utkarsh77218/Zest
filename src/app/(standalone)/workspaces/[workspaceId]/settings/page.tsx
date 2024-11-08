import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/actions";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { getWorkspace } from "@/features/workspaces/actions";

interface WorkspaceIdSettingsPageProps {
    params: {
        workspaceId: string;
    }
};

const WorkspaceIdSettingsPage = async ({ params }: WorkspaceIdSettingsPageProps) => {
    const user = await getCurrent();
    if(!user)   redirect("/signin");

    const initialValues = await getWorkspace({ workspaceId: params.workspaceId });

    if(!initialValues) {
        redirect(`/workspaces/${params.workspaceId}`);
    }

    return (
        <div>
            <EditWorkspaceForm initialValues={initialValues} />
        </div>
    );
};

export default WorkspaceIdSettingsPage;
