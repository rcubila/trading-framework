# AI Coding Guidelines (READ BEFORE EVERY TASK)

---

## 🧠 CRITICAL INSTRUCTION

**You MUST start your response with:**  
`I have read and understood the AI_DONTS.md guidelines`  

If you do NOT find this file or cannot read it, ask the user to provide it **before writing any code**.

Before doing any implementation or code changes, read and follow all the rules below.  
If a rule conflicts with a user request, **ask for clarification first**.

---

## 🚫 DON’Ts

1. **Do NOT use inline CSS styles** in React components (e.g., `style={{ ... }}`).
2. **Do NOT duplicate UI components.** Always use shared/common components where possible.
3. **Do NOT create new components without checking for existing ones.**
4. **Do NOT violate architectural patterns.** Always follow established structure and conventions.
5. **Do NOT use `!important` in any CSS rule.**
6. **Do NOT hardcode colors, spacing, or sizes.** Always use design tokens (CSS variables).

---

## 🎨 CSS Guidelines

### 1. ✅ Use OOCSS (Object-Oriented CSS) principles
- Separate structure from skin
- Separate containers from content
- Reuse common utility classes
- Write modular and independent styles

### 2. ✅ Use BEM (Block Element Modifier)
- **Block**: Standalone component (e.g., `.button`)
- **Element**: Part of a block (e.g., `.button__icon`)
- **Modifier**: Variant (e.g., `.button--primary`)
- **Example**: `.card__image--rounded`

### 3. ✅ CSS Structure
- Group related styles logically
- Use CSS Modules per component
- Keep selectors simple and specific
- Use semantic class names (no `.red-box`, use `.alert--error`)

### 4. ✅ Global Styles
- Place global variables (colors, spacing, etc.) in `styles/variables.css`
- Add dark/light theme overrides using the `.dark` class or `data-theme`

---

## 🧩 Component Design

### 1. ✅ Keep components modular and focused
- Each component should do **one thing well**
- Prefer composition over inheritance
- Components must be independent and reusable

### 2. ✅ Component structure
- One component per folder
- Include:
  - Component file (`.tsx`)
  - Styles (`.module.css` or `.module.scss`)
  - Tests (if required)
  - README or documentation (optional but encouraged)

### 3. ✅ Component communication
- Use **props** for data flow
- Keep state management simple and local
- Use **context only when absolutely necessary**
- Avoid deep prop drilling — restructure instead

---

## 📁 Component Organization

### 1. ✅ Folder Structure
- Each component lives in its own folder
- Place reusable components in `/components`
- Feature-specific components go in `/features/feature-name`
- Page-specific components stay under their page directory

### 2. ✅ Subcomponents
- Place subcomponents inside the parent folder
  - E.g., `Card/Header.tsx` inside `Card/`

### 3. ✅ Assets
- Keep component-specific assets (images, styles) in the component folder

### 4. ✅ Documentation
- Include:
  - Component purpose
  - Props and types
  - Usage examples
  - Special behavior or edge cases

---

## 🎨 Color Management

### 1. NEVER hardcode color values
- ✅ Use semantic CSS variables:
  - `var(--color-primary)`
  - `var(--color-text-secondary)`
  - `var(--color-background-light)`
- ✅ Use state-based suffixes:
  - `--hover`, `--active`, `--disabled`, etc.

### 2. Theme colors
- Store all variables in `styles/variables.css`
- Define dark/light variants
- Group colors by role (primary, secondary, success, error)

### 3. Naming convention
- Use semantic names (e.g., `--color-error`, not `--color-red`)
- Prefix all custom variables with `--color-`
- Use `--color-bg`, `--color-text`, `--color-border`, etc. for clarity

---

## ⚙️ CSS Best Practices

- ✅ Use CSS custom properties (`var(--color-...)`)
- ✅ Use relative units (`rem`, `em`) instead of pixels
- ✅ Use Flexbox and Grid for layout
- ✅ Avoid high specificity
- ✅ Comment any complex styles or overrides
- ✅ Favor logical properties (e.g., `margin-inline-start`) for directionality

---

## 🧪 Testing Guidelines

- Every shared component must have test coverage
- Prefer **unit tests** for logic and **visual tests** for UI
- Use mocks for external data (e.g., API, auth)
- Ensure tests cover:
  - Rendering and variants
  - Prop behavior
  - Interactivity (events, toggles)

---

## ♿ Accessibility (a11y)

- All components must follow [WCAG 2.1 AA](https://www.w3.org/TR/WCAG21/) guidelines
- Ensure:
  - Proper use of semantic HTML
  - Focus states and keyboard navigation
  - Sufficient contrast in light/dark themes
  - `aria-*` attributes where applicable

---

## 🚀 Performance

- Avoid unnecessary re-renders (use `React.memo` when needed)
- Use lazy loading for non-critical components
- Avoid large third-party libraries unless justified
- Keep bundle size low and composable

---

## 📖 Documentation

- If the component is complex or shared:
  - Add a README in the component folder
  - Include usage examples and props interface
  - Add notes about theming or responsiveness if needed

---

## ⚠️ Final Rule

If you're unsure whether something is allowed, **ask first** before implementing.

---

**Update this file as new rules are added.**
