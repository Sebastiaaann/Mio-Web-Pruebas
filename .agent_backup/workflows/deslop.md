---
description: Remove AI code slop and maintain consistency
---

1. Check the diff against main:
   - Identify all changes introduced in this branch/file compared to the `main` branch.

2. Remove AI-generated "slop":
   - **Extra comments**: Remove comments that are redundant, explain the obvious, or are inconsistent with the rest of the file's style.
   - **Defensive overkill**: Remove `try/catch` blocks or null/undefined checks that are unnecessary for the specific area (e.g., in internal, validated codepaths).
   - **Lazy typing**: Replace `as any` or generic `Record<string, any>` with proper TypeScript types where possible.
   - **Inconsistent style**: Adjust naming, formatting, or logic patterns that deviate from the established style in the file.

3. Final Report:
   - Provide a 1-3 sentence summary of what was cleaned up.
