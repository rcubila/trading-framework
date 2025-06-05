# AI Coding Guidelines (READ BEFORE EVERY TASK)

**CRITICAL INSTRUCTION:**
You MUST start your response with "I have read and understood the AI_DONTS.md guidelines" before proceeding with ANY implementation or code changes. If you cannot find this file or read it, you MUST ask the user to provide it before proceeding.

**LLM INSTRUCTION:**
Before performing ANY coding task or making ANY code changes, you MUST read and follow the rules in this file. If a rule conflicts with the user request, ask for clarification before proceeding.

## DON'Ts
1. **Do NOT use inline CSS styles** (e.g., `style={{ ... }}`) in React components.
2. **Always use common/shared components** when creating new features. Do NOT duplicate UI code—reuse existing components whenever possible.
3. **Always check for existing common components** before implementing any new feature or component. This prevents code duplication and maintains consistency.
4. **Follow industry best practices** from leading tech companies (Google, Amazon, Microsoft, etc.) for code organization, architecture, and implementation patterns.

## CSS Guidelines
1. **Follow OOCSS (Object-Oriented CSS) principles:**
   - Separate structure from skin
   - Separate containers from content
   - Use reusable classes for common patterns
   - Keep styles modular and independent

2. **Use BEM (Block Element Modifier) methodology:**
   - Block: Standalone component (e.g., `.button`)
   - Element: Part of a block (e.g., `.button__icon`)
   - Modifier: Variation of a block/element (e.g., `.button--primary`)
   - Example: `.button__icon--large`

3. **Component Structure:**
   - Keep components small and focused
   - Break down large components into smaller, reusable pieces
   - Use composition over inheritance
   - Each component should have a single responsibility

4. **CSS Organization:**
   - Group related styles together
   - Use CSS variables for theming
   - Keep specificity low
   - Use meaningful class names
   - Document complex styles with comments

## Component Design
1. **Modular Components:**
   - Create small, focused components
   - Each component should do one thing well
   - Use composition to build complex UIs
   - Keep components independent and reusable

2. **Component Structure:**
   - One component per file
   - Separate styles into module files
   - Use TypeScript for type safety
   - Include proper documentation

3. **Component Communication:**
   - Use props for data flow
   - Keep state management simple
   - Use context sparingly
   - Document component interfaces

---

*Update this file as new rules are added.* 