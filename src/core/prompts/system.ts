import * as vscode from "vscode"
import * as os from "os"

import type { ModeConfig, PromptComponent, CustomModePrompts } from "@roo-code/types"

import { Mode, modes, defaultModeSlug, getModeBySlug, getGroupName, getModeSelection } from "../../shared/modes"
import { DiffStrategy } from "../../shared/tools"
import { formatLanguage } from "../../shared/language"

import { McpHub } from "../../services/mcp/McpHub"
import { CodeIndexManager } from "../../services/code-index/manager"

import { PromptVariables, loadSystemPromptFile } from "./sections/custom-system-prompt"

import { getToolDescriptionsForMode } from "./tools"
import {
	getRulesSection,
	getSystemInfoSection,
	getObjectiveSection,
	getSharedToolUseSection,
	getMcpServersSection,
	getToolUseGuidelinesSection,
	getCapabilitiesSection,
	getModesSection,
	addCustomInstructions,
	markdownFormattingSection,
} from "./sections"

async function generatePrompt(
	context: vscode.ExtensionContext,
	cwd: string,
	supportsComputerUse: boolean,
	mode: Mode,
	mcpHub?: McpHub,
	diffStrategy?: DiffStrategy,
	browserViewportSize?: string,
	promptComponent?: PromptComponent,
	customModeConfigs?: ModeConfig[],
	globalCustomInstructions?: string,
	diffEnabled?: boolean,
	experiments?: Record<string, boolean>,
	enableMcpServerCreation?: boolean,
	language?: string,
	rooIgnoreInstructions?: string,
	partialReadsEnabled?: boolean,
	settings?: Record<string, any>,
	systemPromptSettings?: any,
): Promise<string> {
	if (!context) {
		throw new Error("Extension context is required for generating system prompt")
	}

	// If diff is disabled, don't pass the diffStrategy
	const effectiveDiffStrategy = diffEnabled ? diffStrategy : undefined

	// Get the full mode config to ensure we have the role definition (used for groups, etc.)
	const modeConfig = getModeBySlug(mode, customModeConfigs) || modes.find((m) => m.slug === mode) || modes[0]
	const { roleDefinition, baseInstructions } = getModeSelection(mode, promptComponent, customModeConfigs)

	const [modesSection, mcpServersSection] = await Promise.all([
		getModesSection(context),
		modeConfig.groups.some((groupEntry) => getGroupName(groupEntry) === "mcp")
			? getMcpServersSection(mcpHub, effectiveDiffStrategy, enableMcpServerCreation)
			: Promise.resolve(""),
	])

	const codeIndexManager = CodeIndexManager.getInstance(context)

	// Default system prompt settings (all enabled by default)
	const defaultSettings = {
		markdownFormattingEnabled: true,
		toolUseEnabled: true,
		toolUseGuidelinesEnabled: true,
		mcpServersEnabled: true,
		capabilitiesEnabled: true,
		modesEnabled: true,
		rulesEnabled: true,
		systemInfoEnabled: true,
		objectiveEnabled: true,
		customInstructionsEnabled: true,
	}

	const promptSettings = { ...defaultSettings, ...systemPromptSettings }

	// Build prompt sections conditionally based on settings
	let promptSections = [`${roleDefinition}`]

	if (promptSettings.markdownFormattingEnabled) {
		promptSections.push(markdownFormattingSection())
	}

	if (promptSettings.toolUseEnabled) {
		promptSections.push(getSharedToolUseSection())
		promptSections.push(
			getToolDescriptionsForMode(
				mode,
				cwd,
				supportsComputerUse,
				codeIndexManager,
				effectiveDiffStrategy,
				browserViewportSize,
				mcpHub,
				customModeConfigs,
				experiments,
				partialReadsEnabled,
				settings,
			),
		)
	}

	if (promptSettings.toolUseGuidelinesEnabled) {
		promptSections.push(getToolUseGuidelinesSection(codeIndexManager))
	}

	if (promptSettings.mcpServersEnabled) {
		promptSections.push(mcpServersSection)
	}

	if (promptSettings.capabilitiesEnabled) {
		promptSections.push(
			getCapabilitiesSection(cwd, supportsComputerUse, mcpHub, effectiveDiffStrategy, codeIndexManager),
		)
	}

	if (promptSettings.modesEnabled) {
		promptSections.push(modesSection)
	}

	if (promptSettings.rulesEnabled) {
		promptSections.push(getRulesSection(cwd, supportsComputerUse, effectiveDiffStrategy, codeIndexManager))
	}

	if (promptSettings.systemInfoEnabled) {
		promptSections.push(getSystemInfoSection(cwd))
	}

	if (promptSettings.objectiveEnabled) {
		promptSections.push(getObjectiveSection(codeIndexManager, experiments))
	}

	if (promptSettings.customInstructionsEnabled) {
		promptSections.push(
			await addCustomInstructions(baseInstructions, globalCustomInstructions || "", cwd, mode, {
				language: language ?? formatLanguage(vscode.env.language),
				rooIgnoreInstructions,
			}),
		)
	}

	const basePrompt = promptSections.filter((section) => section && section.trim()).join("\n\n")

	console.log("promptSettings.markdownFormattingEnabled", promptSettings.markdownFormattingEnabled)
	console.log("promptSettings.toolUseEnabled", promptSettings.toolUseEnabled)
	console.log("systemPromptSettings", systemPromptSettings)
	console.log("Generated system prompt:", basePrompt)

	return basePrompt
}

