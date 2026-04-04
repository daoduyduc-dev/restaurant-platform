# Quick Start Guide - Component Library

## Installation & Setup

No installation needed! All components are already in your codebase.

## Basic Imports

```tsx
import {
  Button,
  Input,
  Textarea,
  Checkbox,
  Radio,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Modal,
  Badge,
  ToastContainer
} from '@/components/ui';
```

## Setup Toast Notifications

Add to your main layout:

```tsx
import { ToastContainer } from '@/components/ui';

export function App() {
  return (
    <>
      {/* Your routes/content */}
      <ToastContainer />
    </>
  );
}
```

## Common Patterns

### 1. Basic Button

```tsx
import { Button } from '@/components/ui';

<Button onClick={handleClick}>Click Me</Button>
<Button variant="primary" size="large">Large Primary</Button>
<Button variant="danger" disabled>Disabled</Button>
```

### 2. Form Input

```tsx
import { Input } from '@/components/ui';
import { Mail } from 'lucide-react';

const [email, setEmail] = useState('');

<Input
  type="email"
  label="Email"
  placeholder="user@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  icon={<Mail size={16} />}
  clearable
  onClear={() => setEmail('')}
/>
```

### 3. Form with Validation

```tsx
const [name, setName] = useState('');
const [error, setError] = useState('');

const handleChange = (value) => {
  setName(value);
  if (value.length < 2) {
    setError('Name must be at least 2 characters');
  } else {
    setError('');
  }
};

<Input
  label="Name"
  value={name}
  onChange={(e) => handleChange(e.target.value)}
  error={error}
  helperText={!error ? 'Enter your full name' : ''}
/>
```

### 4. Card Container

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui';

<Card variant="elevated">
  <CardHeader>
    <CardTitle>Restaurant Details</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Your content here</p>
  </CardContent>
  <CardFooter>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

### 5. Modal Dialog

```tsx
import { Modal } from '@/components/ui';
import { useState } from 'react';

const [isOpen, setIsOpen] = useState(false);

<>
  <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

  <Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    title="Confirm Action"
    size="medium"
    actions={
      <>
        <Button variant="secondary" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleConfirm}>
          Confirm
        </Button>
      </>
    }
  >
    <p>Are you sure you want to continue?</p>
  </Modal>
</>
```

### 6. Select Dropdown

```tsx
import { Select } from '@/components/ui';
import { useState } from 'react';

const [cuisine, setCuisine] = useState('');

<Select
  label="Choose Cuisine"
  options={[
    { label: 'Italian', value: 'italian' },
    { label: 'French', value: 'french' },
    { label: 'Japanese', value: 'japanese' },
    { label: 'Mexican', value: 'mexican' }
  ]}
  value={cuisine}
  onChange={setCuisine}
  placeholder="Select cuisine..."
/>
```

### 7. Checkboxes

```tsx
import { Checkbox } from '@/components/ui';
import { useState } from 'react';

const [agreed, setAgreed] = useState(false);

<Checkbox
  label="I agree to the terms"
  description="Please read our terms and conditions"
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
/>
```

### 8. Radio Buttons

```tsx
import { Radio } from '@/components/ui';
import { useState } from 'react';

const [option, setOption] = useState('opt1');

<div>
  <Radio
    label="Option 1"
    value="opt1"
    checked={option === 'opt1'}
    onChange={(e) => setOption(e.target.value)}
  />
  <Radio
    label="Option 2"
    value="opt2"
    checked={option === 'opt2'}
    onChange={(e) => setOption(e.target.value)}
  />
</div>
```

### 9. Badges

```tsx
import { Badge } from '@/components/ui';
import { CheckCircle2 } from 'lucide-react';

<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="info">Information</Badge>
<Badge variant="success" icon={<CheckCircle2 size={12} />}>
  Verified
</Badge>
```

### 10. Toasts (Notifications)

```tsx
import { useToastStore } from '@/store/toastStore';

const { addToast } = useToastStore();

// Success
addToast('Operation successful!', 'success');

// Error
addToast('Something went wrong', 'error');

// Warning
addToast('Please review this', 'warning');

// Info
addToast('Here is some information', 'info');
```

## Button Variants

```tsx
<Button variant="primary">Primary (Gold)</Button>
<Button variant="secondary">Secondary (White)</Button>
<Button variant="outline">Outline (Gold border)</Button>
<Button variant="danger">Danger (Red)</Button>
<Button variant="ghost">Ghost (Transparent)</Button>
```

