<template>
  <div
    ref="container"
    class="flex-grow overflow-y-auto pr-2 terminal-output"
    v-html="content"
  ></div>
</template>

<script setup>
import { ref } from "vue";
const content = ref("");
const container = ref(null);

function appendHtml(html) {
  content.value += html;
  if (container.value) {
    container.value.scrollTop = container.value.scrollHeight;
  }
}

function clear() {
  content.value = "";
  if (container.value) container.value.scrollTop = 0;
}

defineExpose({ appendHtml, clear, container });
</script>