export const SYSTEM_PROMPT = async (
	context: vscode.ExtensionContext,
	cwd: string,
	supportsComputerUse: boolean,
	mcpHub?: McpHub,
	diffStrategy?: DiffStrategy,
	browserViewportSize?: string,
	mode: Mode = defaultModeSlug,
	customModePrompts?: CustomModePrompts,
	customModes?: ModeConfig[],
	globalCustomInstructions?: string,
	diffEnabled?: boolean,
	experiments?: Record<string, boolean>,
	enableMcpServerCreation?: boolean,
	language?: string,
	rooIgnoreInstructions?: string,
	partialReadsEnabled?: boolean,
	settings?: Record<string, any>,
	systemPromptSettings?: any,
): Promise<string> => {
	if (!context) {
		throw new Error("Extension context is required for generating system prompt")
	}

	const getPromptComponent = (value: unknown) => {
		if (typeof value === "object" && value !== null) {
			return value as PromptComponent
		}
		return undefined
	}

	// Try to load custom system prompt from file
	const variablesForPrompt: PromptVariables = {
		workspace: cwd,
		mode: mode,
		language: language ?? formatLanguage(vscode.env.language),
		shell: vscode.env.shell,
		operatingSystem: os.type(),
	}
	const fileCustomSystemPrompt = await loadSystemPromptFile(cwd, mode, variablesForPrompt)

	// Check if it's a custom mode
	const promptComponent = getPromptComponent(customModePrompts?.[mode])

	// Get full mode config from custom modes or fall back to built-in modes
	const currentMode = getModeBySlug(mode, customModes) || modes.find((m) => m.slug === mode) || modes[0]

	// If a file-based custom system prompt exists, use it
	if (fileCustomSystemPrompt) {
		const { roleDefinition, baseInstructions: baseInstructionsForFile } = getModeSelection(
			mode,
			promptComponent,
			customModes,
		)

		const customInstructions = await addCustomInstructions(
			baseInstructionsForFile,
			globalCustomInstructions || "",
			cwd,
			mode,
			{ language: language ?? formatLanguage(vscode.env.language), rooIgnoreInstructions },
		)

		// For file-based prompts, don't include the tool sections
		return `${roleDefinition}

${fileCustomSystemPrompt}

${customInstructions}`
	}

	// If diff is disabled, don't pass the diffStrategy
	const effectiveDiffStrategy = diffEnabled ? diffStrategy : undefined

	return generatePrompt(
		context,
		cwd,
		supportsComputerUse,
		currentMode.slug,
		mcpHub,
		effectiveDiffStrategy,
		browserViewportSize,
		promptComponent,
		customModes,
		globalCustomInstructions,
		diffEnabled,
		experiments,
		enableMcpServerCreation,
		language,
		rooIgnoreInstructions,
		partialReadsEnabled,
		settings,
		systemPromptSettings,
	)
}
