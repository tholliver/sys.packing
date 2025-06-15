import { authClient, useSession } from "@/auth/auth-client"
//import { verifySession } from "@/auth/dal"
import { PackageList } from "@/components/react/package-list"

export default function SentPackagesPage() {
    // const session = await verifySession()
    const { data: session } = useSession()
    if (!session) return null

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Paquetes Enviados</h1>
                <p className="text-muted-foreground">Ver y gestionar los paquetes que has enviado</p>
            </div>

            <PackageList type="sent" userId={session.user.id} />
        </div>
    )
}
