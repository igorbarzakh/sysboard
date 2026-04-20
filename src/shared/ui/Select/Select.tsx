'use client'

import * as React from 'react'
import { Select as SelectPrimitive } from '@base-ui/react/select'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import styles from './Select.module.scss'

export interface SelectOption<Value extends string> {
  value: Value
  label: React.ReactNode
  disabled?: boolean
}

export interface SelectOptionGroup<Value extends string> {
  label?: React.ReactNode
  options: Array<SelectOption<Value>>
}

interface SelectBaseProps<Value extends string> {
  options: Array<SelectOption<Value> | SelectOptionGroup<Value>>
  disabled?: boolean
  placeholder?: React.ReactNode
  triggerClassName?: string
  contentClassName?: string
  align?: SelectPrimitive.Positioner.Props['align']
  alignOffset?: SelectPrimitive.Positioner.Props['alignOffset']
  alignItemWithTrigger?: SelectPrimitive.Positioner.Props['alignItemWithTrigger']
  side?: SelectPrimitive.Positioner.Props['side']
  sideOffset?: SelectPrimitive.Positioner.Props['sideOffset']
}

interface SelectSingleProps<
  Value extends string,
> extends SelectBaseProps<Value> {
  value: Value
  onChange: (value: Value) => void
  renderValue?: (value: Value) => React.ReactNode
}

interface SelectMultipleProps<
  Value extends string,
> extends SelectBaseProps<Value> {
  value: Value[]
  onChange: (value: Value[]) => void
  renderValue?: (value: Value[]) => React.ReactNode
}

type SelectProps<Value extends string> =
  | SelectSingleProps<Value>
  | SelectMultipleProps<Value>

function isOptionGroup<Value extends string>(
  item: SelectOption<Value> | SelectOptionGroup<Value>,
): item is SelectOptionGroup<Value> {
  return 'options' in item
}

function getSelectedLabels<Value extends string>(
  options: Array<SelectOption<Value> | SelectOptionGroup<Value>>,
  selected: Value[],
) {
  const labels = new Map<Value, React.ReactNode>()

  options.forEach((item) => {
    if (isOptionGroup(item)) {
      item.options.forEach((option) => labels.set(option.value, option.label))
      return
    }

    labels.set(item.value, item.label)
  })

  return selected
    .map((selectedValue) => labels.get(selectedValue) ?? selectedValue)
    .join(' · ')
}

export function Select<Value extends string>({
  value,
  options,
  onChange,
  disabled,
  placeholder,
  renderValue,
  triggerClassName,
  contentClassName,
  align = 'start',
  alignOffset = 0,
  alignItemWithTrigger = false,
  side = 'bottom',
  sideOffset = 4,
}: SelectProps<Value>) {
  const popup = (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        className={styles.positioner}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        side={side}
        sideOffset={sideOffset}
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={[styles.popup, contentClassName].filter(Boolean).join(' ')}
        >
          {options.map((item) => {
            if (isOptionGroup(item)) {
              const key =
                typeof item.label === 'string'
                  ? item.label
                  : item.options[0]?.value

              return (
                <SelectPrimitive.Group key={key} className={styles.group}>
                  {item.label ? (
                    <SelectPrimitive.GroupLabel className={styles.groupLabel}>
                      {item.label}
                    </SelectPrimitive.GroupLabel>
                  ) : null}
                  {item.options.map((option, optionIndex) => (
                    <SelectPrimitive.Item
                      key={`${key}-${option.value}-${optionIndex}`}
                      value={option.value}
                      disabled={option.disabled}
                      className={styles.item}
                    >
                      <SelectPrimitive.ItemText>
                        {option.label}
                      </SelectPrimitive.ItemText>
                      <SelectPrimitive.ItemIndicator
                        className={styles.itemIndicator}
                      >
                        <CheckIcon />
                      </SelectPrimitive.ItemIndicator>
                    </SelectPrimitive.Item>
                  ))}
                </SelectPrimitive.Group>
              )
            }

            return (
              <SelectPrimitive.Item
                key={item.value}
                value={item.value}
                disabled={item.disabled}
                className={styles.item}
              >
                <SelectPrimitive.ItemText>
                  {item.label}
                </SelectPrimitive.ItemText>
                <span className={styles.itemIndicator}>
                  <SelectPrimitive.ItemIndicator>
                    <CheckIcon />
                  </SelectPrimitive.ItemIndicator>
                </span>
              </SelectPrimitive.Item>
            )
          })}
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )

  if (Array.isArray(value)) {
    const selectedValue = value

    return (
      <SelectPrimitive.Root<Value, true>
        data-slot="select"
        multiple
        value={selectedValue}
        onValueChange={onChange as (value: Value[]) => void}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          data-slot="select-trigger"
          className={[styles.trigger, triggerClassName]
            .filter(Boolean)
            .join(' ')}
        >
          <SelectPrimitive.Value
            className={styles.value}
            placeholder={placeholder}
          >
            {() =>
              (
                renderValue as ((value: Value[]) => React.ReactNode) | undefined
              )?.(selectedValue) ?? getSelectedLabels(options, selectedValue)
            }
          </SelectPrimitive.Value>
          <SelectPrimitive.Icon className={styles.icon}>
            <ChevronDownIcon />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        {popup}
      </SelectPrimitive.Root>
    )
  }

  const handleSingleChange = onChange as (value: Value) => void

  return (
    <SelectPrimitive.Root<Value>
      data-slot="select"
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) {
          handleSingleChange(nextValue)
        }
      }}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        data-slot="select-trigger"
        className={[styles.trigger, triggerClassName].filter(Boolean).join(' ')}
      >
        <SelectPrimitive.Value
          className={styles.value}
          placeholder={placeholder}
        >
          {() =>
            (renderValue as ((value: Value) => React.ReactNode) | undefined)?.(
              value,
            ) ?? getSelectedLabels(options, [value])
          }
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon className={styles.icon}>
          <ChevronDownIcon />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      {popup}
    </SelectPrimitive.Root>
  )
}
