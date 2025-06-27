import * as vscode from "vscode"
import { ClineProvider } from "../webview/ClineProvider"
import { singleCompletionHandler } from "../../utils/single-completion-handler"
import { t } from "../../i18n"

export class TerminalCommandInput {
	private static instance: TerminalCommandInput | undefined
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

	public static getInstance(context: vscode.ExtensionContext, clineProvider: ClineProvider): TerminalCommandInput {
		if (!TerminalCommandInput.instance) {
			TerminalCommandInput.instance = new TerminalCommandInput(context, clineProvider)
		}
		return TerminalCommandInput.instance
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

		this.statusBarItem.text = t("common:terminalCommand:statusBar.text", { shortcut })
		this.statusBarItem.tooltip = t("common:terminalCommand:statusBar.tooltip")
		this.statusBarItem.command = "roo-cline.generateCommand"
		this.statusBarItem.show()
	}

	private updateVisibility(): void {
		const activeTerminal = vscode.window.activeTerminal

		// Show StatusBar only if there's an active terminal
		// Note: Even if panel is closed, user can still use ⌘K shortcut
		// and the command will be inserted when they open the terminal
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

	public async showInputBox(initialPrompt?: string): Promise<void> {
		// Dispose existing input box if any
		if (this.inputBox) {
			this.inputBox.dispose()
		}

		// Create a new input box that appears as an overlay
		this.inputBox = vscode.window.createInputBox()
		this.inputBox.title = t("common:terminalCommand:inputBox.title")
		this.inputBox.placeholder = t("common:terminalCommand:inputBox.placeholder")

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
			vscode.window.showErrorMessage(t("common:terminalCommand:errors.noActiveTerminal"))
			return
		}

		// Show progress indicator
		await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: t("common:terminalCommand:progress.generatingCommand"),
				cancellable: false,
			},
			async (progress) => {
				try {
					// Get the current API configuration
					const { apiConfiguration } = await this.clineProvider.getState()

					// Create a precise prompt for command generation
					const commandPrompt = `Generate ONLY the terminal command for the following request. If the command requires parameters, use clear placeholders in ALL CAPS (e.g., FILENAME, DIRECTORY, PORT) instead of example values. Do NOT include explanations, markdown, code blocks, or any extra text—just the raw, executable command with placeholders if needed.

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
							vscode.window.showInformationMessage(
								t("common:terminalCommand:info.commandGenerated", { command: cleanCommand }),
							)
						} else {
							vscode.window.showErrorMessage(t("common:terminalCommand:errors.couldNotExtractCommand"))
						}
					} else {
						vscode.window.showErrorMessage(t("common:terminalCommand:errors.failedToGenerate"))
					}
				} catch (error) {
					console.error("Error generating command:", error)
					vscode.window.showErrorMessage(
						t("common:terminalCommand:errors.generationError", {
							message:
								error instanceof Error
									? error.message
									: t("common:terminalCommand:errors.unknownError"),
						}),
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
		TerminalCommandInput.instance = undefined
	}
}
