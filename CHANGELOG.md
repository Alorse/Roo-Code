# CHANGELOG

## [3.21.5] - 2025-06-23

- Fix Qdrant URL prefix handling for QdrantClient initialization (thanks @CW-B-W!)
- Improve LM Studio model detection to show all downloaded models (thanks @daniel-lxs!)
- Resolve Claude Code provider JSON parsing and reasoning block display

## [3.21.4] - 2025-06-23

- Fix start line not working in multiple apply diff (thanks @samhvw8!)
- Resolve diff editor issues with markdown preview associations (thanks @daniel-lxs!)
- Resolve URL port handling bug for HTTPS URLs in Qdrant (thanks @benashby!)
- Mark unused Ollama schema properties as optional (thanks @daniel-lxs!)
- Close the local browser when used as fallback for remote (thanks @markijbema!)
- Add Claude Code provider for local CLI integration (thanks @BarreiroT!)

## [3.22.1] - 2025-06-26

- Add Gemini CLI provider (thanks Cline!)
- Fix undefined mcp command (thanks @qdaxb!)
- Use upstream_inference_cost for OpenRouter BYOK cost calculation and show cached token count (thanks @chrarnoldus!)
- Update maxTokens value for qwen/qwen3-32b model on Groq (thanks @KanTakahiro!)
- Standardize tooltip delays to 300ms

## [3.22.0] - 2025-06-25

- Add 1-click task sharing
- Add support for loading rules from a global .roo directory (thanks @samhvw8!)
- Modes selector improvements (thanks @brunobergher!)
- Use safeWriteJson for all JSON file writes to avoid task history corruption (thanks @KJ7LNW!)
- Improve YAML error handling when editing modes
- Register importSettings as VSCode command (thanks @shivamd1810!)
- Add default task names for empty tasks (thanks @daniel-lxs!)
- Improve translation workflow to avoid unnecessary file reads (thanks @KJ7LNW!)
- Allow write_to_file to handle newline-only and empty content (thanks @Githubguy132010!)
- Address multiple memory leaks in CodeBlock component (thanks @kiwina!)
- Memory cleanup (thanks @xyOz-dev!)
- Fix port handling bug in code indexing for HTTPS URLs (thanks @benashby!)
- Improve Bedrock error handling for throttling and streaming contexts
- Handle long Claude code messages (thanks @daniel-lxs!)
- Fixes to Claude Code caching and image upload
- Disable reasoning budget UI controls for Claude Code provider
- Remove temperature parameter for Azure OpenAI reasoning models (thanks @ExactDoug!)
- Allowed commands import/export (thanks @catrielmuller!)
- Add VS Code setting to disable quick fix context actions (thanks @OlegOAndreev!)

## [3.21.5] - 2025-06-23

- Fix Qdrant URL prefix handling for QdrantClient initialization (thanks @CW-B-W!)
- Improve LM Studio model detection to show all downloaded models (thanks @daniel-lxs!)
- Resolve Claude Code provider JSON parsing and reasoning block display

## [3.21.5] - 2025-06-23

- Fix Qdrant URL prefix handling for QdrantClient initialization (thanks @CW-B-W!)
- Improve LM Studio model detection to show all downloaded models (thanks @daniel-lxs!)
- Resolve Claude Code provider JSON parsing and reasoning block display

## [3.21.4] - 2025-06-23

- Fix start line not working in multiple apply diff (thanks @samhvw8!)
- Resolve diff editor issues with markdown preview associations (thanks @daniel-lxs!)
- Resolve URL port handling bug for HTTPS URLs in Qdrant (thanks @benashby!)
- Mark unused Ollama schema properties as optional (thanks @daniel-lxs!)
- Close the local browser when used as fallback for remote (thanks @markijbema!)
- Add Claude Code provider for local CLI integration (thanks @BarreiroT!)

## [3.21.3] - 2025-06-21

- Add profile-specific context condensing thresholds (thanks @SannidhyaSah!)
- Fix context length for lmstudio and ollama (thanks @thecolorblue!)
- Resolve MCP tool eye icon state and hide in chat context (thanks @daniel-lxs!)

## [3.21.2] - 2025-06-20

- Add LaTeX math equation rendering in chat window
- Add toggle for excluding MCP server tools from the prompt (thanks @Rexarrior!)
- Add symlink support to list_files tool
- Fix marketplace blanking after populating
- Fix recursive directory scanning in @ mention "Add Folder" functionality (thanks @village-way!)
- Resolve phantom subtask display on cancel during API retry
- Correct Gemini 2.5 Flash pricing (thanks @daniel-lxs!)
- Resolve marketplace timeout issues and display installed MCPs (thanks @daniel-lxs!)
- Onboarding tweaks to emphasize modes (thanks @brunobergher!)
- Rename 'Boomerang Tasks' to 'Task Orchestration' for clarity
- Remove command execution from attempt_completion
- Fix markdown for links followed by punctuation (thanks @xyOz-dev!)

## [3.21.1] - 2025-06-19

- Add LaTeX math equation rendering in chat window
- Add toggle for excluding MCP server tools from the prompt (thanks @Rexarrior!)
- Add symlink support to list_files tool
- Fix marketplace blanking after populating
- Fix recursive directory scanning in @ mention "Add Folder" functionality (thanks @village-way!)
- Resolve phantom subtask display on cancel during API retry
- Correct Gemini 2.5 Flash pricing (thanks @daniel-lxs!)
- Resolve marketplace timeout issues and display installed MCPs (thanks @daniel-lxs!)
- Onboarding tweaks to emphasize modes (thanks @brunobergher!)
- Rename 'Boomerang Tasks' to 'Task Orchestration' for clarity
- Remove command execution from attempt_completion
- Fix markdown for links followed by punctuation (thanks @xyOz-dev!)

## [3.21.1] - 2025-06-19

- Modified chat component to improve API model name display.
- Implemented on-demand configuration fetching and caching.
- Updated UI styling for consistency and enhanced visual design.
- Added version notice in README indicating custom modifications by Alorse.
