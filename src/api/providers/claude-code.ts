import type { Anthropic } from "@anthropic-ai/sdk"
import { claudeCodeDefaultModelId, type ClaudeCodeModelId, claudeCodeModels } from "@roo-code/types"
import { type ApiHandler } from ".."
import { ApiStreamUsageChunk, type ApiStream } from "../transform/stream"
import { runClaudeCode } from "../../integrations/claude-code/run"
<<<<<<< HEAD
import { filterMessagesForClaudeCode } from "../../integrations/claude-code/message-filter"
=======
import { ClaudeCodeMessage } from "../../integrations/claude-code/types"
>>>>>>> 4fa735de3 (feat: add Claude Code provider for local CLI integration (#4864))
import { BaseProvider } from "./base-provider"
import { t } from "../../i18n"
import { ApiHandlerOptions } from "../../shared/api"

export class ClaudeCodeHandler extends BaseProvider implements ApiHandler {
	private options: ApiHandlerOptions

	constructor(options: ApiHandlerOptions) {
		super()
		this.options = options
	}

	override async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
<<<<<<< HEAD
		// Filter out image blocks since Claude Code doesn't support them
		const filteredMessages = filterMessagesForClaudeCode(messages)

		const claudeProcess = runClaudeCode({
			systemPrompt,
			messages: filteredMessages,
=======
		const claudeProcess = runClaudeCode({
			systemPrompt,
			messages,
>>>>>>> 4fa735de3 (feat: add Claude Code provider for local CLI integration (#4864))
			path: this.options.claudeCodePath,
			modelId: this.getModel().id,
		})

<<<<<<< HEAD
=======
		const dataQueue: string[] = []
		let processError = null
		let errorOutput = ""
		let exitCode: number | null = null

		claudeProcess.stdout.on("data", (data) => {
			const output = data.toString()
			const lines = output.split("\n").filter((line: string) => line.trim() !== "")

			for (const line of lines) {
				dataQueue.push(line)
			}
		})

		claudeProcess.stderr.on("data", (data) => {
			errorOutput += data.toString()
		})

		claudeProcess.on("close", (code) => {
			exitCode = code
		})

		claudeProcess.on("error", (error) => {
			processError = error
		})

>>>>>>> 4fa735de3 (feat: add Claude Code provider for local CLI integration (#4864))
		// Usage is included with assistant messages,
		// but cost is included in the result chunk
		let usage: ApiStreamUsageChunk = {
			type: "usage",
			inputTokens: 0,
			outputTokens: 0,
			cacheReadTokens: 0,
			cacheWriteTokens: 0,
		}

<<<<<<< HEAD
		let isPaidUsage = true

		for await (const chunk of claudeProcess) {
			if (typeof chunk === "string") {
				yield {
					type: "text",
					text: chunk,
=======
		while (exitCode !== 0 || dataQueue.length > 0) {
			if (dataQueue.length === 0) {
				await new Promise((resolve) => setImmediate(resolve))
			}

			if (exitCode !== null && exitCode !== 0) {
				if (errorOutput) {
					throw new Error(
						t("common:errors.claudeCode.processExitedWithError", {
							exitCode,
							output: errorOutput.trim(),
						}),
					)
				}
				throw new Error(t("common:errors.claudeCode.processExited", { exitCode }))
			}

			const data = dataQueue.shift()
			if (!data) {
				continue
			}

			const chunk = this.attemptParseChunk(data)

			if (!chunk) {
				yield {
					type: "text",
					text: data || "",
>>>>>>> 4fa735de3 (feat: add Claude Code provider for local CLI integration (#4864))
				}

				continue
			}

			if (chunk.type === "system" && chunk.subtype === "init") {
<<<<<<< HEAD
				// Based on my tests, subscription usage sets the `apiKeySource` to "none"
				isPaidUsage = chunk.apiKeySource !== "none"
=======
>>>>>>> 4fa735de3 (feat: add Claude Code provider for local CLI integration (#4864))
				continue
			}

			if (chunk.type === "assistant" && "message" in chunk) {
				const message = chunk.message

<<<<<<< HEAD
				if (message.stop_reason !== null) {
					const content = "text" in message.content[0] ? message.content[0] : undefined

					const isError = content && content.text.startsWith(`API Error`)
					if (isError) {
						// Error messages are formatted as: `API Error: <<status code>> <<json>>`
						const errorMessageStart = content.text.indexOf("{")
						const errorMessage = content.text.slice(errorMessageStart)

						const error = this.attemptParse(errorMessage)
						if (!error) {
							throw new Error(content.text)
						}

						if (error.error.message.includes("Invalid model name")) {
							throw new Error(
								content.text + `\n\n${t("common:errors.claudeCode.apiKeyModelPlanMismatch")}`,
							)
						}

						throw new Error(errorMessage)
					}
				}

				for (const content of message.content) {
					switch (content.type) {
						case "text":
							yield {
								type: "text",
								text: content.text,
							}
							break
						case "thinking":
							yield {
								type: "reasoning",
								text: content.thinking || "",
							}
							break
						case "redacted_thinking":
							yield {
								type: "reasoning",
								text: "[Redacted thinking block]",
							}
							break
						case "tool_use":
							console.error(`tool_use is not supported yet. Received: ${JSON.stringify(content)}`)
							break
=======
				if (message.stop_reason !== null && message.stop_reason !== "tool_use") {
					const errorMessage =
						message.content[0]?.text ||
						t("common:errors.claudeCode.stoppedWithReason", { reason: message.stop_reason })

					if (errorMessage.includes("Invalid model name")) {
						throw new Error(errorMessage + `\n\n${t("common:errors.claudeCode.apiKeyModelPlanMismatch")}`)
					}

					throw new Error(errorMessage)
				}

				for (const content of message.content) {
					if (content.type === "text") {
						yield {
							type: "text",
							text: content.text,
						}
					} else {
						console.warn("Unsupported content type:", content.type)
>>>>>>> 4fa735de3 (feat: add Claude Code provider for local CLI integration (#4864))
					}
				}

				usage.inputTokens += message.usage.input_tokens
				usage.outputTokens += message.usage.output_tokens
				usage.cacheReadTokens = (usage.cacheReadTokens || 0) + (message.usage.cache_read_input_tokens || 0)
				usage.cacheWriteTokens =
					(usage.cacheWriteTokens || 0) + (message.usage.cache_creation_input_tokens || 0)

				continue
			}

			if (chunk.type === "result" && "result" in chunk) {
<<<<<<< HEAD
				usage.totalCost = isPaidUsage ? chunk.total_cost_usd : 0

				yield usage
			}
=======
				// Only use the cost from the CLI if provided
				// Don't calculate cost as it may be $0 for subscription users
				usage.totalCost = chunk.cost_usd ?? 0

				yield usage
			}

			if (processError) {
				throw processError
			}
>>>>>>> 4fa735de3 (feat: add Claude Code provider for local CLI integration (#4864))
		}
	}

	getModel() {
		const modelId = this.options.apiModelId
		if (modelId && modelId in claudeCodeModels) {
			const id = modelId as ClaudeCodeModelId
			return { id, info: claudeCodeModels[id] }
		}

		return {
			id: claudeCodeDefaultModelId,
			info: claudeCodeModels[claudeCodeDefaultModelId],
		}
	}

<<<<<<< HEAD
	private attemptParse(str: string) {
		try {
			return JSON.parse(str)
		} catch (err) {
=======
	// TODO: Validate instead of parsing
	private attemptParseChunk(data: string): ClaudeCodeMessage | null {
		try {
			return JSON.parse(data)
		} catch (error) {
			console.error("Error parsing chunk:", error)
>>>>>>> 4fa735de3 (feat: add Claude Code provider for local CLI integration (#4864))
			return null
		}
	}
}
