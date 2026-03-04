<script setup lang="ts">
import { Primitive } from "reka-ui";
import { cn } from "@/lib/utils";
import { buttonVariants } from ".";

const props = defineProps<{
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  class?: string
  asChild?: boolean
  as?: string | object
  disabled?: boolean
  onClick?: (event: MouseEvent) => void
}>();
</script>

<template>
  <Primitive
    v-bind="{ 'data-slot': 'button', disabled: props.disabled, ...$attrs }"
    :as="as ?? 'button'"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </Primitive>
</template>
