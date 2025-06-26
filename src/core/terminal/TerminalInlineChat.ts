import * as vscode from "vscode"
import { ClineProvider } from "../webview/ClineProvider"

export class TerminalInlineChat {
	private static instance: TerminalInlineChat | undefined
	private statusBarItem: vscode.StatusBarItem
	private inputBox: vscode.InputBox | undefined
	private clineProvider: ClineProvider

	constructor(
		private context: vscode.ExtensionContext,
		clineProvider: ClineProvider,
	) {
		this.clineProvider = clineProvider

		// Create status bar item
		this.statusBarItem = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Right,
			100, // Priority
		)

		this.setupStatusBarItem()
	}

	public static getInstance(context: vscode.ExtensionContext, clineProvider: ClineProvider): TerminalInlineChat {
		if (!TerminalInlineChat.instance) {
			TerminalInlineChat.instance = new TerminalInlineChat(context, clineProvider)
		}
		return TerminalInlineChat.instance
	}

	private setupStatusBarItem(): void {
		const isMac = process.platform === "darwin"
		const shortcut = isMac ? "⌘K" : "Ctrl+K"

		this.statusBarItem.text = `$(terminal) ${shortcut} to generate command`
		this.statusBarItem.tooltip = "Generate terminal command with AI"
		this.statusBarItem.command = "roo-cline.generateCommand"

		// Show only when terminal is active
		this.updateVisibility()

		// Listen for active editor changes to show/hide
		vscode.window.onDidChangeActiveTerminal(() => {
			this.updateVisibility()
		})

		vscode.window.onDidChangeWindowState(() => {
			this.updateVisibility()
		})
	}

	private updateVisibility(): void {
		const activeTerminal = vscode.window.activeTerminal
		if (activeTerminal) {
			this.statusBarItem.show()
		} else {
			this.statusBarItem.hide()
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

		// Create a precise prompt for command generation
		const commandPrompt = `Generate ONLY the terminal command for this request, no explanations, no markdown, no additional text. Just the raw command that can be executed directly:

${command}

Command:`

		// Send the prompt directly to the chat
		await this.clineProvider.postMessageToWebview({
			type: "invoke",
			invoke: "setChatBoxMessage",
			text: commandPrompt,
		})

		// Show a message to the user
		vscode.window.showInformationMessage(
			"Command request sent to Roo Code chat. The generated command will appear in the chat.",
		)
	}

	public dispose(): void {
		this.statusBarItem.dispose()
		this.inputBox?.dispose()
		TerminalInlineChat.instance = undefined
	}
}
