/**
 * Component Library Demo
 * Showcases all components with common use cases
 */

import React, { useState } from 'react';
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
  Badge,
  Modal,
  ToastContainer
} from '@/components/ui';
import { Mail, Lock, Star, AlertCircle } from 'lucide-react';

export function ComponentLibraryDemo() {
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [description, setDescription] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [contactMethod, setContactMethod] = useState('email');
  const [cuisine, setCuisine] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <ToastContainer />

      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Component Library</h1>

      {/* Buttons */}
      <Card style={{ marginBottom: '2rem' }}>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="danger">Danger Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="primary" size="small">Small</Button>
            <Button variant="primary" size="large">Large</Button>
            <Button variant="primary" isLoading>Loading</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Inputs */}
      <Card style={{ marginBottom: '2rem' }}>
        <CardHeader>
          <CardTitle>Form Inputs</CardTitle>
        </CardHeader>
        <CardContent style={{ display: 'grid', gap: '1.5rem' }}>
          <Input
            type="email"
            label="Email Address"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={16} />}
            clearable
            onClear={() => setEmail('')}
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={16} />}
          />

          <Input
            type="text"
            label="With Error"
            placeholder="This has an error"
            error="This field is required"
          />

          <Input
            type="text"
            label="With Success"
            placeholder="This is valid"
            success
          />

          <Textarea
            label="Description"
            placeholder="Enter your description here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={200}
            showCharCount
          />
        </CardContent>
      </Card>

      {/* Checkboxes */}
      <Card style={{ marginBottom: '2rem' }}>
        <CardHeader>
          <CardTitle>Checkboxes</CardTitle>
        </CardHeader>
        <CardContent style={{ display: 'grid', gap: '1rem' }}>
          <Checkbox
            label="Subscribe to newsletter"
            checked={isSubscribed}
            onChange={(e) => setIsSubscribed(e.target.checked)}
          />

          <Checkbox
            label="I agree to terms"
            description="Read our terms and conditions"
            checked={isSubscribed}
            onChange={(e) => setIsSubscribed(e.target.checked)}
          />

          <Checkbox
            label="Disabled checkbox"
            disabled
          />
        </CardContent>
      </Card>

      {/* Radio Buttons */}
      <Card style={{ marginBottom: '2rem' }}>
        <CardHeader>
          <CardTitle>Radio Buttons</CardTitle>
        </CardHeader>
        <CardContent style={{ display: 'grid', gap: '1rem' }}>
          <Radio
            label="Contact via Email"
            value="email"
            checked={contactMethod === 'email'}
            onChange={(e) => setContactMethod(e.target.value)}
          />

          <Radio
            label="Contact via Phone"
            value="phone"
            checked={contactMethod === 'phone'}
            onChange={(e) => setContactMethod(e.target.value)}
          />

          <Radio
            label="Disabled option"
            value="disabled"
            disabled
          />
        </CardContent>
      </Card>

      {/* Select Dropdown */}
      <Card style={{ marginBottom: '2rem' }}>
        <CardHeader>
          <CardTitle>Select Dropdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            label="Choose Cuisine"
            options={[
              { label: 'Italian', value: 'italian' },
              { label: 'French', value: 'french' },
              { label: 'Japanese', value: 'japanese' },
              { label: 'Mexican', value: 'mexican' },
              { label: 'Thai', value: 'thai' }
            ]}
            value={cuisine}
            onChange={setCuisine}
            placeholder="Select a cuisine..."
          />
        </CardContent>
      </Card>

      {/* Badges */}
      <Card style={{ marginBottom: '2rem' }}>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Badge variant="success">Active</Badge>
            <Badge variant="warning">Pending</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="success" size="small" icon={<Star size={12} />}>
              Featured
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card variant="default">
          <CardHeader>
            <CardTitle>Default Card</CardTitle>
          </CardHeader>
          <CardContent>
            This is a standard card with a border.
          </CardContent>
          <CardFooter>
            <Button variant="ghost">Action</Button>
          </CardFooter>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Elevated Card</CardTitle>
          </CardHeader>
          <CardContent>
            This card has a shadow for elevation.
          </CardContent>
          <CardFooter>
            <Button variant="ghost">Action</Button>
          </CardFooter>
        </Card>

        <Card variant="bordered" hover>
          <CardHeader>
            <CardTitle>Bordered & Hover</CardTitle>
          </CardHeader>
          <CardContent>
            This card has a gold border and hover effect.
          </CardContent>
          <CardFooter>
            <Button variant="ghost">Action</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Modal */}
      <Card style={{ marginBottom: '2rem' }}>
        <CardHeader>
          <CardTitle>Modal Dialog</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setModalOpen(true)}>
            Open Modal
          </Button>
        </CardContent>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirm Action"
        size="medium"
        actions={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>
              Confirm
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <AlertCircle size={24} color="var(--amber)" />
          <div>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
              Are you sure?
            </p>
            <p style={{ color: 'var(--text-muted)' }}>
              This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>

      {/* Toasts (trigger from buttons) */}
      <Card>
        <CardHeader>
          <CardTitle>Toast Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={() => {
              // Assuming you have access to toast store
              console.log('Success toast would show');
            }}>
              Success Toast
            </Button>
            <Button variant="danger" onClick={() => {
              console.log('Error toast would show');
            }}>
              Error Toast
            </Button>
            <Button variant="outline" onClick={() => {
              console.log('Warning toast would show');
            }}>
              Warning Toast
            </Button>
            <Button variant="secondary" onClick={() => {
              console.log('Info toast would show');
            }}>
              Info Toast
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ComponentLibraryDemo;
