import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Check, ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { packageSchema, type PackageFormData } from "@/lib/validations"
import { useMutation } from "@/hooks/useDataFetch"
import { apiEndpoints } from "@/utils"

export default function SendPackagePage() {
    const [showMoreInfo, setShowMoreInfo] = useState(false)
    const [openDestinyPlace, setOpenDestinyPlace] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitSuccess, setSubmitSuccess] = useState(false)

    const cochabambaPlaces = [
        { id: 1, name: "Cercado" },
        { id: 2, name: "Quillacollo" },
        { id: 3, name: "Sacaba" },
    ]

    const packageTypes = [
        { value: "standard", label: "Estándar" },
        { value: "express", label: "Express" },
        { value: "fragile", label: "Frágil" },
        { value: "documents", label: "Documentos" },
    ]

    const priorities = [
        { value: "standard", label: "Estándar" },
        { value: "high", label: "Alta" },
        { value: "urgent", label: "Urgente" },
    ]

    const form = useForm<PackageFormData>({
        resolver: zodResolver(packageSchema),
        defaultValues: {
            description: "",
            senderFullName: "",
            senderCINIT: "",
            recipientFullName: "",
            recipientCINIT: "",
            phoneSender: "",
            phoneRecipient: "",
            senderPhone: "",
            recipientPhone: "",
            officeSenderAddress: "Oficina central",
            officeRecipientAddress: "",
            weight: "1",
            quantity: "",
            packageType: "standard" as const,
            priority: "standard" as const,
            isFragile: false,
            declaredValue: "1",
            totalCost: "",
            isPaid: false,
            deliveryNotes: "",
        },
    })

    const officeRecipientAddress = form.watch("officeRecipientAddress")
    const { mutate, loading: isLoading, error } = useMutation({ endpoint: apiEndpoints.packages.create })

    const onSubmit = async (data: PackageFormData) => {
        //form.setValue("createdBy", "")
        console.log("Form submission started")
        console.log("Form data:", data)

        // Clear previous states
        setSubmitError(null)
        setSubmitSuccess(false)

        try {
            const mutationResponse = await mutate(data)
            console.log("Package created successfully!", mutationResponse)
            if (!mutationResponse?.success) {
                setSubmitSuccess(true)
                form.reset()
            }

            // Reset form after successful submission

        } catch (error) {
            console.error("Form submission error:", error)
            const errorMessage = error instanceof Error ? error.message : "Error desconocido al crear el paquete"
            setSubmitError(errorMessage)
        }
    }

    const handleCancel = () => {
        console.log("Form cancelled, resetting...")
        form.reset()
        setSubmitError(null)
        setSubmitSuccess(false)
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Crear Paquete</h1>
                <p className="text-muted-foreground">Registra un nuevo paquete en el sistema</p>
            </div>

            {/* Success Message */}
            {submitSuccess && (
                <Alert className="mb-6 border-green-200 bg-green-50">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">¡Paquete creado exitosamente!</AlertDescription>
                </Alert>
            )}

            {/* Error Message */}
            {(submitError || error) && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">Error: {submitError || error}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Información del Paquete</CardTitle>
                    <CardDescription>Completa los datos del remitente y destinatario</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Descripción */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción del Paquete</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Describe el contenido del paquete..."
                                                disabled={isLoading}
                                                rows={3}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Datos del Remitente */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Datos del Remitente</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="senderFullName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombre Completo *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Nombre completo del remitente" disabled={isLoading} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="senderCINIT"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>CI/NIT</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Cédula o NIT del remitente" disabled={isLoading} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Datos del Destinatario */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Datos del Destinatario</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="recipientFullName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombre Completo *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Nombre completo del destinatario" disabled={isLoading} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="recipientCINIT"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>CI/NIT</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Cédula o NIT del destinatario" disabled={isLoading} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Direcciones de Oficinas */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Direcciones de Oficinas</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="officeSenderAddress"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Dirección Oficina Remitente *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Dirección completa de la oficina" disabled={true} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="officeRecipientAddress"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Lugar de Destino</FormLabel>
                                                <FormControl>
                                                    <Popover open={openDestinyPlace} onOpenChange={setOpenDestinyPlace}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={openDestinyPlace}
                                                                className="w-full justify-between"
                                                                disabled={isLoading}
                                                                type="button"
                                                            >
                                                                {officeRecipientAddress || "Seleccionar lugar de destino..."}
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-full p-0">
                                                            <Command>
                                                                <CommandInput placeholder="Buscar lugar..." className="h-9" />
                                                                <CommandList>
                                                                    <CommandEmpty>No se encontró ningún lugar.</CommandEmpty>
                                                                    <CommandGroup>
                                                                        {cochabambaPlaces.map((place) => (
                                                                            <CommandItem
                                                                                key={place.id}
                                                                                onSelect={() => {
                                                                                    form.setValue("officeRecipientAddress", place.name)
                                                                                    setOpenDestinyPlace(false)
                                                                                }}
                                                                            >
                                                                                {place.name}
                                                                                <Check
                                                                                    className={`ml-auto h-4 w-4 ${officeRecipientAddress === place.name ? "opacity-100" : "opacity-0"
                                                                                        }`}
                                                                                />
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Peso y Costo */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Detalles del Paquete</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="weight"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Peso (kg) *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="number" step="0.1" placeholder="0.0" disabled={isLoading} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="totalCost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Costo Total (Bs.) *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="number" step="0.01" placeholder="0.00" disabled={isLoading} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="isPaid"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Pagado</FormLabel>
                                                    <FormDescription className="text-xs">El paquete ya ha sido pagado</FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Información Adicional (Collapsible) */}
                            <Collapsible open={showMoreInfo} onOpenChange={setShowMoreInfo}>
                                <CollapsibleTrigger asChild>
                                    <Button variant="outline" type="button" className="w-full">
                                        <span>Información adicional</span>
                                        {showMoreInfo ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-6 mt-4">
                                    {/* Teléfonos */}
                                    <div className="space-y-4">
                                        <h4 className="text-md font-medium">Información de Contacto</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="phoneSender"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Teléfono del Remitente</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Número de teléfono" disabled={isLoading} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="phoneRecipient"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Teléfono del Destinatario</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Número de teléfono" disabled={isLoading} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Tipo y Prioridad */}
                                    <div className="space-y-4">
                                        <h4 className="text-md font-medium">Tipo y Prioridad</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="packageType"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Tipo de Paquete</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Seleccionar tipo" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {packageTypes.map((type) => (
                                                                    <SelectItem key={type.value} value={type.value}>
                                                                        {type.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="priority"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Prioridad</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Seleccionar prioridad" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {priorities.map((priority) => (
                                                                    <SelectItem key={priority.value} value={priority.value}>
                                                                        {priority.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Características Especiales */}
                                    <div className="space-y-4">
                                        <h4 className="text-md font-medium">Características Especiales</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="isFragile"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel>Paquete Frágil</FormLabel>
                                                            <FormDescription>Marcar si requiere manejo especial</FormDescription>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Valores adicionales */}
                                    <div className="space-y-4">
                                        <h4 className="text-md font-medium">Valores Adicionales</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="quantity"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Cantidad</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="number" placeholder="1" disabled={isLoading} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="declaredValue"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Valor Declarado (Bs.)</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="number" step="0.01" placeholder="0.00" disabled={isLoading} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Notas */}
                                    <FormField
                                        control={form.control}
                                        name="deliveryNotes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Notas de Entrega</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        placeholder="Instrucciones especiales para la entrega..."
                                                        disabled={isLoading}
                                                        rows={3}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CollapsibleContent>
                            </Collapsible>

                            {/* Form Actions */}
                            <div className="flex gap-4">
                                <Button type="submit" disabled={isLoading} className="flex-1">
                                    {isLoading ? "Creando..." : "Crear Paquete"}
                                </Button>
                                <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
