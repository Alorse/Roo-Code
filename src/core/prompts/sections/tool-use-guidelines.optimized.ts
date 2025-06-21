import { CodeIndexManager } from "../../../services/code-index/manager"

export function getToolUseGuidelinesSection(codeIndexManager?: CodeIndexManager): string {
	const hasCodeSearch =
		codeIndexManager?.isFeatureEnabled && codeIndexManager?.isFeatureConfigured && codeIndexManager?.isInitialized
	const lines: string[] = []
	let n = 1
	lines.push(`${n++}. Inside <thinking>, evaluate what info you have and what you still need.`)
	if (hasCodeSearch) {
		lines.push(
			`${n++}. **Use \`codebase_search\` first** to understand existing code/functionality before any other search tool.`,
		)
	}
	lines.push(`${n++}. Pick the right tool for each step (e.g., list_files beats running \`ls\`).`)
	lines.push(`${n++}. Use one tool per message; let the previous result guide the next action.`)
	lines.push(`${n++}. Wrap tool calls in the required XML format.`)
	lines.push(
		`${n++}. After each tool use, the user returns the result (success/failure, linter errors, terminal output, etc.).`,
	)
	lines.push(`${n++}. **Wait for explicit user confirmation** before proceeding to the next action.`)

	return `# Tool Use Guidelines\n\n${lines.join("\n")}\n\nProceed step‑by‑step, confirming each result before moving on. This ensures accuracy, immediate error handling, and an adaptive workflow.`
}
