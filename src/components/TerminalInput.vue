<template>
  <div
    ref="inputLineRef"
    :id="inputLineId"
    :class="[
      'flex items-center mt-2 flex-shrink-0 transition-all duration-200',
      isFocused ? 'is-focused' : '', // Clase CSS para el 'brillo' de foco
    ]"
  >
    <span class="text-emerald-400 glow">manzzaano@host:~$</span>
    
    <div class="relative ml-2 flex-grow h-6">
      <div class="absolute inset-0 flex items-center whitespace-pre">
        <span id="input-text">{{ modelValue }}</span>
        <span class="bg-emerald-400 w-2 h-5 blink glow"></span>
      </div>

      <input
        ref="inputRefLocal"
        id="command-input"
        type="text"
        class="absolute inset-0 bg-transparent border-none text-transparent w-full outline-none caret-transparent"
        :value="modelValue"
        @input="onInputLocal"
        @keydown="onKeyDownLocal"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        autofocus
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import { defineProps, defineEmits, defineExpose } from "vue";

// --- Props y Emits (para v-model y eventos) ---
const props = defineProps({
  modelValue: { type: String, default: "" }, // El texto (v-model)
  isFocused: { type: Boolean, default: true }, // Estado de foco (del padre)
  inputLineId: { type: String, default: "input-line" },
});
const emit = defineEmits(["update:modelValue", "keydown", "input"]);

// --- Referencias Locales ---
const inputRefLocal = ref(null); // Ref al <input> real
const inputLineRef = ref(null); // Ref al <div> contenedor

// --- Métodos Expuestos ---
// El componente padre (TerminalWindow) necesita llamar a focus()
function focus() {
  nextTick(() => {
    // Asegura que el input real reciba el foco del navegador
    inputRefLocal.value && inputRefLocal.value.focus();
  });
}
// Exponer el método focus y las refs para el padre
defineExpose({ focus, inputRefLocal, inputLineRef });

// --- Manejadores de Eventos Locales ---
// Propagan los eventos al componente padre (TerminalWindow)

function onInputLocal(e) {
  emit("update:modelValue", e.target.value);
  emit("input", e);
}

function onKeyDownLocal(e) {
  // El padre (TerminalWindow) escuchará este @keydown
  // y lo pasará al composable (useTerminal)
  emit("keydown", e);
}

// --- Watchers ---
// Sincroniza el valor del <input> real si el v-model cambia desde el padre
// (por ejemplo, al usar las flechas de historial)
watch(
  () => props.modelValue,
  async () => {
    if (props.isFocused) {
      await nextTick();
      if (
        inputRefLocal.value &&
        inputRefLocal.value.value !== props.modelValue
      ) {
        // Actualización manual del valor del DOM del input
        inputRefLocal.value.value = props.modelValue;
      }
    }
  }
);

// Asegura el foco al cargar
nextTick(() => {
  if (props.isFocused) {
    focus();
  }
});
</script>