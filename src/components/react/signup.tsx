import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package, RotateCcwKey, ServerCrash, X } from "lucide-react"
import { toast } from "sonner"
import { signUp } from "@/auth/auth-client"

export default function SignUpPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error("Error", {
                description: "Passwords do not match",
                icon: <RotateCcwKey />
            })
            return
        }

        setIsLoading(true)

        try {
            const result = await signUp.email({
                email,
                password,
                name,
                role: "USER",
                callbackURL: "/dashboard"
            },)

            if (result.error) {
                toast.error("Error", {
                    description: result.error.message,
                    icon: <X />
                })
            } else {
                toast.success("Success", {
                    description: "Account created successfully",
                })
                window.location.href = "/dashboard"
            }
        } catch (error) {
            toast.error("Error", {
                description: "An unexpected error occurred",
                icon: <ServerCrash />
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Package className="h-12 w-12 text-blue-600" />
                    </div>
                    <CardTitle>Registrarse</CardTitle>
                    <CardDescription>Crea tu cuenta para comenzar</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                minLength={6}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Creando cuenta..." : "Registrarse"}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        ¿Ya tienes una cuenta?{" "}
                        <a href="/signin" className="text-blue-600 hover:underline">
                            Inicia sesión
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
