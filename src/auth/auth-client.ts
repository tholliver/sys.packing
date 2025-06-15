import { createAuthClient } from 'better-auth/react';
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from '.';
import { ac, roles } from './permissions';

export const authClient = createAuthClient({
    plugins: [inferAdditionalFields<typeof auth>(),
    adminClient({ ac, roles })
    ],
}
);

export const { signIn, signUp, signOut, useSession } = authClient

export type Session = typeof authClient.$Infer.Session
export type User = typeof authClient.$Infer.Session.user
