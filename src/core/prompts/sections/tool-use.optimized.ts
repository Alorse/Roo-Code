export function getSharedToolUseSection(): string {
	return `====

TOOL USE

You may call **one tool per message**. Each invocation must be confirmed by the user before you move on; their reply includes the output or any error.

# XML call format

<tool_name>
<param1>value</param1>
<param2>value</param2>
</tool_name>

Example (new_task):

<new_task>
<mode>code</mode>
<message>Implement a new feature.</message>
</new_task>

Use the exact tool name as the tag for correct parsing.`
}
