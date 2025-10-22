<template>
  <div
    class="bg-[#1a1b26] text-gray-300 flex items-center justify-center min-h-screen p-4"
  >
    <div
      id="window"
      class="w-full max-w-4xl h-[90vh] bg-black bg-opacity-75 rounded-xl shadow-2xl flex flex-col backdrop-blur-sm border border-gray-700 relative"
    >
      <div
        class="bg-gray-800 rounded-t-xl p-3 flex items-center gap-2 border-b border-gray-700 flex-shrink-0 z-10"
      >
        <div class="w-3 h-3 bg-red-500 rounded-full"></div>
        <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
      </div>

      <div
        id="terminal"
        class="p-4 md:p-6 flex-grow flex flex-col overflow-hidden z-10"
        @click="focusInput"
      >
        <TerminalOutput ref="outputComponent" />
        
        <TerminalInput
          ref="inputComponent"
          v-model="inputText"
          :isFocused="isFocused"
          :inputLineId="'input-line'"
          @keydown="onKeyDown"
        />
      </div>
    </div>

    <Modal
      :modalHidden="modalHidden"
      :title="modalTitle"
      :content="modalContent"
      @close="closeWindow"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import TerminalOutput from "./TerminalOutput.vue";
import TerminalInput from "./TerminalInput.vue";
import Modal from "./Modal.vue";
// Importamos el composable con toda la lógica
import { useTerminal } from "../composables/useTerminal";

// --- Referencias a Componentes Hijos ---
// Necesarias para que el composable pueda interactuar con ellos (ej: outputRef.value.appendHtml())
const outputComponent = ref(null);
const inputComponent = ref(null);
// Ref al *elemento* HTML de la línea de input (para estilado de foco)
const inputLineRef = ref(null);

// --- Instancia del Composable ---
// Desestructuramos toda la lógica y el estado desde useTerminal
const {
  inputText,
  isFocused,
  modalHidden,
  modalTitle,
  modalContent,
  onKeyDown, // Manejador de teclado que se pasa a TerminalInput
  loadContentAndInit, // Función de inicialización
  onDocumentKeyDown, // Manejador global (para 'Escape')
  focusInput, // Función para forzar foco
  closeWindow, // Función para cerrar modal
} = useTerminal({
  outputRef: outputComponent, // Pasamos las refs al composable
  inputRef: inputComponent,
  inputLineRef,
});

// --- Ciclo de Vida ---
onMounted(() => {
  // Registrar listener global para la tecla 'Escape'
  document.addEventListener("keydown", onDocumentKeyDown);

  // Esperar a que el DOM esté renderizado
  nextTick(() => {
    // Asignar la referencia al elemento HTML del input (inputLineRef)
    // Esto es complejo porque inputComponent (TerminalInput) expone sus propias refs
    if (inputComponent.value) {
      if (inputComponent.value.inputLineRef) {
        // Si expone la ref del contenedor
        inputLineRef.value = inputComponent.value.inputLineRef;
      } else if (inputComponent.value.inputRefLocal) {
        // Fallback (aunque menos ideal para el estilo)
        inputLineRef.value = inputComponent.value.inputRefLocal;
      }

      // Intentar enfocar el input al montar
      // Se usa un try/catch por si la ref aún no está lista
      try {
        if (typeof inputComponent.value.focus === "function") {
          inputComponent.value.focus();
        }
      } catch (e) {}
    }

    // Cargar contenido (traducciones, etc.) e imprimir bienvenida
    loadContentAndInit();
  });

  // Un segundo intento de foco (fallback)
  setTimeout(() => {
    try {
      if (
        inputComponent.value &&
        typeof inputComponent.value.focus === "function"
      )
        inputComponent.value.focus();
    } catch (e) {}
  }, 120);
});

// Limpieza al desmontar el componente
onBeforeUnmount(() => {
  document.removeEventListener("keydown", onDocumentKeyDown);
});
</script>