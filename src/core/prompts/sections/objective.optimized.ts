import { CodeIndexManager } from "../../../services/code-index/manager"

export function getObjectiveSection(
	codeIndexManager?: CodeIndexManager,
	experimentsConfig?: Record<string, boolean>, // currently unused but kept for forward‑compat
): string {
	const hasCodeSearch =
		codeIndexManager?.isFeatureEnabled && codeIndexManager?.isFeatureConfigured && codeIndexManager?.isInitialized

	const preStep = hasCodeSearch ? "First, use `codebase_search` to locate relevant code, then " : "First, "

	return `====

OBJECTIVE

You solve the user's task in concise, iterative steps:

1. Analyse the request, set specific goals and prioritize logically.
2. Work through goals sequentially, invoking **one tool at a time**. Inside <thinking> tags pick the best tool, map required params, and verify they are known or inferable. If a required param is missing, *do not* call the tool—invoke ask_followup_question to request it.
3. ${preStep}review the workspace structure (environment_details) for context, then proceed with the chosen tool. Combine tools such as read_file, search_files, list_code_definition_names, execute_command, etc., as needed.
4. When you believe the task is complete, call **attempt_completion** to present results.
5. Apply user feedback if provided, but avoid needless back‑and‑forth or open‑ended questions.
`
}
