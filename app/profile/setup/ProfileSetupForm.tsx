'use client'

import { KeyboardEvent, useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { createProfile } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const skillOptions = [
  'Accountability',
  'Active listening',
  'Adaptability',
  'Agile delivery',
  'AI literacy',
  'Analytical thinking',
  'API design',
  'Attention to detail',
  'Automation',
  'Budgeting',
  'Business analysis',
  'Change management',
  'Coaching',
  'Collaboration',
  'Communication',
  'Conflict resolution',
  'Content strategy',
  'Creativity',
  'Critical thinking',
  'Customer empathy',
  'Customer success',
  'Data analysis',
  'Data visualization',
  'Decision-making',
  'Delegation',
  'Design thinking',
  'Documentation',
  'Emotional intelligence',
  'Experiment design',
  'Facilitation',
  'Financial modeling',
  'Forecasting',
  'Growth strategy',
  'Influence',
  'Leadership',
  'Machine learning',
  'Mentoring',
  'Negotiation',
  'Operations management',
  'Performance management',
  'Presentation',
  'Prioritization',
  'Problem solving',
  'Product discovery',
  'Product management',
  'Project management',
  'Public speaking',
  'Quality assurance',
  'Research',
  'Resilience',
  'Risk management',
  'Sales',
  'Security awareness',
  'Service design',
  'Software engineering',
  'Stakeholder management',
  'Strategic planning',
  'Systems thinking',
  'Technical writing',
  'Time management',
  'UX design',
]

const workTypeOptions = [
  'Analytical work',
  'Creative work',
  'Customer-facing work',
  'Deep focus work',
  'Hands-on execution',
  'Leading teams',
  'Mentoring others',
  'Operational planning',
  'People-facing work',
  'Process improvement',
  'Product strategy',
  'Research and discovery',
  'Solving technical problems',
  'Storytelling and communication',
  'Systems design',
  'Teaching and enablement',
  'Troubleshooting',
  'Writing and documentation',
]

type ProfileSetupFormProps = {
  error?: string
}

type PillPickerProps = {
  label: string
  name: string
  options: string[]
  placeholder: string
}

function normalize(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function PillPicker({ label, name, options, placeholder }: PillPickerProps) {
  const [items, setItems] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.toLowerCase()

    return options
      .filter((option) => !items.includes(option))
      .filter((option) => option.toLowerCase().includes(normalizedQuery))
      .slice(0, 6)
  }, [items, options, query])

  const addItem = (value: string) => {
    const nextItem = normalize(value)

    if (!nextItem || items.includes(nextItem)) {
      setQuery('')
      return
    }

    setItems((currentItems) => [...currentItems, nextItem])
    setQuery('')
  }

  const removeItem = (item: string) => {
    setItems((currentItems) =>
      currentItems.filter((currentItem) => currentItem !== item)
    )
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addItem(query || filteredOptions[0] || '')
    }
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="grid gap-2 rounded-lg border border-input p-2 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
        <div className="flex min-h-8 flex-wrap gap-1.5">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex h-7 items-center gap-1 rounded-lg bg-secondary px-2 text-xs font-medium text-secondary-foreground"
            >
              {item}
              <button
                type="button"
                aria-label={`Remove ${item}`}
                className="rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => removeItem(item)}
              >
                <X className="size-3" />
              </button>
              <input type="hidden" name={name} value={item} />
            </span>
          ))}
          <Input
            id={name}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={items.length ? '' : placeholder}
            className="h-7 min-w-40 flex-1 border-0 px-1 shadow-none focus-visible:ring-0"
          />
        </div>
        {query ? (
          <div className="flex flex-wrap gap-1.5">
            {filteredOptions.map((option) => (
              <Button
                key={option}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addItem(option)}
              >
                <Check className="size-3" />
                {option}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function ProfileSetupForm({ error }: ProfileSetupFormProps) {
  return (
    <form action={createProfile} className="grid gap-5">
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" autoComplete="given-name" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" name="lastName" autoComplete="family-name" required />
        </div>
      </div>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Role</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {['Team Manager', 'Team Member'].map((role) => (
            <label
              key={role}
              className="group flex cursor-pointer items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="radio"
                name="role"
                value={role}
                required
                className={cn(
                  "size-4 rounded-full border border-input accent-primary"
                )}
              />
              {role}
            </label>
          ))}
        </div>
      </fieldset>

      <PillPicker
        label="What skills do you want to develop?"
        name="skillsToDevelop"
        options={skillOptions}
        placeholder="Type a skill, then press Enter"
      />

      <PillPicker
        label="What type of work do you enjoy most?"
        name="enjoyableWork"
        options={workTypeOptions}
        placeholder="Type a work style, then press Enter"
      />

      <div className="grid gap-2">
        <Label htmlFor="stretchProjects">
          What kind of projects would stretch you in a good way?
        </Label>
        <Textarea
          id="stretchProjects"
          name="stretchProjects"
          placeholder="Describe projects that would challenge you while still feeling energizing."
          required
        />
      </div>

      <Button type="submit" className="w-fit">
        Create profile
      </Button>
    </form>
  )
}
