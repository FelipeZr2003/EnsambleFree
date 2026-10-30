# EnsambleFree

EnsambleFree es un configurador 3D de gabinetes para PC. Permite definir las medidas del chasis, elegir materiales y paneles, ubicar la placa base y configurar las opciones de refrigeración antes de fabricar o documentar un diseño.

## 1. ¿Qué problema resuelve?

Diseñar un gabinete personalizado suele requerir imaginar cómo encajan sus piezas o hacer varias pruebas físicas. EnsambleFree convierte ese proceso en una experiencia visual e interactiva:

- Permite probar dimensiones y configuraciones en tiempo real.
- Muestra el chasis y sus componentes en una escena 3D que se puede orbitar y acercar.
- Ayuda a detectar incompatibilidades de espacio en placas base, fuentes, radiadores y ventiladores.
- Genera un resumen del diseño que se puede exportar en formatos `.txt` y `.json`.

En pocas palabras, reduce la incertidumbre antes de construir el gabinete y facilita compartir las especificaciones del diseño.

## 2. ¿Qué tecnologías usó?

- **HTML5** para la estructura de la aplicación.
- **CSS3** y **Tailwind CSS** para el diseño visual y la interfaz adaptable.
- **JavaScript moderno (ES Modules)** para la lógica del configurador.
- **Three.js 0.160.0** para crear la escena 3D, los materiales, las luces y el modelo del gabinete.
- **WebGL** como tecnología de renderizado en el navegador.
- **OrbitControls** para la navegación de la cámara mediante mouse o táctil.
- **Google Fonts / Inter** para la tipografía de la interfaz.

No requiere backend ni base de datos: el diseño se mantiene en el navegador y puede descargarse desde la propia interfaz.

## 3. ¿Cómo se ve?

[![Ver Demo en Vivo](https://img.shields.io/badge/Demo-🌐_Ver_Proyecto_Online-2ea44f?style=for-the-badge)](https://felipezr2003.github.io/EnsambleFree/)

La interfaz está dividida en tres áreas sencillas: controles a la izquierda, vista 3D al centro y estado del diseño en la parte inferior. Desde las pestañas se pueden cambiar las dimensiones, los paneles, la placa base y la refrigeración.

## Cómo ejecutarlo

Abre el proyecto con un servidor local, por ejemplo mediante **Live Server** en Visual Studio Code. Después, abre `index.html` en el navegador.

La estructura principal del proyecto es:

```text
EnsambleFree/
├── index.html
├── src/
│   └── main.js
├── styles/
│   └── site.css
└── docs/
    ├── configurador.png
    └── backup/
```

## Datos del autor

- **Nombre:** Andres Zapata
- **GitHub:** FelipeZr2003

