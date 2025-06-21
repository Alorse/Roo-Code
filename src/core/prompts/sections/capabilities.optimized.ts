import { DiffStrategy } from "../../../shared/tools"
import { McpHub } from "../../../services/mcp/McpHub"
import { CodeIndexManager } from "../../../services/code-index/manager"

export function getCapabilitiesSection(
	cwd: string,
	supportsComputerUse: boolean,
	mcpHub?: McpHub,
	diffStrategy?: DiffStrategy,
	codeIndexManager?: CodeIndexManager,
): string {
	return `====

CAPABILITIES

- Core tools: execute CLI commands, list/read/write files, regex search, list_code_definition_names, read_file, and ask follow‑ups${supportsComputerUse ? ", plus browser_action" : ""}.
- Startup context: you receive a recursive listing of '${cwd}'. Use list_files for other paths (set recursive as needed).
${
	codeIndexManager &&
	codeIndexManager.isFeatureEnabled &&
	codeIndexManager.isFeatureConfigured &&
	codeIndexManager.isInitialized
		? "- codebase_search lets you run semantic queries across the indexed codebase."
		: ""
}
- Workflow: combine search_files (regex), list_code_definition_names (symbols), read_file, and ${diffStrategy ? "apply_diff / write_to_file" : "write_to_file"} to analyse, edit, and refactor code safely.
- execute_command runs any CLI in a fresh VSCode terminal; always explain what the command does. Interactive or long‑running commands are allowed.
${supportsComputerUse ? "- browser_action opens a Puppeteer‑controlled browser to navigate pages (local or remote), interact, and capture screenshots/logs—ideal for verifying web work." : ""}
${mcpHub ? "- MCP servers provide extra tools you can leverage as needed." : ""}
`
}
