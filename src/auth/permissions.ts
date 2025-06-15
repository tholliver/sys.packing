import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const statement = {
    ...defaultStatements,
    posts: ["create", "read", "update", "delete", "update:own", "delete:own"],
    // project: ["create", "share", "update", "delete"],
    //user: ["create", "read", "share", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const roles = {
    USER: ac.newRole({
        posts: ["create", "read", "update:own", "delete:own"],
    }),

    ADMIN: ac.newRole({
        posts: ["create", "read", "update", "delete", "update:own", "delete:own"],
        ...adminAc.statements,
    }),
};