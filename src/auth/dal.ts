import type { APIContext } from "astro";
import { auth } from ".";

export async function getSession(request: Request) {
    return await auth.api.getSession({
        headers: request.headers,
    });
}

export const verifySession = async (request: Request) => {
    const session = await auth.api.getSession({
        headers: request.headers,
    })

    if (!session) return null
    return session
}

export async function requireAuth(context: APIContext) {
    const session = await getSession(context.request);

    if (!session) {
        throw new Error("Authentication required");
    }

    return session;
}

export const requireAdmin = async (context: APIContext) => {
    const session = await requireAuth(context)
    if (session.user.role !== "admin") {
        throw new Error("Se requiere acceso de administrador")
    }
    return session
}

/* export async function requirePermission(
    context: APIContext,
    permission: Permission
) {
    const session = await requireAuth(context);
    const userRole = session.user.role as Role;

    if (!hasPermission(userRole, permission)) {
        throw new Error(`Permission denied: ${permission}`);
    }

    return session;
}

export async function requireAnyPermission(
    context: APIContext,
    permissions: Permission[]
) {
    const session = await requireAuth(context);
    const userRole = session.user.role as Role;

    const hasAny = permissions.some(permission =>
        hasPermission(userRole, permission)
    );

    if (!hasAny) {
        throw new Error(`Permission denied: requires one of ${permissions.join(', ')}`);
    }

    return session;
} */