<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <section class="card">
    <header v-if="title || subtitle" class="card__head">
      <div class="card__titleRow">
        <h2 v-if="title" class="card__title">{{ title }}</h2>
        <div v-if="$slots.actions" class="card__actions">
          <slot name="actions" />
        </div>
      </div>
      <div v-if="subtitle" class="card__subtitle">{{ subtitle }}</div>
    </header>

    <div class="card__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.card {
  width: 100%;
  border-radius: 18px;
  border: 1px solid rgba(2, 6, 23, 0.08);
  background:
    radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.12), transparent 38%),
    radial-gradient(circle at 100% 0%, rgba(34, 211, 238, 0.14), transparent 46%),
    radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.1), transparent 46%),
    rgba(255, 255, 255, 0.78);
  box-shadow: 0 26px 60px rgba(2, 6, 23, 0.06);
  overflow: hidden;
}

.card__head {
  padding: 16px 16px 0 16px;
}

.card__titleRow {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 760;
  letter-spacing: 0.2px;
}

.card__subtitle {
  margin-top: 6px;
  font-size: 12px;
  color: var(--c-muted);
}

.card__body {
  padding: 16px;
}

.card__actions :deep(button),
.card__actions :deep(a) {
  margin-left: 8px;
}
</style>

