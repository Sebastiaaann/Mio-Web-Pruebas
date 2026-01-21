---
description: Review code against project rules and standards
---

1. Analyze changes against `main`:
   - Identify the scope of changes in the current branch or file.

2. Comprehensive Multi-Skill Audit:
   - Perform a structured review using the following sources of truth:
     - **UX/Design**: `ui-skills` & `vercel-design-guidelines`
     - **Performance**: `vercel-react-best-practices`
     - **Logic & Stack**: `modern-react-stack` (Zustand, Query, Zod)
     - **Accessibility**: `web-design-guidelines`

3. Structured Output Format:
   - For any issues found, report using the following structure:
     - **🎨 UX & Design**: Violations of visual tokens, hierarchy, or animation rules.
     - **⚡ Performance**: Issues with re-renders, waterfalls, or bundle size.
     - **🧠 Logic & Architecture**: Improper use of stores, queries, or types.
     - **♿ Accessibility**: Missing aria-labels, focus issues, or semantic HTML errors.

4. Actionable Summary:
   - Provide a final assessment (e.g., "Ready for merge" or "Requires cleanup") followed by a brief list of the most critical fixes needed.
