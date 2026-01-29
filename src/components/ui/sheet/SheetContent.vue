<script setup>
import { DialogClose, DialogContent, DialogOverlay, DialogPortal } from "reka-ui";
import { X } from "lucide-vue-next";
import { cn } from "@/lib/utils";

const props = defineProps({
  side: { type: String, default: "right" },
  class: { type: String, default: "" },
});

const emit = defineEmits(["closeAutoFocus"]);

const sheetVariants = {
  top: "inset-x-0 top-0 border-b",
  bottom: "inset-x-0 bottom-0 border-t",
  left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
  right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-[450px]",
};
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
    />
    <DialogContent
      :class="cn(
        'fixed z-50 gap-4 bg-white shadow-lg transition-transform duration-300 ease-in-out',
        sheetVariants[side],
        props.class
      )"
      @closeAutoFocus="emit('closeAutoFocus')"
    >
      <slot />
      
      <DialogClose
        class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
      >
        <X class="h-4 w-4" />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
