import { cn } from "@/lib/utils"

export const ToolUseBlock = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />

export const ToolUseBlockHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		style={{ fontWeight: "300", fontSize: "var(--text-sm)" }}
		className={cn("flex items-center select-pointer", className)}
		{...props}
	/>
)
