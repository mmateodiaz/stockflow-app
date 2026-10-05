# 📦 StockFlow

**StockFlow** es una aplicacion web ligera y moderna disenada para el control eficiente de inventarios en pequeños negocios o emprendimientos. Permite registrar productos, gestionar entradas/salidas de stock y visualizar alertas automaticas cuando un articulo se encuentra en nivel critico.

🔗 **Link en vivo:** [Ver aplicacion en produccion](https://stockflow-lj9jusor1-diaz-b075.vercel.app) 

---

## 🚀 Caracteristicas Principales

* **CRUD Completo:** Permite registrar nuevos productos con sus respectivas categorias y eliminar registros obsoletos.
* **Control de Stock Dinamico:** Visualizacion clara de stock actual frente al stock minimo configurado.
* **Alertas Visuales:** Las filas de la tabla se marcan automaticamente en color rojo cuando el inventario esta por debajo del limite seguro (Stock Critico).
* **Persistencia de Datos:** Utiliza `localStorage` del navegador para que los datos no se pierdan al cerrar o recargar la pestaña.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5:** Estructura semantica de la interfaz.
* **CSS3:** Estilos personalizados, diseño limpio y adaptable (Responsive Design) mediante variables CSS.
* **JavaScript (Vanilla):** Logica de negocio, manipulacion del DOM y gestion del almacenamiento local.
* **Git y GitHub:** Control de versiones y repositorio de codigo fuente.
* **Vercel:** Despliegue e infraestructura en la nube.

---

## 💻 Instalacion y Ejecucion Local

Si queres clonar y probar este proyecto en tu propia computadora, segui estos pasos:

1. Clona el repositorio:
   ```bash
   git clone https://github.com/mmateodiaz/stockflow-app.git