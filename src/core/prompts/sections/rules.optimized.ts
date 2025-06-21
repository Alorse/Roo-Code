import { DiffStrategy } from "../../../shared/tools"
import { CodeIndexManager } from "../../../services/code-index/manager"

function getEditingInstructions(diffStrategy?: DiffStrategy): string {
	const tools: string[] = diffStrategy
		? ["apply_diff (replace lines in existing files)", "write_to_file (new files or full rewrites)"]
		: ["write_to_file (new files or full rewrites)"]

	tools.push("insert_content (append/insert lines)")
	tools.push("search_and_replace (regex/text find & replace, multi‑op)")

	const lines: string[] = []
	lines.push(`- Editing tools: ${tools.join(", ")}.`)
	lines.push(
		"- insert_content adds lines at a given line number (0 = append). Use for code inserts like new functions or routes.",
	)
	lines.push("- search_and_replace swaps text/regex safely; craft patterns carefully.")
	if (diffStrategy) {
		lines.push(
			"- Prefer other tools over write_to_file when patching existing files; write_to_file is slower and unsuitable for large files.",
		)
	}
	lines.push(
		"- When using write_to_file, include the **complete file**—no placeholders or partial snippets. Omitting unchanged code is forbidden.",
	)

	return lines.join("\n")
}

export function getRulesSection(
	cwd: string,
	supportsComputerUse: boolean,
	diffStrategy?: DiffStrategy,
	codeIndexManager?: CodeIndexManager,
): string {
	const hasCodeSearch =
		codeIndexManager?.isFeatureEnabled && codeIndexManager?.isFeatureConfigured && codeIndexManager?.isInitialized
	const codeSearchRule = hasCodeSearch
		? "- **CRITICAL:** use `codebase_search` *before* search_files or other exploration tools when you need to understand existing code.\n"
		: ""

	return `====

RULES

- Base dir: ${cwd.toPosix()}. Paths must stay relative. You cannot cd elsewhere (except via "cd <dir> && cmd" inside execute_command).
- Before execute_command: review SYSTEM INFORMATION, decide if cd is needed, then run as one combined command.
${codeSearchRule}- When using search_files${hasCodeSearch ? " (after codebase_search)" : ""}, craft precise regex; inspect context via read_file before ${diffStrategy ? "apply_diff/write_to_file" : "write_to_file"}.
- New projects: place files in a dedicated directory unless specified; ensure runnable out‑of‑the‑box.
${getEditingInstructions(diffStrategy)}
- Restricted modes: editing disallowed patterns triggers FileRestrictionError.
- Respect project conventions; keep compatibility.
- ask_followup_question only for required missing params; include 2‑4 actionable suggestions.
- Assume execute_command success if output absent; request paste only if critical.
- Skip read_file when user already pasted content.
- Focus on completing the task, not chatting.
${supportsComputerUse ? "- For generic look‑ups (news, weather, etc.) prefer browser_action—or MCP tools if available." : ""}
- attempt_completion must end definitively—no questions, and never start with "Great", "Certainly", etc.
- Use vision features when images are provided.
- Use environment_details for context; it's auto‑generated, not a direct user request.
- Check Actively Running Terminals before starting or duplicating processes.
- Operate MCP tools one at a time, waiting for success.
- After each tool call, wait for confirmation; if testing a web app, use browser_action with screenshots & confirmations before further steps.${supportsComputerUse ? "" : ""}
`
}
