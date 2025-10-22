import { ref, nextTick } from "vue";
import {
  windowCommands,
  terminalCommandsList,
  allCommands,
} from "../constants/commands";
import { loadContentJson } from "../services/contentService";
import { escapeHtml } from "../utils/escapeHtml";

/**
 * Composable para gestionar toda la lógica de la terminal.
 * @param {object} refs - Referencias a componentes y elementos del DOM.
 * @param {import('vue').Ref<object|null>} refs.outputRef - Ref al componente TerminalOutput.
 * @param {import('vue').Ref<object|null>} refs.inputRef - Ref al componente TerminalInput.
 * @param {import('vue').Ref<HTMLElement|null>} refs.inputLineRef - Ref al elemento contenedor de la línea de input.
 */
export function useTerminal({ outputRef, inputRef, inputLineRef }) {
  // --- Estado Reactivo ---
  const inputText = ref(""); // El texto actual en el input
  const isFocused = ref(true); // Estado de foco de la terminal

  // --- Estado del Modal ---
  const modalHidden = ref(true);
  const modalTitle = ref("");
  const modalContent = ref("");

  // --- Historial de Comandos ---
  let commandHistory = [];
  let historyIndex = -1; // -1 = nuevo comando, 0 = último, etc.

  // --- Internacionalización (i18n) ---
  const getInitialLang = () => {
    const savedLang = localStorage.getItem("portfolioLang");
    return savedLang === "en" || savedLang === "es" ? savedLang : "en";
  };
  let currentLang = getInitialLang();
  const translations = ref({});

  /**
   * Obtiene el texto traducido para una clave específica.
   * @param {string} key - Clave de traducción (ej: "welcome_title").
   * @returns {string} - Texto traducido o la clave si no se encuentra.
   */
  const getText = (key) =>
    (translations.value[currentLang] && translations.value[currentLang][key]) ||
    key;

  // --- Manipulación del Output ---

  /**
   * Añade contenido HTML al componente de output y hace scroll.
   * @param {string} html - HTML para añadir.
   */
  const appendHtml = (html) => {
    if (outputRef && outputRef.value && outputRef.value.appendHtml) {
      outputRef.value.appendHtml(html);
    }
  };

  /** Limpia el componente de output. */
  const clearOutput = () => {
    if (outputRef && outputRef.value && outputRef.value.clear) {
      outputRef.value.clear();
    }
  };

  /** Imprime el mensaje de bienvenida inicial. */
  const printWelcomeMessage = () => {
    const welcomeMessage = `
      <div class="mb-4">
        <p class="text-2xl font-bold text-emerald-400 glow">${getText(
          "welcome_title"
        )}</p>
        <p>${getText("welcome_help")}</p>
        <p>${getText("welcome_shortcuts")}</p>
      </div>`;
    appendHtml(welcomeMessage);
  };

  // --- Lógica de Ventana/Modal ---

  /**
   * Abre la ventana modal con contenido.
   * Desenfoca y deshabilita el input de la terminal.
   * @param {string} command - El comando que invoca la ventana (ej: "about").
   */
  const openWindow = (command) => {
    // Quita el foco visual del input
    if (inputLineRef && inputLineRef.value && inputLineRef.value.classList)
      inputLineRef.value.classList.remove("is-focused");
    
    // Deshabilita el input real para prevenir escritura
    if (inputRef && inputRef.value) {
      if (inputRef.value.inputRefLocal) {
        try {
          inputRef.value.inputRefLocal.disabled = true;
        } catch (e) {}
      }
    }

    // Configura y muestra el modal
    modalTitle.value = getText(`${command}_title`);
    modalContent.value = getText(`${command}_html`);
    modalHidden.value = false;

    // Refresca los iconos (lucide) dentro del modal
    nextTick(() => {
      try {
        if (window.lucide && window.lucide.createIcons)
          window.lucide.createIcons();
      } catch (e) {
        console.error("lucide createIcons error:", e);
      }
    });
  };

  /** Cierra la ventana modal y restaura el foco en la terminal. */
  const closeWindow = () => {
    modalHidden.value = true;
    modalContent.value = "";
    
    // Devuelve el foco visual
    if (inputLineRef && inputLineRef.value && inputLineRef.value.classList)
      inputLineRef.value.classList.add("is-focused");
    
    // Rehabilita el input
    if (inputRef && inputRef.value) {
      if (inputRef.value.inputRefLocal) {
        try {
          inputRef.value.inputRefLocal.disabled = false;
        } catch (e) {}
      }
    }
    
    isFocused.value = true;
    // Devuelve el foco programáticamente al input
    nextTick(focusInput);
  };

  /** Función helper para enfocar el input. */
  const focusInput = () => {
    nextTick(() => {
      if (
        inputRef &&
        inputRef.value &&
        typeof inputRef.value.focus === "function"
      ) {
        inputRef.value.focus();
      }
    });
  };
  
  /** Limpia la terminal y muestra el mensaje de bienvenida. */
  const clearTerminal = () => {
    clearOutput();
    printWelcomeMessage();
    nextTick(focusInput);
  };

  // --- Ejecución de Comandos ---

  /**
   * Parsea y ejecuta un comando ingresado por el usuario.
   * @param {string} cmdRaw - El comando en crudo.
   */
  const executeCommand = (cmdRaw) => {
    const cmd = String(cmdRaw);
    const [command, ...args] = cmd.split(" ").filter(Boolean);
    
    // Imprime el comando ejecutado (eco)
    appendHtml(
      `<div class="flex"><span class="text-emerald-400 glow">manzano@portfolio:~$</span><p class="ml-2">${escapeHtml(
        cmd
      )}</p></div>`
    );

    // --- Enrutamiento de Comandos ---
    if (windowCommands.includes(command)) {
      // Comandos que abren un modal
      appendHtml(
        `<div><p>${getText(
          "opening_app"
        )} <span class="text-yellow-400">${command}</span>...</p></div>`
      );
      openWindow(command);
    } else if (command === "clear") {
      // Limpiar terminal
      clearTerminal();
    } else if (command === "lang") {
      // Cambiar idioma
      const lang = args[0];
      if (lang === "en" || lang === "es") {
        currentLang = lang;
        localStorage.setItem("portfolioLang", lang);
        document.documentElement.lang = lang;
        appendHtml(`<div><p>${getText("lang_changed")}</p></div>`);
        setTimeout(clearTerminal, 800); // Recarga la UI con el nuevo idioma
      } else {
        appendHtml(
          `<div><p class="text-red-400 glow">${getText("lang_usage")}</p></div>`
        );
      }
    } else if (command === "help") {
      // Mostrar ayuda
      const helpText = `
        <p class="mb-2">${getText("help_header")}</p>
        <ul class="list-disc list-inside">
          ${windowCommands
            .map(
              (c) =>
                `<li><span class="text-emerald-400 glow">${c}</span> - ${getText(
                  "help_" + c
                )}</li>`
            )
            .join("")}
          <li><span class="text-emerald-400 glow">lang</span> - ${getText(
            "help_lang"
          )}</li>
          <li><span class="text-emerald-400 glow">clear</span> - ${getText(
            "help_clear"
          )}</li>
          <li><span class="text-yellow-400 glow">Ctrl+L</span> - ${getText(
            "help_clear_shortcut"
          )}</li>
        </ul>`;
      appendHtml(`<div>${helpText}</div>`);
    } else {
      // Comando no encontrado
      appendHtml(
        `<div><p class="text-red-400 glow">${getText(
          "command_not_found"
        )} '${escapeHtml(command)}'. ${getText("type_help")}</p></div>`
      );
    }
  };

  // --- Manejadores de Eventos de Teclado ---

  /**
   * Manejador principal de teclado para el input.
   * @param {KeyboardEvent} e
   */
  const onKeyDown = (e) => {
    const key = (e.key || "").toString().toLowerCase();

    if (key === "enter") {
      e.preventDefault();
      const command = inputText.value.trim().toLowerCase();
      if (command) {
        // Añadir al historial solo si es nuevo y diferente al último
        if (command !== commandHistory[0]) commandHistory.unshift(command);
        historyIndex = -1; // Resetear índice de historial
        executeCommand(command);
      }
      inputText.value = ""; // Limpiar input
      nextTick(focusInput);
      return;
    }

    if (key === "arrowup") {
      // Navegar historial hacia arriba (más antiguo)
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        inputText.value = commandHistory[historyIndex] || "";
      }
      return;
    }

    if (key === "arrowdown") {
      // Navegar historial hacia abajo (más reciente)
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        inputText.value = commandHistory[historyIndex] || "";
      } else {
        // Volver al input vacío
        historyIndex = -1;
        inputText.value = "";
      }
      return;
    }

    if (key === "tab") {
      // Autocompletar comando
      e.preventDefault();
      const partialCommand = inputText.value.trim().toLowerCase();
      const matches = allCommands.filter((c) => c.startsWith(partialCommand));
      
      if (matches.length === 1) {
        // Autocompletar único
        inputText.value = matches[0];
      } else if (matches.length > 1) {
        // Mostrar múltiples opciones
        appendHtml(
          `<div class="flex"><span class="text-emerald-400 glow">manzano@portfolio:~$</span><p class="ml-2">${escapeHtml(
            partialCommand
          )}</p></div>`
        );
        appendHtml(
          `<div class="flex flex-wrap gap-x-4">${matches.join(" ")}</div>`
        );
      }
      return;
    }

    if (key === "l" && e.ctrlKey) {
      // Atajo Ctrl+L para limpiar
      e.preventDefault();
      clearTerminal();
      return;
    }

    if (key === "escape" && !modalHidden.value) {
      // Cerrar modal con Escape
      closeWindow();
      return;
    }
  };

  /** Manejador global para la tecla Escape (cierra el modal). */
  const onDocumentKeyDown = (e) => {
    if (
      (e.key || "").toString().toLowerCase() === "escape" &&
      !modalHidden.value
    ) {
      closeWindow();
    }
  };

  // --- Inicialización ---

  /**
   * Carga el contenido JSON (traducciones) e inicializa la terminal.
   */
  async function loadContentAndInit() {
    document.documentElement.lang = currentLang;
    try {
      translations.value = await loadContentJson();
      printWelcomeMessage();
      
      // Inicializar iconos
      try {
        if (window.lucide && window.lucide.createIcons)
          window.lucide.createIcons();
      } catch (err) {
        console.error("lucide init error:", err);
      }
      
      // Foco inicial
      nextTick(focusInput);

    } catch (e) {
      appendHtml(
        `<p class="text-red-400 glow">Error: No se pudo cargar el contenido del portafolio. Por favor, refresca la página.</p>`
      );
      console.error(e);
    }
  }

  // --- API Expuesta por el Composable ---
  return {
    inputText,
    isFocused,
    modalHidden,
    modalTitle,
    modalContent,
    onKeyDown,
    onDocumentKeyDown,
    loadContentAndInit,
    focusInput,
    clearTerminal,
    executeCommand,
    closeWindow,
    openWindow,
  };
}