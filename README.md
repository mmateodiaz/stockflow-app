# 📦 StockFlow — Sistema Web de Control de Inventario y Negocios

> Aplicación web moderna y ágil diseñada para optimizar la gestión de inventarios, control de stock crítico y análisis de rotación de productos en pequeños y medianos comercios.

[![Desplegado en Vercel](https://img.shields.io/badge/Despliegue-Vercel-black?style=flat&logo=vercel)](https://stockflow-app-smoky.vercel.app/)
[![Estado](https://img.shields.io/badge/Estado-Completado-success?style=flat)]()

---

## 🚀 Características Principales

* **Diseño Dashboard (2 Columnas):** Interfaz optimizada mediante CSS Grid para separar los controles de carga de la visualización de datos, evitando desplazamientos excesivos.
* **Gestión Integral de Productos (CRUD):** Alta, modificación, control de stock en tiempo real y eliminación de registros.
* **Sección Exclusiva de Bebidas:** Módulo dedicado con filtros y categorías especiales para el control de bebidas y artículos relacionados.
* **Sistema de Alertas y Stock Crítico:** Identificación visual automática de productos por debajo del stock mínimo.
* **Reportes Multipestaña Independientes:** Vistas dedicadas basadas en parámetros por URL (`?tipo=inventario`, `?tipo=bebidas`, `?tipo=faltantes`) que leen los datos desde el almacenamiento local.
* **Análisis Gráfico de Rendimiento:** Integración con **Chart.js** para visualizar el historial y la rotación comercial de cada producto de forma individual.
* **Buscador y Filtros Avanzados:** Filtrado dinámico por texto (nombre/categoría) y selectores rápidos por categoría o estado crítico.
* **Persistencia de Datos:** Utiliza `localStorage` para garantizar que la información no se pierda al recargar la página.

---

## 🛠️ Tecnologías Utilizadas

* **Frontend:** HTML5, CSS3 (CSS Grid, Flexbox, Variables CSS).
* **Lógica y Dinamismo:** JavaScript Vanilla (ES6+).
* **Librerías Externas:** Chart.js (para gráficos interactivos de rendimiento).
* **Control de Versiones y Despliegue:** Git, GitHub y Vercel.

---

## 📱 Demostración en Vivo

Podés probar la aplicación funcionando directamente desde la web en el siguiente enlace:
👉 **[Ver aplicación en producción](https://stockflow-app-smoky.vercel.app/)**

---

## 💻 Instalación y Ejecución Local

Si deseas clonar y probar este proyecto en tu computadora, sigue estos pasos:

1. Clona el repositorio:
   ```bash
   git clone [https://github.com/mmateodiaz/stockflow-app.git](https://github.com/mmateodiaz/stockflow-app.git)
2. Accede a la carpeta del proyecto
    cd stockflow-app
3. Abre la aplicación:
Abre el archivo index.html directamente en tu navegador web, o utiliza una herramienta de desarrollo como Live Server en Visual Studio Code para ejecutarlo en un entorno local con recarga en vivo



Desarrollado por Mateo Diaz

Estudiante de Ingeniería en Sistemas de Información — Universidad Tecnológica Nacional, Facultad Regional Córdoba (UTN FRC).
