<<<<<<< HEAD
import type { Anthropic } from "@anthropic-ai/sdk"

=======
>>>>>>> 4fa735de3 (feat: add Claude Code provider for local CLI integration (#4864))
type InitMessage = {
	type: "system"
	subtype: "init"
	session_id: string
	tools: string[]
	mcp_servers: string[]
<<<<<<< HEAD
	apiKeySource: "none" | "/login managed key" | string
=======
}

type ClaudeCodeContent = {
	type: "text"
	text: string
>>>>>>> 4fa735de3 (feat: add Claude Code provider for local CLI integration (#4864))
}

type AssistantMessage = {
	type: "assistant"
<<<<<<< HEAD
	message: Anthropic.Messages.Message
=======
	message: {
		id: string
		type: "message"
		role: "assistant"
		model: string
		content: ClaudeCodeContent[]
		stop_reason: string | null
		stop_sequence: null
		usage: {
			input_tokens: number
			cache_creation_input_tokens?: number
			cache_read_input_tokens?: number
			output_tokens: number
			service_tier: "standard"
		}
	}
>>>>>>> 4fa735de3 (feat: add Claude Code provider for local CLI integration (#4864))
	session_id: string
}

type ErrorMessage = {
	type: "error"
}

type ResultMessage = {
	type: "result"
	subtype: "success"
<<<<<<< HEAD
	total_cost_usd: number
=======
	cost_usd: number
>>>>>>> 4fa735de3 (feat: add Claude Code provider for local CLI integration (#4864))
	is_error: boolean
	duration_ms: number
	duration_api_ms: number
	num_turns: number
	result: string
<<<<<<< HEAD
=======
	total_cost: number
>>>>>>> 4fa735de3 (feat: add Claude Code provider for local CLI integration (#4864))
	session_id: string
}

export type ClaudeCodeMessage = InitMessage | AssistantMessage | ErrorMessage | ResultMessage
