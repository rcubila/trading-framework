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

## CSS Best Practices

1. NEVER use hardcoded values. Use CSS variables in `:root` for:
   - Colors, spacing, sizes, shadows, transitions
   - Any value that might need to change (theming, responsive design, etc.)

2. Follow BEM methodology:
   - Block: `.block`
   - Element: `.block__element`
   - Modifier: `.block--modifier`

3. Use OOCSS principles:
   - Separate structure from skin
   - Separate containers from content
   - Use composition over inheritance

4. NEVER use inline styles or !important

5. Use CSS modules for component styles

6. Use semantic class names and keep selectors simple

7. Use relative units (rem, em) over pixels

8. Use CSS Grid and Flexbox for layouts

9. Use CSS custom properties for:
   - Theming and dark mode
   - Responsive design
   - Accessibility
   - Animations and transitions
   - Dynamic values (with calc())

## Color Management

1. NEVER use hardcoded color values (e.g., `#ff0000`, `rgb(255, 0, 0)`, `rgba(255, 0, 0, 0.5)`). Instead:
   - Use semantic color variables (e.g., `var(--color-error)`, `var(--color-success)`)
   - Use theme color variables (e.g., `var(--color-primary)`, `var(--color-background)`)
   - Use text color variables (e.g., `var(--color-text-primary)`, `var(--color-text-secondary)`)

2. When adding new colors:
   - Add them to the global variables file (`src/styles/variables.css`)
   - Use semantic names that describe the color's purpose
   - Group related colors together (e.g., primary, secondary, success, error)
   - Include light/dark variants for each color

3. Color naming conventions:
   - Use semantic names over visual descriptions
   - Prefix with `--color-` for all color variables
   - Use `-light` and `-dark` suffixes for variants
   - Use `-hover`, `-active`, `-disabled` for states

4. When reviewing code:
   - Check for any hardcoded color values
   - Ensure colors are using the appropriate semantic variables
   - Verify color contrast meets accessibility standards
   - Confirm colors work in both light and dark themes

---

*Update this file as new rules are added.* 