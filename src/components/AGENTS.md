# Components - AGENTS.md

> This file accumulates learnings about React components in the GZ project.
> Update this file whenever you discover important patterns or gotchas.

**Last Updated:** 2026-01-19

---

## Critical Rule: Accessibility (WCAG 2.2 AA)

### Why It Matters

European Accessibility Act (EAA) requires WCAG 2.2 AA compliance by **June 2025**.

### Interactive Elements

```tsx
// ✗ WRONG - No accessible label
<button onClick={submit}>Submit</button>

// ✓ CORRECT - With aria-label
<button onClick={submit} aria-label="Submit business plan">
  Submit
</button>

// ✓ ALSO CORRECT - Visible text is sufficient
<button onClick={submit}>Submit Business Plan</button>
```

### Form Inputs

```tsx
// ✗ WRONG - Input without label
<input type="text" placeholder="Enter amount" />

// ✓ CORRECT - With associated label
<label htmlFor="kapitalbedarf">Kapitalbedarf (€)</label>
<input
  id="kapitalbedarf"
  type="text"
  aria-describedby="kapitalbedarf-help"
/>
<span id="kapitalbedarf-help">
  Total startup capital needed
</span>
```

---

## Canvas Pattern (Split-View)

### Desktop vs Mobile

```tsx
// src/components/canvas/CanvasLayout.tsx
export function CanvasLayout({
  chat,
  preview,
}: {
  chat: React.ReactNode;
  preview: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Desktop: Side-by-side */}
      <div className="hidden lg:flex lg:w-1/2 border-r">
        {chat}
      </div>
      <div className="hidden lg:flex lg:w-1/2">
        {preview}
      </div>

      {/* Mobile: Tabs */}
      <div className="lg:hidden w-full">
        <Tabs defaultValue="chat">
          <TabsList className="w-full">
            <TabsTrigger value="chat" className="flex-1">
              Chat
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">
              Preview
            </TabsTrigger>
          </TabsList>
          <TabsContent value="chat">{chat}</TabsContent>
          <TabsContent value="preview">{preview}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

---

## Component Size Rule

### Max 300 Lines

Components over 300 lines should be split:

```tsx
// ✗ WRONG - 800-line monolithic component
function WorkshopPage() {
  // 800 lines of everything mixed together
}

// ✓ CORRECT - Split by concern
function WorkshopPage() {
  return (
    <WorkshopProvider>
      <WorkshopHeader />
      <CanvasLayout
        chat={<ChatPanel />}
        preview={<PreviewPanel />}
      />
      <WorkshopFooter />
    </WorkshopProvider>
  );
}
```

---

## shadcn/ui Patterns

### Using Components

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

function ModuleCard({ module }) {
  return (
    <Card>
      <CardHeader>
        <h3>{module.title}</h3>
      </CardHeader>
      <CardContent>
        <p>{module.description}</p>
      </CardContent>
    </Card>
  );
}
```

### Extending Components

```tsx
// Don't modify shadcn components directly
// Create wrapper components instead

import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
}

export function LoadingButton({
  loading,
  children,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={loading || disabled} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
```

---

## Form Patterns

### With React Hook Form + Zod

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  gruendungskosten: z.string().min(1, 'Required'),
  anlaufkosten: z.string().min(1, 'Required'),
});

type FormData = z.infer<typeof formSchema>;

function KapitalbedarfForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gruendungskosten: '',
      anlaufkosten: '',
    },
  });

  const onSubmit = (data: FormData) => {
    // Process with decimal.js
    const gruendungskosten = parseGermanNumber(data.gruendungskosten);
    const anlaufkosten = parseGermanNumber(data.anlaufkosten);
    // ...
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## German Number Input

### Custom Input for Currency

```tsx
interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  id: string;
}

function CurrencyInput({ value, onChange, label, id }: CurrencyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers, dots, and commas
    const sanitized = e.target.value.replace(/[^0-9.,]/g, '');
    onChange(sanitized);
  };

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          className="pr-8"
          aria-label={label}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
          €
        </span>
      </div>
    </div>
  );
}
```

---

## Loading States

### Skeleton Pattern

```tsx
function ModuleCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}

function ModuleList() {
  const { data, isLoading } = useModules();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <ModuleCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((module) => (
        <ModuleCard key={module.id} module={module} />
      ))}
    </div>
  );
}
```

---

## Gotchas

### 1. Hydration Mismatch

```tsx
// ✗ WRONG - Different on server vs client
function Component() {
  return <div>{new Date().toLocaleString()}</div>;
}

// ✓ CORRECT - Use useEffect for client-only
function Component() {
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    setDate(new Date().toLocaleString());
  }, []);

  return <div>{date || 'Loading...'}</div>;
}
```

### 2. Event Handler Props

```tsx
// ✗ WRONG - Creates new function every render
<Button onClick={() => handleClick(id)}>Click</Button>

// ✓ CORRECT - Use useCallback
const handleClickMemo = useCallback(() => {
  handleClick(id);
}, [id]);

<Button onClick={handleClickMemo}>Click</Button>
```

### 3. Key Prop for Lists

```tsx
// ✗ WRONG - Using index as key
{items.map((item, index) => (
  <Item key={index} item={item} />
))}

// ✓ CORRECT - Use stable unique ID
{items.map((item) => (
  <Item key={item.id} item={item} />
))}
```

---

## Learnings Log

### 2026-01-19: Initial Setup

- Documented accessibility requirements
- Established Canvas Pattern for split-view
- Created German currency input pattern
