<template>
  <div id="modal-window" class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50" :class="{ hidden: modalHidden }" @click.self="close">
    <div id="modal-container" class="bg-[#2a2d34] text-gray-200 rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
      <div class="bg-gray-800 p-4 rounded-t-lg flex justify-between items-center border-b border-gray-700">
        <h2 id="modal-title" class="text-lg font-bold font-sans flex items-center" v-html="title"></h2>
        <button id="modal-close-btn" class="text-gray-400 hover:text-white" @click="close"><i data-lucide="x" class="w-6 h-6"></i></button>
      </div>
      <div id="modal-content" class="p-6 overflow-y-auto font-sans" v-html="content"></div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
const props = defineProps({
  modalHidden: { type: Boolean, default: true },
  title: { type: String, default: "" },
  content: { type: String, default: "" },
});
const emit = defineEmits(["close"]);
const close = () => emit("close");
</script>
