<script setup lang="ts">
import NeonButton from '../components/ui/NeonButton.vue'
</script>

<template>
  <div class="page">
    <div class="box">
      <div class="code">404</div>
      <div class="title">页面未找到</div>
      <div class="sub">访问路径需要以 /model_q 开头。</div>
      <div class="actions">
        <NeonButton as="a" href="/model_q/dashboard">返回概览</NeonButton>
        <NeonButton as="a" variant="ghost" href="/model_q/models">模型库</NeonButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  width: 100%;
  min-height: 60vh;
  display: grid;
  place-items: center;
}

.box {
  width: min(560px, 100%);
  padding: 26px;
  border-radius: 22px;
  border: 1px solid rgba(2, 6, 23, 0.08);
  background:
    radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.14), transparent 46%),
    radial-gradient(circle at 100% 0%, rgba(34, 211, 238, 0.14), transparent 50%),
    rgba(255, 255, 255, 0.8);
  box-shadow: 0 34px 80px rgba(2, 6, 23, 0.08);
  text-align: center;
}

.code {
  font-size: 54px;
  font-weight: 900;
  letter-spacing: 2px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 1), rgba(34, 211, 238, 1), rgba(236, 72, 153, 0.95));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.title {
  margin-top: 10px;
  font-weight: 860;
  font-size: 18px;
}

.sub {
  margin-top: 8px;
  color: var(--c-muted);
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 16px;
}
</style>

