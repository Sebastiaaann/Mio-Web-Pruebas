<script setup>
import { DialogTrigger } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps({
  asChild: { type: Boolean, default: false },
});
</script>

<template>
  <DialogTrigger v-bind="props" :class="cn('', $attrs.class)">
    <slot />
  </DialogTrigger>
</template>
