import { z } from "zod";
import { ID, Query } from "node-appwrite";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { getMember } from "@/features/members/utils";

import { createAdminClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID } from "@/config";

import { createTaskSchema } from "../schemas";
import { Task, TaskStatus } from "../types";
import { Project } from "@/features/projects/types";

const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        zValidator(
            "query",
            z.object({
                workspaceId: z.string(),
                projectId: z.string().nullish(),
                assigneeId: z.string().nullish(),
                status: z.nativeEnum(TaskStatus).nullish(),
                dueDate: z.string().nullish(),
                search: z.string().nullish(),
            }),
        ),
        async (c) => {
            const user = c.get('user');
            const databases = c.get('databases');
            const { users } = await createAdminClient();
            const {
                workspaceId,
                projectId,
                assigneeId,
                search,
                status,
                dueDate,
            } = c.req.valid('query');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if(!member) {
                return c.json({ error: 'Unauthorized' }, 401);
            }

            const query = [
                Query.equal('workspaceId', workspaceId),
                Query.orderDesc('$createdAt'),
            ];

            if(projectId) {
                query.push(Query.equal("projectId", projectId));
            }

            if(status) {
                query.push(Query.equal("status", status));
            }

            if(assigneeId) {
                query.push(Query.equal("assigneeId", assigneeId));
            }

            if(dueDate) {
                query.push(Query.equal("dueDate", dueDate));
            }

            if(search) {
                query.push(Query.equal("search", search));
            }

            const tasks = await databases.listDocuments<Task>(
                DATABASE_ID,
                TASKS_ID,
                query,
            );

            const projectIds = tasks.documents.map((task) => task.projectId);
            const assigneeIds = tasks.documents.map((task) => task.assigneeId);

            const projects = await databases.listDocuments<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectIds.length > 0 ? [Query.contains("$id", projectIds)] : [],
            );

            const members = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : [],
            );

            const assignees = await Promise.all(
                members.documents.map(async (member) => {
                    const user = await users.get(member.userId);

                    return {
                        ...member,
                        name: user.name,
                        email: user.email,
                    };
                })
            );

            const populatedTasks = tasks.documents.map((task) => {
                const project = projects.documents.find(
                    (project) => project.$id === task.projectId,
                );

                const assignee = assignees.find(
                    (assignee) => assignee.$id === task.assigneeId,
                );

                return {
                    ...task,
                    project,
                    assignee,
                };
            });

            return c.json({ data: populatedTasks });
        }
    )
    .post(
        '/',
        sessionMiddleware,
        zValidator('json', createTaskSchema),
        async (c) => {
            const user = c.get('user');
            const databases = c.get('databases');
            const {
                name,
                status,
                workspaceId,
                projectId,
                dueDate,
                assigneeId,
            } = c.req.valid('json');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const highestPositionTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal('status', status),
                    Query.equal('workspaceId', workspaceId),
                    Query.orderAsc("position"),
                    Query.limit(1),
                ],
            );

            const newPosition =
                highestPositionTask.documents.length > 0
                    ? highestPositionTask.documents[0].position + 1000
                    : 1000;

            const task = await databases.createDocument(
                DATABASE_ID,
                TASKS_ID,
                ID.unique(),
                {
                    name,
                    status,
                    workspaceId,
                    projectId,
                    dueDate,
                    assigneeId,
                    position: newPosition,
                },
            );

            return c.json({ data: task });
        }
    );

export default app;
