import type { CommonError } from "@/types";

export const COMMON_ERRORS: CommonError[] = [
  // ── React ──────────────────────────────────────────────────────────────────
  {
    id: "cannot-read-undefined-map",
    title: "Cannot read properties of undefined (reading 'map')",
    category: "react",
    rawTrace: `TypeError: Cannot read properties of undefined (reading 'map')
    at ProductList (ProductList.jsx:12:18)
    at renderWithHooks (react-dom.development.js:14985:18)
    at mountIndeterminateComponent (react-dom.development.js:17811:13)
    at beginWork (react-dom.development.js:19049:20)`,
    decoded: [
      {
        key: "explanation",
        label: "What happened",
        content:
          "Your component tried to call `.map()` on a value that is `undefined`. The array you expected to iterate over doesn't exist yet — most likely because data is still loading or wasn't passed as a prop.",
        isComplete: true,
      },
      {
        key: "location",
        label: "Where it happened",
        content:
          "`ProductList.jsx:12:18` — inside the `ProductList` component's render output, on the line that calls `.map()`.",
        isComplete: true,
      },
      {
        key: "rootCause",
        label: "Root cause",
        content:
          "1. The prop or state holding your array is `undefined` on the first render — data fetching is async but the component renders synchronously.\n2. A parent component didn't pass the prop at all, or passed it with the wrong name.\n3. A destructuring default was omitted: `const { products } = props` instead of `const { products = [] } = props`.",
        isComplete: true,
      },
      {
        key: "fix",
        label: "How to fix it",
        content:
          "```tsx\n// Option 1 — nullish coalescing fallback (safest)\nreturn (\n  <ul>\n    {(products ?? []).map((p) => (\n      <li key={p.id}>{p.name}</li>\n    ))}\n  </ul>\n);\n\n// Option 2 — optional chaining\nreturn <ul>{products?.map((p) => <li key={p.id}>{p.name}</li>)}</ul>;\n\n// Option 3 — guard clause at the top of the component\nif (!products) return <p>Loading…</p>;\n```",
        isComplete: true,
      },
      {
        key: "prevention",
        label: "How to prevent this",
        content:
          "- Type your props strictly in TypeScript: `products: Product[]` (not `Product[] | undefined`) and enforce non-nullable at the call site.\n- Enable `@typescript-eslint/no-unnecessary-condition` to catch unguarded array accesses.\n- Use default destructuring parameters: `function ProductList({ products = [] }: Props)`.",
        isComplete: true,
      },
    ],
  },
  {
    id: "react-missing-key",
    title: "Warning: Each child in a list should have a unique 'key' prop",
    category: "react",
    rawTrace: `Warning: Each child in a list should have a unique "key" prop.

Check the render method of \`TodoList\`. See https://reactjs.org/link/warning-keys for more information.
    at li
    at TodoList (TodoList.jsx:8:5)`,
    decoded: [
      {
        key: "explanation",
        label: "What happened",
        content:
          "React requires each item in a dynamically rendered list to have a stable, unique `key` prop. Without it, React can't efficiently track which items changed, moved, or were removed — leading to subtle rendering bugs and poor performance.",
        isComplete: true,
      },
      {
        key: "location",
        label: "Where it happened",
        content:
          "`TodoList.jsx:8:5` — the `<li>` elements rendered inside `TodoList` are missing `key` props.",
        isComplete: true,
      },
      {
        key: "rootCause",
        label: "Root cause",
        content:
          "1. The `.map()` call that renders list items doesn't include a `key` prop on the outermost returned element.\n2. Array index (`i`) is being used as the key, which is only valid for static lists that never reorder or filter.",
        isComplete: true,
      },
      {
        key: "fix",
        label: "How to fix it",
        content:
          "```tsx\n// ❌ Missing key\nreturn todos.map((todo) => <li>{todo.text}</li>);\n\n// ✅ Stable unique ID as key\nreturn todos.map((todo) => <li key={todo.id}>{todo.text}</li>);\n\n// ⚠️ Index as key — only acceptable for static, non-reorderable lists\nreturn todos.map((todo, i) => <li key={i}>{todo.text}</li>);\n```",
        isComplete: true,
      },
      {
        key: "prevention",
        label: "How to prevent this",
        content:
          "- Always use a stable, unique ID from your data as the key — never use Math.random().\n- Enable the `react/jsx-key` ESLint rule (included in `eslint-plugin-react` recommended config) to catch this at lint time before it reaches the browser.",
        isComplete: true,
      },
    ],
  },
  {
    id: "react-hooks-rules",
    title: "React Hook 'useState' is called conditionally",
    category: "react",
    rawTrace: `Error: React Hook "useState" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?

    at UserProfile (UserProfile.jsx:7:18)`,
    decoded: [
      {
        key: "explanation",
        label: "What happened",
        content:
          "React's rules of hooks require that hooks are always called in the same order on every render. You called `useState` (or another hook) inside an `if` block, after an early `return`, or inside a loop — which breaks this invariant.",
        isComplete: true,
      },
      {
        key: "location",
        label: "Where it happened",
        content:
          "`UserProfile.jsx:7:18` — a hook call appears after a conditional branch or early return in the `UserProfile` component.",
        isComplete: true,
      },
      {
        key: "rootCause",
        label: "Root cause",
        content:
          "1. An early return (e.g., `if (!user) return null`) appears *before* a hook call in the same component.\n2. A hook is called inside an `if`, `for`, or `while` block.\n3. A hook is called inside a nested function or event handler instead of directly in the component body.",
        isComplete: true,
      },
      {
        key: "fix",
        label: "How to fix it",
        content:
          "```tsx\n// ❌ Hook called after early return\nfunction UserProfile({ user }: { user: User | null }) {\n  if (!user) return null; // early return breaks hook order\n  const [isEditing, setIsEditing] = useState(false); // ← error here\n}\n\n// ✅ Move all hook calls above any early returns\nfunction UserProfile({ user }: { user: User | null }) {\n  const [isEditing, setIsEditing] = useState(false); // hooks first\n  if (!user) return null; // guard after hooks\n  return <div>{user.name}</div>;\n}\n```",
        isComplete: true,
      },
      {
        key: "prevention",
        label: "How to prevent this",
        content:
          "- Enable the `react-hooks/rules-of-hooks` ESLint rule (comes with `eslint-plugin-react-hooks`) — it catches this at lint time.\n- As a mental model: think of hooks as the first thing your component does. All guards, conditions, and early returns come after.",
        isComplete: true,
      },
    ],
  },
  {
    id: "react-max-update-depth",
    title: "Error: Maximum update depth exceeded",
    category: "react",
    rawTrace: `Error: Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
    at checkForNestedUpdates (react-dom.development.js:21263:9)
    at scheduleUpdateOnFiber (react-dom.development.js:21205:5)
    at Counter (Counter.jsx:9:5)`,
    decoded: [
      {
        key: "explanation",
        label: "What happened",
        content:
          "A component triggered an infinite render loop: a state update caused a re-render, which triggered another state update, and so on until React gave up. This almost always happens in a `useEffect` that updates state without proper dependency tracking.",
        isComplete: true,
      },
      {
        key: "location",
        label: "Where it happened",
        content:
          "`Counter.jsx:9:5` — a `setState` call inside a `useEffect` in the `Counter` component is firing on every render.",
        isComplete: true,
      },
      {
        key: "rootCause",
        label: "Root cause",
        content:
          "1. `useEffect` calls `setState` with no dependency array `[]` — runs on every render and triggers another render.\n2. A dependency in the array (e.g., an object or array literal, or a function defined in the component body) is recreated on every render, so the effect fires repeatedly.\n3. An event handler or callback calls `setState` inside a `useEffect` that has that state value as a dependency.",
        isComplete: true,
      },
      {
        key: "fix",
        label: "How to fix it",
        content:
          "```tsx\n// ❌ Infinite loop — no dependency array\nuseEffect(() => {\n  setCount(count + 1); // triggers re-render → effect runs again → ∞\n});\n\n// ✅ Use functional update form with empty dependency array\nuseEffect(() => {\n  setCount((prev) => prev + 1);\n}, []); // runs once on mount\n\n// ✅ If you need the effect to respond to changes, be precise\nuseEffect(() => {\n  if (data) setProcessed(transform(data));\n}, [data]); // only re-runs when `data` changes\n\n// ✅ Stabilize object/array dependencies with useMemo\nconst options = useMemo(() => ({ page, limit }), [page, limit]);\nuseEffect(() => { fetchData(options); }, [options]);\n```",
        isComplete: true,
      },
      {
        key: "prevention",
        label: "How to prevent this",
        content:
          "- Always provide a dependency array to `useEffect`. An empty array `[]` means \"run once on mount\".\n- Enable the `react-hooks/exhaustive-deps` ESLint rule to be warned about missing or unstable dependencies.\n- Prefer the functional update form `setState(prev => ...)` when you only need the previous value — it avoids needing `state` as a dependency.",
        isComplete: true,
      },
    ],
  },

  // ── TypeScript ─────────────────────────────────────────────────────────────
  {
    id: "ts-not-assignable",
    title: "TS2322: Type 'string' is not assignable to type 'number'",
    category: "typescript",
    rawTrace: `TypeScript error in ./components/PriceTag.tsx:
Type 'string' is not assignable to type 'number'.  TS(2322)

  8 |   return (
  9 |     <PriceTag
> 10 |       price={product.price}
     |       ^^^^^
  11 |     />
  12 |   );`,
    decoded: [
      {
        key: "explanation",
        label: "What happened",
        content:
          "TypeScript found a type mismatch at compile time. You're passing a `string` value to a prop (or variable) that expects a `number`. The code would compile to JavaScript but could cause a runtime bug, so TypeScript stops you here.",
        isComplete: true,
      },
      {
        key: "location",
        label: "Where it happened",
        content:
          "`PriceTag.tsx:10` — the `price` prop is being passed a `string` but the `PriceTag` component's props type declares it as `number`.",
        isComplete: true,
      },
      {
        key: "rootCause",
        label: "Root cause",
        content:
          "1. API data often returns numbers as strings (e.g., JSON from a form or query parameter). `product.price` may be typed as `string | number` or `string` in your data model.\n2. The component interface and the data source type got out of sync — one was updated but not the other.",
        isComplete: true,
      },
      {
        key: "fix",
        label: "How to fix it",
        content:
          "```tsx\n// Option 1 — convert at the call site\n<PriceTag price={Number(product.price)} />\n\n// Option 2 — use parseFloat for decimal prices\n<PriceTag price={parseFloat(product.price)} />\n\n// Option 3 — fix the upstream type so price is always a number\ninterface Product {\n  id: string;\n  name: string;\n  price: number; // not string\n}\n```",
        isComplete: true,
      },
      {
        key: "prevention",
        label: "How to prevent this",
        content:
          "- Define strict types for all API responses using a schema validator (Zod is excellent for this) rather than relying on TypeScript `as` casts.\n- Enable `strict: true` in `tsconfig.json` — it catches more type mismatches automatically.\n- Avoid `any` types as they bypass these checks entirely.",
        isComplete: true,
      },
    ],
  },
  {
    id: "ts-possibly-null",
    title: "TS2531: Object is possibly 'null'",
    category: "typescript",
    rawTrace: `TypeScript error in ./hooks/useUser.ts:
Object is possibly 'null'.  TS(2531)

  14 |   const handleClick = () => {
> 15 |     setName(currentUser.name);
     |             ^^^^^^^^^^^
  16 |   };`,
    decoded: [
      {
        key: "explanation",
        label: "What happened",
        content:
          "TypeScript knows that `currentUser` might be `null` at the point you're accessing `.name`. You haven't checked for null first, so TypeScript refuses to compile — it's preventing a potential `Cannot read properties of null` runtime crash.",
        isComplete: true,
      },
      {
        key: "location",
        label: "Where it happened",
        content:
          "`useUser.ts:15` — `currentUser.name` is accessed without first confirming `currentUser` is not `null`.",
        isComplete: true,
      },
      {
        key: "rootCause",
        label: "Root cause",
        content:
          "1. `currentUser` is typed as `User | null` (common for auth state before a user loads).\n2. A database/API query return type includes `null` for \"not found\" cases.\n3. `document.getElementById()` and similar DOM APIs return `Element | null`.",
        isComplete: true,
      },
      {
        key: "fix",
        label: "How to fix it",
        content:
          "```typescript\n// Option 1 — optional chaining (read-only access)\nsetName(currentUser?.name ?? \"\");\n\n// Option 2 — explicit null guard\nif (currentUser) {\n  setName(currentUser.name); // TypeScript narrows to User here\n}\n\n// Option 3 — non-null assertion (use only when you are certain)\nsetName(currentUser!.name); // ← you're telling TS \"trust me\"\n```",
        isComplete: true,
      },
      {
        key: "prevention",
        label: "How to prevent this",
        content:
          "- Enable `strictNullChecks: true` in `tsconfig.json` (included in `strict: true`) — TypeScript won't let nullable values slip through unguarded.\n- Prefer optional chaining `?.` and nullish coalescing `??` as default access patterns for anything that could be null.\n- Use Zod or similar to parse and validate API responses so you know exactly what shape data can take.",
        isComplete: true,
      },
    ],
  },
  {
    id: "ts-property-not-exist",
    title: "TS2339: Property 'userName' does not exist on type 'User'",
    category: "typescript",
    rawTrace: `TypeScript error in ./components/Header.tsx:
Property 'userName' does not exist on type 'User'. Did you mean 'username'?  TS(2339)

  6 | function Header({ user }: { user: User }) {
> 7 |   return <span>{user.userName}</span>;
    |                     ^^^^^^^^
  8 | }`,
    decoded: [
      {
        key: "explanation",
        label: "What happened",
        content:
          "You accessed a property `userName` that doesn't exist on the `User` type. TypeScript caught a likely typo or naming inconsistency at compile time — the property probably exists under a different name.",
        isComplete: true,
      },
      {
        key: "location",
        label: "Where it happened",
        content:
          "`Header.tsx:7` — `user.userName` is accessed but the `User` interface doesn't define a `userName` property (it defines `username`).",
        isComplete: true,
      },
      {
        key: "rootCause",
        label: "Root cause",
        content:
          "1. Simple typo: `userName` vs. `username` (case mismatch in camelCase).\n2. The interface was recently renamed or refactored and this access site wasn't updated.\n3. You're using a property name from a different data model or API version.",
        isComplete: true,
      },
      {
        key: "fix",
        label: "How to fix it",
        content:
          "```tsx\n// ✅ Use the correct property name as defined in the interface\nreturn <span>{user.username}</span>;\n\n// Or, if you want to support both (transitional):\ninterface User {\n  username: string;\n  /** @deprecated use username */\n  userName?: string;\n}\n```",
        isComplete: true,
      },
      {
        key: "prevention",
        label: "How to prevent this",
        content:
          "- Use IDE autocomplete when accessing object properties — it only suggests properties that actually exist.\n- Keep your type definitions in a single source-of-truth file and import them everywhere rather than redefining them per file.\n- Run `tsc --noEmit` as part of your CI pipeline to catch type errors before they reach a PR review.",
        isComplete: true,
      },
    ],
  },

  // ── Next.js ────────────────────────────────────────────────────────────────
  {
    id: "nextjs-hydration-mismatch",
    title: "Error: Hydration failed because the initial UI does not match",
    category: "nextjs",
    rawTrace: `Error: Hydration failed because the initial UI does not match what was rendered on the server.

Warning: Expected server HTML to contain a matching <div> in <div>.

See more info here: https://nextjs.org/docs/messages/react-hydration-error
    at throwOnHydrationMismatch (react-dom.development.js:4507:9)
    at tryToClaimNextHydratableInstance (react-dom.development.js:4524:5)`,
    decoded: [
      {
        key: "explanation",
        label: "What happened",
        content:
          "Next.js renders your page on the server first (SSR/SSG), then React takes over in the browser (hydration). A hydration mismatch means the HTML the server produced doesn't match what React expected — so React bails out and re-renders from scratch, which causes a flash of content.",
        isComplete: true,
      },
      {
        key: "location",
        label: "Where it happened",
        content:
          "The error points to the React DOM hydration internals, but the actual bug is in your component tree — usually in a component that renders differently on the server vs. the client.",
        isComplete: true,
      },
      {
        key: "rootCause",
        label: "Root cause",
        content:
          "1. Using `window`, `localStorage`, `document`, or other browser-only APIs in component body (they don't exist during server render).\n2. Rendering based on current time/date — server and client see different values.\n3. Invalid HTML nesting (e.g., `<div>` inside `<p>`, or `<a>` inside `<a>`).\n4. Browser extensions that modify the DOM before React hydrates (ad blockers, password managers).",
        isComplete: true,
      },
      {
        key: "fix",
        label: "How to fix it",
        content:
          "```tsx\n// Option 1 — suppress hydration on elements that legitimately differ\n<div suppressHydrationWarning>{new Date().toLocaleTimeString()}</div>\n\n// Option 2 — use useEffect for browser-only code\nconst [isClient, setIsClient] = useState(false);\nuseEffect(() => setIsClient(true), []);\nreturn isClient ? <BrowserOnlyComponent /> : null;\n\n// Option 3 — dynamic import with SSR disabled for browser-only components\nimport dynamic from 'next/dynamic';\nconst Map = dynamic(() => import('./Map'), { ssr: false });\n```",
        isComplete: true,
      },
      {
        key: "prevention",
        label: "How to prevent this",
        content:
          "- Treat Server Components and Client Components as having different environments. Only access browser APIs inside `useEffect` or in `'use client'` components after mount.\n- Use `dynamic(() => import(...), { ssr: false })` for any component that fundamentally requires the browser.\n- Validate your HTML nesting — run the W3C validator on your rendered output if you suspect structural issues.",
        isComplete: true,
      },
    ],
  },
  {
    id: "nextjs-module-not-found",
    title: "Module not found: Can't resolve '@/components/Button'",
    category: "nextjs",
    rawTrace: `Module not found: Can't resolve '@/components/Button'
./app/page.tsx:3:1

Import trace for requested module:
./app/page.tsx

https://nextjs.org/docs/messages/module-not-found`,
    decoded: [
      {
        key: "explanation",
        label: "What happened",
        content:
          "Next.js can't find the file you're trying to import. The `@/` alias maps to your project root (or `src/`), and nothing exists at `@/components/Button`.",
        isComplete: true,
      },
      {
        key: "location",
        label: "Where it happened",
        content:
          "`app/page.tsx:3` — the import `import Button from '@/components/Button'` can't be resolved.",
        isComplete: true,
      },
      {
        key: "rootCause",
        label: "Root cause",
        content:
          "1. The file was renamed, moved, or deleted — the import wasn't updated.\n2. Casing mismatch: the file is `button.tsx` but the import says `Button` (matters on Linux/Mac).\n3. The `@/` path alias isn't configured in `tsconfig.json` (`paths: { \"@/*\": [\"./src/*\"] }` or `[\"./\"]`).\n4. The file hasn't been created yet.",
        isComplete: true,
      },
      {
        key: "fix",
        label: "How to fix it",
        content:
          "```bash\n# 1. Verify the file exists at the expected path\nls ./components/Button.tsx\n\n# 2. If the alias is broken, check tsconfig.json\n```\n```json\n// tsconfig.json — ensure paths matches your project structure\n{\n  \"compilerOptions\": {\n    \"paths\": {\n      \"@/*\": [\"./*\"]\n    }\n  }\n}\n```\n```tsx\n// 3. If the component doesn't exist yet, create it\nexport default function Button({ children }: { children: React.ReactNode }) {\n  return <button>{children}</button>;\n}\n```",
        isComplete: true,
      },
      {
        key: "prevention",
        label: "How to prevent this",
        content:
          "- Use your IDE's \"Move file\" refactor (VS Code: F2 on a file) rather than manually renaming — it automatically updates all imports.\n- Run `tsc --noEmit` in CI to catch broken imports before they hit a build.\n- Be consistent with casing conventions: always PascalCase for components, lowercase for utilities.",
        isComplete: true,
      },
    ],
  },
  {
    id: "nextjs-missing-env",
    title: "Error: Missing required environment variable",
    category: "nextjs",
    rawTrace: `Error: Missing required environment variable: STRIPE_SECRET_KEY
    at validateEnv (lib/env.ts:12:11)
    at Module.getInitialProps (pages/_app.tsx:8:3)

  Note: To expose a variable to the browser, use the NEXT_PUBLIC_ prefix.`,
    decoded: [
      {
        key: "explanation",
        label: "What happened",
        content:
          "Your code tried to access an environment variable (`STRIPE_SECRET_KEY`) that isn't set in the current environment. Next.js doesn't automatically load `.env.local` in production — it must be configured in your deployment platform.",
        isComplete: true,
      },
      {
        key: "location",
        label: "Where it happened",
        content:
          "`lib/env.ts:12` — a validation step checks for required env vars on startup and throws when one is missing.",
        isComplete: true,
      },
      {
        key: "rootCause",
        label: "Root cause",
        content:
          "1. The variable is in `.env.local` (development only) but not in the deployment platform's env configuration.\n2. The variable name has a typo between where it's set and where it's referenced.\n3. The variable should be `NEXT_PUBLIC_` prefixed to be accessible in client-side code, but isn't.",
        isComplete: true,
      },
      {
        key: "fix",
        label: "How to fix it",
        content:
          "```bash\n# For local development — add to .env.local (never commit this file)\nSTRIPE_SECRET_KEY=sk_test_...\n\n# For Netlify — set via CLI or dashboard\nnetlify env:set STRIPE_SECRET_KEY sk_live_...\n```\n```typescript\n// Validate env vars at startup with a clear error (using Zod)\nimport { z } from 'zod';\n\nconst envSchema = z.object({\n  STRIPE_SECRET_KEY: z.string().min(1),\n});\n\nexport const env = envSchema.parse(process.env);\n```",
        isComplete: true,
      },
      {
        key: "prevention",
        label: "How to prevent this",
        content:
          "- Use a library like `@t3-oss/env-nextjs` or Zod to validate all required env vars at build time — failing fast is better than mysterious runtime errors.\n- Commit a `.env.local.example` file listing all required variables (with placeholder values) so teammates never wonder what's needed.\n- Never use `NEXT_PUBLIC_` for secrets — those values are bundled into client JS and visible to anyone.",
        isComplete: true,
      },
    ],
  },

  // ── CORS ───────────────────────────────────────────────────────────────────
  {
    id: "cors-blocked",
    title: "Access to fetch has been blocked by CORS policy",
    category: "cors",
    rawTrace: `Access to fetch at 'https://api.example.com/data' from origin 'https://myapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.

GET https://api.example.com/data net::ERR_FAILED 200`,
    decoded: [
      {
        key: "explanation",
        label: "What happened",
        content:
          "Your browser blocked a request from `myapp.com` to `api.example.com` because the API server's response didn't include the `Access-Control-Allow-Origin` header. This is the browser enforcing the Same-Origin Policy — the server made the request just fine, but the browser refused to hand the response to your JavaScript.",
        isComplete: true,
      },
      {
        key: "location",
        label: "Where it happened",
        content:
          "This is a browser-level block on the request to `https://api.example.com/data`. The error appears in the browser console, not in the server logs — the server successfully processed the request.",
        isComplete: true,
      },
      {
        key: "rootCause",
        label: "Root cause",
        content:
          "1. The API server doesn't send `Access-Control-Allow-Origin` headers (most common — server not configured for CORS).\n2. The API allows specific origins but yours isn't listed.\n3. You're calling a third-party API directly from the browser that doesn't support CORS (many don't — they expect server-to-server calls).",
        isComplete: true,
      },
      {
        key: "fix",
        label: "How to fix it",
        content:
          "```typescript\n// Option 1 — proxy through your own Next.js API route (recommended for third-party APIs)\n// app/api/proxy/route.ts\nexport async function GET() {\n  const res = await fetch('https://api.example.com/data'); // server-to-server, no CORS\n  const data = await res.json();\n  return Response.json(data);\n}\n\n// Option 2 — if you control the API, add CORS headers to the response\n// Express example:\napp.use(cors({ origin: 'https://myapp.com' }));\n\n// Next.js API route example:\nreturn new Response(body, {\n  headers: { 'Access-Control-Allow-Origin': 'https://myapp.com' },\n});\n```",
        isComplete: true,
      },
      {
        key: "prevention",
        label: "How to prevent this",
        content:
          "- Never call third-party APIs that require secret keys directly from the browser — proxy them through your own backend to keep keys secure and avoid CORS issues.\n- If you control both ends, configure CORS headers explicitly with a specific origin allowlist, not `*`.\n- In development, use Next.js API routes as a proxy rather than trying to disable browser security.",
        isComplete: true,
      },
    ],
  },
  {
    id: "cors-preflight",
    title: "Response to preflight request doesn't pass access control check",
    category: "cors",
    rawTrace: `Access to fetch at 'https://api.example.com/users' from origin 'https://myapp.com' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.

OPTIONS https://api.example.com/users 404`,
    decoded: [
      {
        key: "explanation",
        label: "What happened",
        content:
          "Before sending your actual `POST`/`PUT`/`DELETE` request (or any request with custom headers), the browser automatically sends a preflight `OPTIONS` request to ask the server \"is this allowed?\" The server returned a 404 for the `OPTIONS` request, which the browser treats as a CORS denial.",
        isComplete: true,
      },
      {
        key: "location",
        label: "Where it happened",
        content:
          "The `OPTIONS https://api.example.com/users 404` in your network tab is the preflight request. The server has no route registered for `OPTIONS /users`, so it returns 404, and the browser blocks your actual request before it's even sent.",
        isComplete: true,
      },
      {
        key: "rootCause",
        label: "Root cause",
        content:
          "1. The server has no `OPTIONS` route handler — CORS middleware isn't installed or isn't applied to this route.\n2. The server only allows `GET` and rejects `OPTIONS` with a 404 or 405.\n3. You're sending a custom header (like `Authorization` or `Content-Type: application/json`) which always triggers a preflight.",
        isComplete: true,
      },
      {
        key: "fix",
        label: "How to fix it",
        content:
          "```typescript\n// Server fix — handle OPTIONS and return correct CORS headers\n// Next.js Route Handler example:\nexport async function OPTIONS() {\n  return new Response(null, {\n    status: 204,\n    headers: {\n      'Access-Control-Allow-Origin': 'https://myapp.com',\n      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',\n      'Access-Control-Allow-Headers': 'Content-Type, Authorization',\n      'Access-Control-Max-Age': '86400', // cache preflight for 24h\n    },\n  });\n}\n\n// Express — use the cors package (handles OPTIONS automatically)\nimport cors from 'cors';\napp.use(cors({ origin: 'https://myapp.com' }));\n```",
        isComplete: true,
      },
      {
        key: "prevention",
        label: "How to prevent this",
        content:
          "- Use an established CORS middleware (`cors` for Express, built-in headers for Next.js) rather than manually setting headers — they handle `OPTIONS` preflight automatically.\n- Proxy all external API calls through your own backend to avoid CORS entirely on the client side.\n- Test CORS configuration with `curl -X OPTIONS -v` to verify headers before deploying.",
        isComplete: true,
      },
    ],
  },
];
