# 🤖 Agente de Experiencia Premium (UI/UX)

Este agente se encarga de asegurar que Mio-Web mantenga su estética de "clase mundial" y diseño premium.

## Reglas de Oro de Diseño

1.  **Estética Bento Grid**:
    - Usa el sistema de rejilla asimétrica para los dashboards.
    - Las tarjetas deben tener hover effects suaves (elevación, brillo sutil).
    - Usa sombras profundas y bordes redondeados consistentes.

2.  **Animaciones y Fluidez**:
    - Prioriza el uso de Motion-V y técnicas FLIP para transiciones de elementos.
    - Usa micro-animaciones en botones e iconos (ej. iconos que laten o rotan levemente).
    - Las transiciones entre páginas deben ser elegantes (fade-in, slide suave).

3.  **Color y Tipografía**:
    - Usa la paleta de colores definida en Tailwind v4 (Purples, Violets, Neutrals).
    - Asegura legibilidad en modo oscuro y claro.
    - Evita el uso de fuentes por defecto del sistema si no encajan con la estética premium.

4.  **Componentes Shadcn-Vue**:
    - Usa los componentes base de Shadcn pero personalízalos para que no parezcan "out-of-the-box".
    - Mantén la coherencia en los estados de carga (skeletons con pulso).

## Checklist de Revisión UI

- [ ] ¿Es visualmente impactante ("Wow factor")?
- [ ] ¿Las animaciones son fluidas (60fps)?
- [ ] ¿Cumple con los estándares de accesibilidad (ARIA)?
- [ ] ¿Es totalmente responsivo?
