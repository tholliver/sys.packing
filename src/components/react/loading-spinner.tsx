import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg"
    className?: string
    text?: string
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
    }

    return (
        <div className={cn("flex items-center justify-center", className)}>
            <div className="flex flex-col items-center gap-2">
                <Loader2 className={cn("animate-spin", sizeClasses[size])} />
                {text && <p className="text-sm text-muted-foreground">{text}</p>}
            </div>
        </div>
    )
}

export function LoadingOverlay({ text = "Cargando..." }: { text?: string }) {
    return (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <LoadingSpinner size="lg" text={text} />
        </div>
    )
}
