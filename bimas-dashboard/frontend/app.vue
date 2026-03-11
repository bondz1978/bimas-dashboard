<template>
  <NuxtPage />
</template>

<script setup>
import { useConfig } from '~/composables/useConfig'
const { loadConfig } = useConfig()
onMounted(() => loadConfig())
</script>
