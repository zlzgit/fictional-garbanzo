<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: 'button' | 'a'
    href?: string
    target?: string
    rel?: string
    variant?: 'primary' | 'ghost'
    size?: 'sm' | 'md'
    disabled?: boolean
  }>(),
  {
    as: 'button',
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
)
</script>

<template>
  <component
    :is="as"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`]"
    :href="as === 'a' ? href : undefined"
    :target="as === 'a' ? target : undefined"
    :rel="as === 'a' ? rel : undefined"
    :disabled="as === 'button' ? disabled : undefined"
  >
    <slot />
  </component>
</template>

<style scoped>
.btn {
  appearance: none;
  border: none;
  outline: none;
  font: inherit;
  cursor: pointer;
  border-radius: 14px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 160ms ease, box-shadow 160ms ease, background 220ms ease, border-color 220ms ease;
  user-select: none;
  white-space: nowrap;
}

.btn--md {
  padding: 10px 12px;
  font-weight: 700;
  font-size: 13px;
}

.btn--sm {
  padding: 8px 10px;
  font-weight: 700;
  font-size: 12px;
}

.btn--primary {
  color: white;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.3), transparent 40%),
    linear-gradient(135deg, rgba(99, 102, 241, 1), rgba(34, 211, 238, 0.92), rgba(236, 72, 153, 0.9));
  box-shadow: 0 16px 30px rgba(99, 102, 241, 0.22);
}

.btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 24px 38px rgba(99, 102, 241, 0.28);
}

.btn--ghost {
  color: rgba(2, 6, 23, 0.88);
  border: 1px solid rgba(2, 6, 23, 0.1);
  background: rgba(255, 255, 255, 0.72);
}

.btn--ghost:hover {
  transform: translateY(-1px);
  border-color: rgba(99, 102, 241, 0.35);
  box-shadow: 0 18px 30px rgba(2, 6, 23, 0.06);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>

