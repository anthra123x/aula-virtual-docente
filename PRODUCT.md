# Product

## Register

product

## Users

Docentes de secundaria que gestionan su carga académica diaria: materias, grupos, estudiantes, asistencia, observaciones y planificación de clases. Usan la herramienta en horario laboral, entre clases, desde su laptop o celular. Necesitan rapidez, claridad y que no estorbe.

## Product Purpose

AulaDocente es una herramienta personal — no institucional — para que un docente pueda organizar sus clases, tomar asistencia, registrar observaciones y planificar lecciones sin depender de Excel ni sistemas institucionales rígidos. Éxito es que el docente abra la web y en segundos sepa qué clase tiene hoy, quién faltó y qué observó la semana pasada.

## Brand Personality

**Cálido, lúdico, confiable.** No serio ni corporativo, pero tampoco infantil. La interfaz debe sentirse como un cuaderno profesional pero con personalidad — como un planner de papel bien diseñado hecho herramienta digital. Que dé gusto usarlo, no solo que funcione.

Tres palabras: **agradable, moderna, funcional.**

## Anti-references

- shadcn/ui por defecto (gris neutro, sin color de marca, aspecto genérico de "template SaaS")
- Interfaces corporativas grises o azules institucionales
- Glassmorphism decorativo sin propósito (el blur vacío)
- Minimalismo seco tipo "developer dashboard"
- UIs que priorizan la estética sobre la usabilidad

## Design Principles

1. **Personalidad sin estorbar.** La interfaz tiene carácter (formas suaves, color, textura visual) pero nunca a costa de la claridad. El docente encuentra lo que busca en un vistazo.
2. **Funcional primero.** Cada decisión visual sirve a una tarea: marcar asistencia, ver el plan de clase, escribir una observación. Si no acelera o aclara la tarea, no está.
3. **Tangible aunque digital.** Las superficies se sienten físicas — infladas, con profundidad suave, como plastilina profesional o vidrio líquido. Esto contrasta con la planitud del SaaS genérico.
4. **Ritmo y descanso visual.** Espaciado generoso, tipografía clara, color usado con intención. El ojo del docente ya trabaja todo el día; la interfaz no debe cansarlo más.
5. **Modo oscuro nativo.** No un afterthought. Ambos modos (claro y oscuro) se diseñan juntos, con la misma paleta de color pero adaptada al fondo.

## Accessibility & Inclusion

- Contraste WCAG AA mínimo (4.5:1 texto normal, 3:1 texto grande)
- Animaciones reducibles vía `prefers-reduced-motion`
- La paleta usa OKLCH para consistencia perceptiva en ambos modos
- Navegación por teclado en todos los controles interactivos (base-ui lo provee)
