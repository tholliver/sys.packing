import { useSession } from "@/auth/auth-client"
import { PackageList } from "@/components/react/package-list"

export default function ReceivedPackagesPage() {
    const { data: session } = useSession()
    if (!session) return null

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Paquetes Recibidos</h1>
                <p className="text-muted-foreground">Ver los paquetes que te han enviado</p>
            </div>

            <PackageList type="received" userId={session.user.id} />
        </div>
    )
}
