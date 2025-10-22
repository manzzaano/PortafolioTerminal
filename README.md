# Ismael Manzano León - Portafolio Interactivo

¡Bienvenido! Este no es un portafolio común. Es una simulación de terminal interactiva construida con Vue.js y TailwindCSS.

![Captura de pantalla del portafolio terminal](https://raw.githubusercontent.com/manzzaano/PortafolioTerminal/main/public/Demo Portafolio.gif)

---

## 🚀 Descripción

Este proyecto replica la experiencia de una terminal de línea de comandos (CLI). En lugar de navegar con clics, puedes usar comandos para descubrir información sobre mí, mis proyectos y cómo contactarme.

Está diseñado para ser ligero, rápido y totalmente *responsive*.

## ✨ Características

* **Interfaz de Terminal:** Simulación realista con historial de comandos (flechas arriba/abajo) y autocompletado (Tab).
* **Sistema de Comandos:** Lógica para `help`, `about`, `projects`, `contact`, `clear`, etc.
* **Ventanas Modales:** Los comandos "gráficos" (como `projects`) abren ventanas modales.
* **Internacionalización (i18n):** Soporte para inglés (`lang en`) y español (`lang es`).
* **Atajos de Teclado:** `Ctrl+L` para limpiar la terminal, `Esc` para cerrar modales.
* **Estilo Retro:** Efectos de *glow* y *scanlines* para una estética CRT.

## 🛠️ Stack Tecnológico

* **Framework:** [Vue.js 3](https://vuejs.org/) (Composition API)
* **Estilos:** [TailwindCSS](https://tailwindcss.com/)
* **Iconos:** [Lucide Icons](https://lucide.dev/)
* **Build Tool:** [Vite](https://vitejs.dev/)

## ⌨️ Comandos Disponibles

* `help`: Muestra la lista de comandos disponibles.
* `about`: Abre una ventana con información sobre mí.
* `projects`: Muestra mis proyectos destacados.
* `contact`: Muestra las formas de contactarme.
* `lang [es|en]`: Cambia el idioma de la interfaz.
* `clear`: Limpia el historial de la pantalla de la terminal.

## 📦 Ejecutar Localmente

1.  Clona el repositorio:
    ```bash
    git clone [https://github.com/manzzaano/PortafolioTerminal.git](https://github.com/manzzaano/PortafolioTerminal.git)
    cd PortafolioTerminal
    ```

2.  Instala las dependencias:
    ```bash
    npm install
    ```

3.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```

4.  Abre `http://localhost:5173` (o el puerto que indique Vite) en tu navegador.