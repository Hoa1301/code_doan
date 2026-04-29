# OpenCode Local Rules

## Serena MCP Priority

- Always use Serena MCP tools first for repository understanding and symbol-aware navigation/editing.
- Prefer Serena tools over raw shell/text search when possible:
  - `serena_list_dir`, `serena_find_file` for structure discovery
  - `serena_search_for_pattern` for targeted pattern lookup
  - `serena_get_symbols_overview`, `serena_find_symbol` for code understanding
  - `serena_replace_symbol_body`, `serena_insert_*`, `serena_rename_symbol` for symbol-safe edits
- Use non-Serena tools only when Serena cannot satisfy the task (for example: running builds/tests, package scripts, git operations, or external network tasks).
- Before major edits, prefer symbol-level discovery via Serena to reduce fragile string-based changes.
