# Restaurant Platform Component Library

A comprehensive, production-ready React component library built with TypeScript, Framer Motion, and a Michelin-grade aesthetic.

## Design System

### Color Palette

**Primary (Gold)**
- `#D4AF37` - Metallic Gold
- `#C5A033` - Vibrant Gold (Primary)
- `#E2C25D` - Light Gold

**Secondary (Teal)**
- `#0D9488` - Teal
- `#0F766E` - Dark Teal
- `#134E4A` - Darker Teal

**Status Colors**
- **Success**: `#10B981` (Emerald)
- **Warning**: `#F59E0B` (Amber)
- **Error**: `#EF4444` (Rose)
- **Info**: `#3B82F6` (Blue)

**Neutrals**
- Light Background: `#F5F3FF`
- Dark Text: `#2D2F4D`
- Borders: `#E5E7EB` (light), `#D1D5DB` (medium), `#9CA3AF` (dark)

### Typography

- **Headings**: Playfair Display (serif), 24-32px
- **Body**: Inter (sans-serif), 14-16px
- **Code**: Monospace, 12-14px

## Components

### Button

Reusable button component with multiple variants and sizes.

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="medium">
  Click me
</Button>
```

**Props:**
- `variant`: `'primary'` | `'secondary'` | `'outline'` | `'danger'` | `'ghost'` (default: `'primary'`)
- `size`: `'small'` | `'medium'` | `'large'` (default: `'medium'`)
- `isLoading`: `boolean` - Shows loading spinner
- `disabled`: `boolean` - Disables the button
- `children`: `React.ReactNode`
- `className`: `string` - Additional classes

### Input

Form input with validation states and icons.

```tsx
import { Input } from '@/components/ui';

<Input
  type="email"
  label="Email"
  placeholder="user@example.com"
  error={emailError}
  icon={<Mail size={16} />}
  clearable
  onClear={() => setEmail('')}
/>
```

**Props:**
- `type`: `'text'` | `'email'` | `'password'` | `'number'` | `'tel'` | `'date'` | `'time'`
- `label`: `string` - Input label
- `placeholder`: `string` - Placeholder text
- `value`: `string` | `number`
- `onChange`: `(e: ChangeEvent<HTMLInputElement>) => void`
- `error`: `string` - Error message (shows error state)
- `success`: `boolean` - Success state
- `disabled`: `boolean`
- `icon`: `React.ReactNode` - Icon to display in input
- `clearable`: `boolean` - Show clear button for text inputs
- `onClear`: `() => void` - Clear button callback

### Textarea

Multi-line text input with character count support.

```tsx
import { Textarea } from '@/components/ui';

<Textarea
  label="Description"
  placeholder="Enter your thoughts..."
  maxLength={500}
  showCharCount
  rows={5}
/>
```

**Props:**
- `label`: `string`
- `placeholder`: `string`
- `value`: `string`
- `onChange`: `(e: ChangeEvent<HTMLTextAreaElement>) => void`
- `rows`: `number` - Number of rows
- `maxLength`: `number`
- `error`: `string`
- `success`: `boolean`
- `disabled`: `boolean`
- `showCharCount`: `boolean` - Display character count
- `helperText`: `string`

### Checkbox

Accessible checkbox input with optional description.

```tsx
import { Checkbox } from '@/components/ui';

<Checkbox
  label="I agree to terms"
  description="Read our terms and conditions"
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
/>
```

**Props:**
- `label`: `string` - Checkbox label
- `description`: `string` - Helper description
- `checked`: `boolean`
- `onChange`: `(e: ChangeEvent<HTMLInputElement>) => void`
- `disabled`: `boolean`
- `className`: `string`

### Radio

Accessible radio button input.

```tsx
import { Radio } from '@/components/ui';

<Radio
  label="Option 1"
  value="opt1"
  checked={selected === 'opt1'}
  onChange={(e) => setSelected(e.target.value)}
/>
```

**Props:**
- `label`: `string` - Radio label
- `value`: `string` | `number`
- `description`: `string` - Helper description
- `checked`: `boolean`
- `onChange`: `(e: ChangeEvent<HTMLInputElement>) => void`
- `disabled`: `boolean`
- `className`: `string`

### Select

Dropdown select with keyboard navigation and option groups.

```tsx
import { Select } from '@/components/ui';

const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' }
];

<Select
  options={options}
  value={selected}
  onChange={setSelected}
  placeholder="Choose an option"
  error={error}
/>
```

**Props:**
- `options`: `(SelectOption | SelectGroup)[]` - Options or grouped options
- `value`: `string` | `number` - Selected value
- `onChange`: `(value: string | number) => void`
- `placeholder`: `string` (default: `'Select an option...'`)
- `disabled`: `boolean`
- `error`: `string`
- `label`: `string`

**Keyboard Support:**
- `ArrowUp/Down` - Navigate options
- `Enter/Space` - Select option
- `Escape` - Close menu

### Card

Flexible container component with header, content, and footer sections.

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui';

<Card variant="elevated" hover>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    Footer
  </CardFooter>
</Card>
```

