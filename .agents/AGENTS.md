# Reglas Generales del Agente AI (Antigravity)

## 1. Optimización y Eficiencia de Tokens
- **Concisión**: Respuestas breves, directas y enfocadas exclusivamente en la solución técnica.
- **Lectura Eficiente**: No leer archivos completos de más de 200 líneas si solo se requiere un fragmento. Utilizar `grep_search` o definir `StartLine` y `EndLine` con `view_file`.
- **No Duplicación de Código**: Evitar reimprimir bloques enteros de código en el chat cuando ya hayan sido editados o documentados en los archivos.
- **Edición Precisa**: Usar `replace_file_content` para modificaciones puntuales en lugar de reescribir archivos extensos.

## 2. Flujo Obligatorio Post-Cambio (Commit & Push Automático)
Después de aplicar, probar o verificar cualquier cambio de código, corrección de errores o nueva funcionalidad:
1. **Comprobar Cambios**: Validar que el código compila y la funcionalidad es correcta.
2. **Registrar en Historial**: Si el cambio soluciona un error o fallo, añadir el registro estructurado en [HISTORIAL.md](file:///c:/Users/bailey/Desktop/tattoo%20software/tattoo-studio/HISTORIAL.md).
3. **Actualizar Changelog**: Si es una nueva característica o refactorización, actualizar [CHANGELOG.md](file:///c:/Users/bailey/Desktop/tattoo%20software/tattoo-studio/CHANGELOG.md).
4. **Git Commit & Push Automático**:
   - Ejecutar `git add .` para incluir los cambios.
   - Crear un commit con convención Conventional Commits en español (`feat: ...`, `fix: ...`, `docs: ...`).
   - Ejecutar `git push origin main` inmediatamente.

## 3. Reglas Específicas del Proyecto
- Consultar obligatoriamente las normas técnicas y sanitarias del proyecto en [.agents/REGLAS_WORKSPACE.md](file:///c:/Users/bailey/Desktop/tattoo%20software/tattoo-studio/.agents/REGLAS_WORKSPACE.md).