## Button Sizes

```tsx
<Button size="small">Small Button</Button>
<Button size="medium">Medium Button</Button>
<Button size="large">Large Button</Button>
```

## Input Types

```tsx
<Input type="text" />
<Input type="email" />
<Input type="password" />
<Input type="number" />
<Input type="tel" />
<Input type="date" />
<Input type="time" />
```

## Card Variants

```tsx
<Card variant="default">Default Card</Card>
<Card variant="elevated">Elevated Card</Card>
<Card variant="bordered">Gold Bordered Card</Card>
```

## Modal Sizes

```tsx
<Modal size="small">Small Modal</Modal>
<Modal size="medium">Medium Modal</Modal>
<Modal size="large">Large Modal</Modal>
```

## Badge Variants

```tsx
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="neutral">Neutral</Badge>
```

## Color Reference

### Gold Theme
```
Primary:     #C5A033
Metallic:    #D4AF37
Light:       #E2C25D
Background:  #FDF6E3
```

### Teal Theme
```
Primary:     #0D9488
Dark:        #0F766E
Darker:      #134E4A
```

### Status Colors
```
Success:     #10B981 (Emerald)
Warning:     #F59E0B (Amber)
Error:       #EF4444 (Rose)
Info:        #3B82F6 (Blue)
```

## Tips & Tricks

### 1. Custom Styling
```tsx
<Button className="custom-class">Button</Button>
```

### 2. Using Icons
```tsx
import { Mail, Lock, AlertCircle } from 'lucide-react';

<Input icon={<Mail size={16} />} />
<Button><Lock size={20} /> Sign In</Button>
<Badge icon={<AlertCircle size={14} />}>Alert</Badge>
```

### 3. Form State Management
```tsx
const [form, setForm] = useState({
  name: '',
  email: '',
  message: ''
});

const handleChange = (field, value) => {
  setForm(prev => ({ ...prev, [field]: value }));
};

<Input
  value={form.name}
  onChange={(e) => handleChange('name', e.target.value)}
/>
```

### 4. Conditional Rendering
```tsx
<Button
  onClick={handleDelete}
  disabled={!hasDeletePermission}
  variant={isDangerous ? 'danger' : 'primary'}
>
  {isLoading ? 'Deleting...' : 'Delete'}
</Button>
```

### 5. Keyboard Shortcuts
```tsx
const handleKeyDown = (e) => {
  if (e.key === 'Enter' && e.ctrlKey) {
    handleSubmit();
  }
};

<Textarea onKeyDown={handleKeyDown} />
```

## Common Issues & Solutions

### Issue: Modal appears behind other elements
**Solution**: Check z-index of parent container, modals use z-index: 1000

### Issue: Input icons overlap text
**Solution**: Use `clearable` and `icon` props - they auto-adjust padding

### Issue: Select dropdown is cut off
**Solution**: Ensure parent container has `overflow: visible`

### Issue: Toast notifications not showing
**Solution**: Make sure `<ToastContainer />` is in your root layout

### Issue: Checkbox/Radio not checking
**Solution**: Ensure you're using `checked` and `onChange` props properly

## Performance Tips

1. **Memoize Callbacks**
   ```tsx
   const handleSubmit = useCallback(() => { ... }, []);
   ```

2. **Lazy Load Modals**
   ```tsx
   {isOpen && <Modal>...</Modal>}
   ```

3. **Use Keys in Lists**
   ```tsx
   {items.map(item => <Card key={item.id}>...</Card>)}
   ```

## Accessibility Features

All components include:
- ✅ ARIA labels and descriptions
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Proper semantic HTML
- ✅ Screen reader support
- ✅ Color contrast compliance

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## Getting Help

1. **Component Props**: Check component file imports and interfaces
2. **Examples**: See DEMO.tsx for usage examples
3. **Styling**: Refer to styles/components.css for CSS classes
4. **Documentation**: Read COMPONENT_LIBRARY.md for detailed guide

## Next Steps

1. Import components into your pages
2. Customize colors in frontend/src/index.css (CSS variables)
3. Use Toast notifications throughout your app
4. Combine components to build complex forms
5. Add custom CSS classes for additional styling

---

**Remember**: All components are production-ready and fully accessible!

For more details, see the full documentation in COMPONENT_LIBRARY.md
