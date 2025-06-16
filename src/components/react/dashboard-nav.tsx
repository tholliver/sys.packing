import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Package, Send, Inbox, BarChart3, Menu, LogOut, Shield } from "lucide-react"
import { signOut, useSession } from "@/auth/auth-client"
import { toast } from "sonner"
import { ModeToggle } from "./mode-toggle"
import { NavUser } from "./nav-user"

const navigation = [
    { name: "Panel Principal", href: "/dashboard", icon: BarChart3 },
    { name: "Enviar Paquete", href: "/dashboard/send", icon: Send },
    { name: "Recibidos", href: "/dashboard/received", icon: Inbox },
    { name: "Enviados", href: "/dashboard/sent", icon: Package },
]

const adminNavigation = [{ name: "Panel de Administración", href: "/admin", icon: Shield }]

export function DashboardNav({ pathname }: {
    pathname: string
}) {
    const [isOpen, setIsOpen] = useState(false)
    const { data: session } = useSession()

    const handleSignOut = async () => {
        try {
            await signOut()
            toast("Sesión cerrada", {
                description: "Has cerrado sesión correctamente",
            })
            window.location.href = "/signin"
        } catch (error) {
            toast.error("Error", {
                description: "Error al cerrar sesión",
            })
        }
    }

    const allNavigation = [...navigation, ...(session?.user?.role === "admin" ? adminNavigation : [])]

    const NavItems = () => (
        <>
            {allNavigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                    <a
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                        onClick={() => setIsOpen(false)}
                    >
                        <Icon className="h-4 w-4" />
                        {item.name}
                    </a>
                )
            })}
        </>
    )

    return (
        <>
            {/* Mobile Navigation */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="md:hidden">
                        <Menu className="h-4 w-4" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                    <SheetHeader>
                        <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
                        <SheetDescription className="sr-only">
                            Menú principal de navegación con opciones de seguimiento de paquetes
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-2 px-3 py-4 border-b">
                            <Package className="h-6 w-6 text-primary" />
                            <span className="font-semibold">Seguimiento de Paquetes</span>
                        </div>
                        <nav className="flex-1 space-y-1 p-3">
                            <NavItems />
                        </nav>
                        <div className="p-3 border-t">
                            <ModeToggle />
                            <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleSignOut}>
                                <LogOut className="h-4 w-4" />
                                Cerrar Sesión
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                <div className="flex flex-col flex-grow bg-card border-r">
                    <div className="flex items-center gap-2 px-6 py-4 border-b">
                        <Package className="h-6 w-6 text-primary" />
                        <span className="font-semibold">Seguimiento de Paquetes</span>
                    </div>
                    <nav className="flex-1 space-y-1 p-4">
                        <NavItems />
                    </nav>
                    <div className="p-4 border-t">
                        {/* User Info */}
                        <NavUser
                            user={{
                                avatar: session?.user.image!,
                                email: session?.user.email!,
                                name: session?.user.name!
                            }} />
                        <div className="mb-4 text-sm text-muted-foreground">
                            {session?.user?.role === "ADMIN" && (
                                <span className="flex flex-row justify-between ml-2 text-xs px-2 py-0.5 rounded">
                                    <p>
                                        Rol:
                                    </p>
                                    <p>
                                        Admin
                                    </p>
                                </span>
                            )}
                        </div>

                        {/* Logout Button */}
                        {/*   <Button
                            variant="ghost"
                            className="w-full justify-start gap-3"
                            onClick={handleSignOut}
                        >
                            <LogOut className="h-4 w-4" />
                            Cerrar Sesión
                        </Button> */}
                    </div>
                </div>
            </div>
        </>
    )
}
