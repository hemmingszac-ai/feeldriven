'use client'

import * as React from 'react'
import { createProfile } from './actions'
import { skillOptions, workTypeOptions } from './profile-options'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type ProfileSetupFormProps = {
  error?: string
}

type MultiComboboxFieldProps = {
  label: string
  name: string
  options: readonly string[]
  placeholder: string
}

function MultiComboboxField({
  label,
  name,
  options,
  placeholder,
}: MultiComboboxFieldProps) {
  const anchor = useComboboxAnchor()
  const [values, setValues] = React.useState<string[]>([])

  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Combobox
        multiple
        autoHighlight
        items={options}
        value={values}
        onValueChange={(nextValues) => setValues(nextValues as string[])}
      >
        <ComboboxChips ref={anchor} className="w-full">
          <ComboboxValue>
            {(selectedValues: string[]) => (
              <React.Fragment>
                {selectedValues.map((value) => (
                  <ComboboxChip key={value}>{value}</ComboboxChip>
                ))}
                <ComboboxChipsInput id={name} placeholder={placeholder} />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {values.map((value) => (
        <input key={value} type="hidden" name={name} value={value} />
      ))}
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

      <MultiComboboxField
        label="What skills do you want to develop?"
        name="skillsToDevelop"
        options={skillOptions}
        placeholder="Search skills..."
      />

      <MultiComboboxField
        label="What type of work do you enjoy most?"
        name="enjoyableWork"
        options={workTypeOptions}
        placeholder="Search work types..."
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
