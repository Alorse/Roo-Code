import type { Experiments } from "@roo-code/types"

// Import all sections statically
import * as capabilities from "./capabilities"
import * as capabilitiesOptimized from "./capabilities.optimized"
import * as customInstructions from "./custom-instructions"
import * as customSystemPrompt from "./custom-system-prompt"
import * as markdownFormatting from "./markdown-formatting"
import * as mcpServers from "./mcp-servers"
import * as modes from "./modes"
import * as objective from "./objective"
import * as objectiveOptimized from "./objective.optimized"
import * as rules from "./rules"
import * as rulesOptimized from "./rules.optimized"
import * as systemInfo from "./system-info"
import * as systemInfoOptimized from "./system-info.optimized"
import * as toolUse from "./tool-use"
import * as toolUseOptimized from "./tool-use.optimized"
import * as toolUseGuidelines from "./tool-use-guidelines"
import * as toolUseGuidelinesOptimized from "./tool-use-guidelines.optimized"

// Map of section names to their modules
const sectionMap: Record<string, any> = {
	capabilities: capabilities,
	"capabilities.optimized": capabilitiesOptimized,
	"custom-instructions": customInstructions,
	"custom-system-prompt": customSystemPrompt,
	"markdown-formatting": markdownFormatting,
	"mcp-servers": mcpServers,
	modes: modes,
	objective: objective,
	"objective.optimized": objectiveOptimized,
	rules: rules,
	"rules.optimized": rulesOptimized,
	"system-info": systemInfo,
	"system-info.optimized": systemInfoOptimized,
	"tool-use": toolUse,
	"tool-use.optimized": toolUseOptimized,
	"tool-use-guidelines": toolUseGuidelines,
	"tool-use-guidelines.optimized": toolUseGuidelinesOptimized,
}

/**
 * Dynamically loads prompt sections based on experimental features.
 * If optimizedPromptFeatures is enabled, loads .optimized.ts files,
 * otherwise loads the standard .ts files.
 *
 * This function provides a clean way to switch between optimized and standard
 * prompt sections without breaking compatibility with the main codebase.
 */
export function loadPromptSection(experiments: Experiments | undefined, sectionName: string): any {
	const useOptimized = experiments?.optimizedPromptFeatures === true

	try {
		if (useOptimized) {
			// Try to load optimized version first
			const optimizedKey = `${sectionName}.optimized`
			if (sectionMap[optimizedKey]) {
				return sectionMap[optimizedKey]
			}
		}

		// Load standard version or fallback
		if (sectionMap[sectionName]) {
			return sectionMap[sectionName]
		}

		// If we couldn't find the requested section, try the opposite
		if (useOptimized && sectionMap[sectionName]) {
			console.warn(`Optimized version of ${sectionName} not found, falling back to standard version`)
			return sectionMap[sectionName]
		} else if (!useOptimized && sectionMap[`${sectionName}.optimized`]) {
			console.warn(`Standard version of ${sectionName} not found, falling back to optimized version`)
			return sectionMap[`${sectionName}.optimized`]
		}

		throw new Error(`Unable to load prompt section: ${sectionName}`)
	} catch (error) {
		console.error(`Failed to load prompt section ${sectionName}:`, error)
		throw error
	}
}