**Props (Card):**
- `variant`: `'default'` | `'elevated'` | `'bordered'` (default: `'default'`)
- `hover`: `boolean` - Enable hover effect
- `onClick`: `() => void`
- `children`: `React.ReactNode`
- `className`: `string`

### Badge

Status badge component for labels and tags.

```tsx
import { Badge } from '@/components/ui';

<Badge variant="success" size="medium">
  Active
</Badge>
```

**Props:**
- `variant`: `'success'` | `'warning'` | `'error'` | `'info'` | `'neutral'` (default: `'neutral'`)
- `size`: `'small'` | `'medium'` (default: `'medium'`)
- `icon`: `React.ReactNode`
- `children`: `React.ReactNode`
- `className`: `string`

### Modal

Dialog modal with backdrop and keyboard support.

```tsx
import { Modal } from '@/components/ui';

<Modal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Confirm Action"
  size="medium"
  actions={
    <>
      <Button variant="secondary" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleConfirm}>
        Confirm
      </Button>
    </>
  }
>
  Are you sure?
</Modal>
```

**Props:**
- `isOpen`: `boolean`
- `onClose`: `() => void`
- `title`: `string`
- `children`: `React.ReactNode`
- `size`: `'small'` | `'medium'` | `'large'` (default: `'medium'`)
- `actions`: `React.ReactNode` - Footer action buttons
- `closeOnEscape`: `boolean` (default: `true`)
- `closeOnBackdropClick`: `boolean` (default: `true`)

### Toast/ToastContainer

Notification toasts that auto-dismiss.

```tsx
import { ToastContainer } from '@/components/ui';
import { useToastStore } from '@/store/toastStore';

// In your root layout
<ToastContainer />

// In a component
const { addToast } = useToastStore();

addToast('Success!', 'success');
addToast('Error occurred', 'error');
addToast('Warning', 'warning');
addToast('Info', 'info');
```

**Features:**
- Auto-dismiss after 4 seconds
- Manual close button
- Stack multiple toasts
- Smooth animations
- Status colors: success, error, warning, info

## Styling

All components use CSS variables for theming. Custom styles can be applied via the `className` prop.

### CSS Classes (BEM Naming)

Components use BEM (Block Element Modifier) naming:

```
.btn { }              /* Button block */
.btn-primary { }      /* Button modifier */
.btn-lg { }           /* Button size modifier */

.input-field { }      /* Input field element */
.input-error { }      /* Error modifier */

.card { }             /* Card block */
.card-header { }      /* Header element */
.card-elevated { }    /* Elevated variant */
```

## Accessibility

All components include:
- ✅ ARIA labels and descriptions
- ✅ Keyboard navigation support
- ✅ Focus states
- ✅ Disabled states
- ✅ Error announcements
- ✅ Semantic HTML
- ✅ WCAG AA color contrast

## Animations

- **Hover Effects**: Smooth transitions and elevation
- **Loading States**: Spinning icon with disabled state
- **Modal/Toast**: Spring animations with backdrop fade
- **Transitions**: Using Framer Motion for smooth interactions

## Usage Example

```tsx
import { Button, Input, Card, CardContent, Modal, Badge, ToastContainer } from '@/components/ui';
import { useState } from 'react';

export function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <div>
      <ToastContainer />

      <Card>
        <CardContent>
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />

          <Badge variant="info" style={{ marginTop: '1rem' }}>
            Required field
          </Badge>

          <Button
            onClick={() => setIsModalOpen(true)}
            style={{ marginTop: '1rem' }}
          >
            Submit
          </Button>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm"
        actions={
          <Button onClick={() => setIsModalOpen(false)}>
            Close
          </Button>
        }
      >
        Ready to submit?
      </Modal>
    </div>
  );
}
```

## TypeScript Support

All components are fully typed with TypeScript interfaces.

```tsx
import type { ButtonProps, InputProps, SelectProps } from '@/components/ui';

const props: ButtonProps = {
  variant: 'primary',
  size: 'large',
  onClick: () => console.log('clicked')
};
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Performance

- Minimal re-renders with proper memo usage
- Optimized animations with Framer Motion
- CSS classes instead of inline styles where possible
- Event delegation for better memory usage

## File Structure

```
frontend/src/components/ui/
├── Button.tsx           # Primary button component
├── Input.tsx            # Text input with validation
├── Textarea.tsx         # Multi-line input
├── Checkbox.tsx         # Checkbox input
├── Radio.tsx            # Radio button input
├── Select.tsx           # Dropdown select
├── Card.tsx             # Container card
├── Modal.tsx            # Dialog modal
├── Badge.tsx            # Status badge
├── Toast.tsx            # Notification toasts
└── index.ts             # Component exports

frontend/src/styles/
├── components.css       # All component styles
└── (index.css)          # Global styles + CSS variables
```

## Contributing

When adding new components:

1. Create a new `.tsx` file in `components/ui/`
2. Add TypeScript interfaces for all props
3. Include ARIA labels and keyboard support
4. Add CSS to `styles/components.css` using BEM naming
5. Export from `index.ts`
6. Update this documentation

## License

Part of the Restaurant Platform project.
