import * as vscode from "vscode"
import { ClineProvider } from "../webview/ClineProvider"
import { singleCompletionHandler } from "../../utils/single-completion-handler"

export class TerminalInlineChat {
	private static instance: TerminalInlineChat | undefined
	private statusBarItem: vscode.StatusBarItem | undefined
	private inputBox: vscode.InputBox | undefined
	private clineProvider: ClineProvider

	constructor(
		private context: vscode.ExtensionContext,
		clineProvider: ClineProvider,
	) {
		this.clineProvider = clineProvider

		// Don't create status bar item immediately - only when terminal is active
		this.updateVisibility()

		// Listen for terminal changes
		vscode.window.onDidChangeActiveTerminal(() => {
			this.updateVisibility()
		})

		// Listen for terminal close events
		vscode.window.onDidCloseTerminal(() => {
			this.updateVisibility()
		})

		vscode.window.onDidChangeWindowState(() => {
			this.updateVisibility()
		})
	}

	public static getInstance(context: vscode.ExtensionContext, clineProvider: ClineProvider): TerminalInlineChat {
		if (!TerminalInlineChat.instance) {
			TerminalInlineChat.instance = new TerminalInlineChat(context, clineProvider)
		}
		return TerminalInlineChat.instance
	}

	private setupStatusBarItem(): void {
		if (!this.statusBarItem) {
			this.statusBarItem = vscode.window.createStatusBarItem(
				vscode.StatusBarAlignment.Right,
				100, // Priority
			)
		}

		const isMac = process.platform === "darwin"
		const shortcut = isMac ? "⌘K" : "Ctrl+K"

		this.statusBarItem.text = `$(terminal) ${shortcut} to generate command`
		this.statusBarItem.tooltip = "Generate terminal command with AI"
		this.statusBarItem.command = "roo-cline.generateCommand"
		this.statusBarItem.show()
	}

	private updateVisibility(): void {
		const activeTerminal = vscode.window.activeTerminal
		if (activeTerminal) {
			// Create and show status bar item only when terminal is active
			if (!this.statusBarItem) {
				this.setupStatusBarItem()
			} else {
				this.statusBarItem.show()
			}
		} else {
			// Hide and dispose status bar item when no terminal is active
			if (this.statusBarItem) {
				this.statusBarItem.dispose()
				this.statusBarItem = undefined
			}
		}
	}

	public async showInlineChat(initialPrompt?: string): Promise<void> {
		// Dispose existing input box if any
		if (this.inputBox) {
			this.inputBox.dispose()
		}

		// Create a new input box that appears as an overlay
		this.inputBox = vscode.window.createInputBox()
		this.inputBox.title = "Generate Terminal Command"
		this.inputBox.placeholder = "Command instructions (e.g., 'List files in current directory')"

		// Set initial value if provided
		if (initialPrompt) {
			this.inputBox.value = initialPrompt
		}

		// Configure the input box
		this.inputBox.ignoreFocusOut = false

		// Handle input acceptance
		this.inputBox.onDidAccept(async () => {
			const command = this.inputBox!.value.trim()
			if (command) {
				await this.handleCommandSubmit(command)
			}
			this.inputBox!.dispose()
			this.inputBox = undefined
		})

		// Handle input cancellation
		this.inputBox.onDidHide(() => {
			if (this.inputBox) {
				this.inputBox.dispose()
				this.inputBox = undefined
			}
		})

		// Show the input box
		this.inputBox.show()
	}

	private async handleCommandSubmit(command: string): Promise<void> {
		const activeTerminal = vscode.window.activeTerminal
		if (!activeTerminal) {
			vscode.window.showErrorMessage("No active terminal found")
			return
		}

		// Show progress indicator
		await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: "Generating command...",
				cancellable: false,
			},
			async (progress) => {
				try {
					// Get the current API configuration
					const { apiConfiguration } = await this.clineProvider.getState()

					// Create a precise prompt for command generation
					const commandPrompt = `Generate ONLY the terminal command for this request. Return just the raw command with no explanations, no markdown, no additional text, no code blocks. Just the executable command:

${command}

Command:`

					// Call the API directly to generate the command
					const generatedCommand = await singleCompletionHandler(apiConfiguration, commandPrompt)

					if (generatedCommand && generatedCommand.trim()) {
						// Clean up the response (remove any potential markdown or extra text)
						const cleanCommand = this.extractCommand(generatedCommand)

						if (cleanCommand) {
							// Insert the command into the active terminal
							activeTerminal.sendText(cleanCommand, false) // false = don't execute immediately
							vscode.window.showInformationMessage(`Command generated: ${cleanCommand}`)
						} else {
							vscode.window.showErrorMessage("Could not extract a valid command from the response")
						}
					} else {
						vscode.window.showErrorMessage("Failed to generate command")
					}
				} catch (error) {
					console.error("Error generating command:", error)
					vscode.window.showErrorMessage(
						`Error generating command: ${error instanceof Error ? error.message : "Unknown error"}`,
					)
				}
			},
		)
	}

	private extractCommand(text: string): string | null {
		// Remove markdown code blocks
		let command = text.replace(/```[\s\S]*?```/g, "").trim()

		// Remove common prefixes
		command = command.replace(/^(Command:|Here's the command:|The command is:|Generated command:)/i, "").trim()

		// Take only the first line if multiple lines
		const lines = command.split("\n")
		command = lines[0].trim()

		// Basic validation - should look like a command
		if (
			command &&
			command.length > 0 &&
			!command.includes("I ") &&
			!command.includes("You ") &&
			!command.includes("Here")
		) {
			return command
		}

		return null
	}

	public dispose(): void {
		this.statusBarItem?.dispose()
		this.inputBox?.dispose()
		TerminalInlineChat.instance = undefined
	}
}
