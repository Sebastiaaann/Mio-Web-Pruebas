<script setup>
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

defineProps({
  open: { type: Boolean, default: false },
  control: { type: Object, default: () => ({}) }
})

defineEmits(['update:open', 'submit'])
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Control Simple</DialogTitle>
      </DialogHeader>
      <div class="p-4">
        Test Content
      </div>
      <Button @click="$emit('update:open', false)">Cerrar</Button>
    </DialogContent>
  </Dialog>
</template>
