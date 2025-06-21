import os from "os"
import osName from "os-name"

import { getShell } from "../../../utils/shell"

export function getSystemInfoSection(cwd: string): string {
	return `====

SYSTEM INFORMATION

Operating System: ${osName()}
Default Shell: ${getShell()}
Home Directory: ${os.homedir().toPosix()}
Workspace Directory: ${cwd.toPosix()}

Notes:
- All tools default to the workspace directory. New terminals start here, but \`cd\` inside a terminal only affects that terminal.
- At task start you receive a recursive listing of the workspace. Use list_files for paths outside, setting \`recursive\` as needed.
`
}
