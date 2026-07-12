import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

/**
 * A reusable Tabs component wrapper for standard Shadcn UI Tabs.
 * 
 * @param {Object} props
 * @param {Array<{value: string, label: React.ReactNode, content: React.ReactNode, disabled?: boolean}>} props.tabs - Array of tab objects.
 * @param {string} [props.defaultValue] - The default active tab value.
 * @param {string} [props.value] - The controlled active tab value.
 * @param {Function} [props.onValueChange] - Callback when the active tab changes.
 * @param {string} [props.className] - ClassName for the outer container.
 * @param {string} [props.listClassName] - ClassName for the TabsList.
 * @param {string} [props.triggerClassName] - ClassName for individual TabsTrigger.
 * @param {string} [props.contentClassName] - ClassName for individual TabsContent.
 */
export function ReusableTabs({
  tabs = [],
  defaultValue,
  value,
  onValueChange,
  className,
  listClassName,
  triggerClassName,
  contentClassName,
  ...props
}) {
  if (!tabs?.length) return null

  // If no defaultValue or value is provided, default to the first tab's value
  const effectiveDefaultValue = defaultValue || (!value && tabs[0]?.value) || undefined

  return (
    <Tabs
      defaultValue={effectiveDefaultValue}
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
      {...props}
    >
      <TabsList 
        className={cn("w-full justify-start rounded-none border-b border-border bg-transparent p-0", listClassName)}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={cn(
              "relative h-10 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-active:border-b-[var(--border-accent)] data-active:text-[var(--text-accent)] data-active:shadow-none hover:text-foreground",
              triggerClassName
            )}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className={cn("mt-6 outline-none", contentClassName)}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
