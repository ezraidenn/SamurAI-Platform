# 🤖 Sistema de Validación con IA - UCU Reporta

## 📋 Descripción

El sistema utiliza **OpenAI GPT-4o-mini** para analizar y validar reportes ciudadanos automáticamente, mejorando la categorización y priorización de incidentes cívicos.

---

## ✨ Características

### 🎯 Análisis Inteligente
- **Validación de categoría** - Verifica si el reporte está en la categoría correcta
- **Priorización automática** - Sugiere nivel de prioridad (1-5) basado en el contenido
- **Extracción de palabras clave** - Identifica términos relevantes del reporte
- **Nivel de urgencia** - Clasifica como low, medium, high o critical
- **Estimación de impacto** - Evalúa el impacto en la comunidad
- **Recomendaciones** - Sugiere acciones para el personal municipal

### 📊 Datos Almacenados
Cada reporte validado por IA incluye:
- `ai_validated` - Si fue analizado por IA (0/1)
- `ai_confidence` - Nivel de confianza (0.0-1.0)
- `ai_suggested_category` - Categoría sugerida
- `ai_urgency_level` - Nivel de urgencia
- `ai_keywords` - Palabras clave (JSON)
- `ai_reasoning` - Razonamiento de la IA

---

## ⚙️ Configuración

### Variables de Entorno

```bash
# backend/.env

# OpenAI API
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
AI_VALIDATION_ENABLED=true
```

### Modelos Disponibles
- `gpt-4o-mini` - Rápido y económico (recomendado)
- `gpt-4o` - Más preciso pero más costoso
- `gpt-4-turbo` - Balance entre velocidad y precisión

---

## 🔄 Flujo de Validación

```
1. Usuario crea reporte
   ↓
2. Backend recibe datos
   ↓
3. AI Validator analiza:
   - Categoría vs descripción
   - Palabras clave
   - Nivel de urgencia
   - Prioridad sugerida
   ↓
4. Si confianza > 70%:
   - Usa prioridad de IA
   Sino:
   - Usa cálculo tradicional
   ↓
5. Guarda reporte con metadata de IA
   ↓
6. Retorna al usuario
```

---

## 💡 Ejemplo de Análisis

### Input (Reporte del Usuario)
```json
{
  "category": "bache",
  "description": "Hay un hoyo enorme en la calle principal que ya causó dos accidentes. Es muy peligroso, especialmente de noche.",
  "latitude": 20.9674,
  "longitude": -89.6243,
  "photo_url": "https://..."
}
```

### Output (Análisis de IA)
```json
{
  "is_valid": true,
  "confidence": 0.95,
  "suggested_category": "bache",
  "suggested_priority": 5,
  "reasoning": "Reporte de bache con evidencia de accidentes y riesgo para la seguridad pública. Requiere atención inmediata.",
  "keywords": ["hoyo", "accidentes", "peligroso", "calle principal", "noche"],
  "urgency_level": "critical",
  "estimated_impact": "Alto riesgo de accidentes vehiculares y peatonales. Afecta vía principal con alto tráfico.",
  "recommendations": [
    "Enviar equipo de inspección inmediatamente",
    "Colocar señalización de advertencia temporal",
    "Programar reparación urgente",
    "Notificar a tránsito municipal"
  ]
}
```

---

## 🎨 Categorías Válidas

El sistema reconoce estas categorías:

| Categoría | Descripción | Ejemplos |
|-----------|-------------|----------|
| `bache` | Hoyos en calles, pavimento dañado | Baches, grietas, hundimientos |
| `alumbrado` | Luces públicas | Lámparas apagadas, postes caídos |
| `basura` | Residuos sólidos | Basura acumulada, contenedores llenos |
| `drenaje` | Sistema de drenaje | Fugas, inundaciones, alcantarillas |
| `vialidad` | Señalización y tráfico | Señales dañadas, semáforos |

---

## 📈 Niveles de Prioridad

| Nivel | Descripción | Tiempo de Respuesta |
|-------|-------------|---------------------|
| 5 | **Crítico** - Riesgo inmediato | < 4 horas |
| 4 | **Alto** - Requiere atención pronta | < 24 horas |
| 3 | **Medio** - Importante pero no urgente | < 3 días |
| 2 | **Bajo** - Puede esperar | < 1 semana |
| 1 | **Mínimo** - Mantenimiento rutinario | < 2 semanas |

---

## 🔧 Uso en el Código

### Backend - Validar Reporte

```python
from backend.services.ai_validator import get_ai_validator

# Obtener validador
validator = get_ai_validator()

# Analizar reporte
analysis = validator.analyze_report(
    category="bache",
    description="Descripción del problema...",
    has_photo=True
)

# Usar resultados
if analysis["confidence"] > 0.7:
    priority = analysis["suggested_priority"]
    urgency = analysis["urgency_level"]
```

### Frontend - Mostrar Análisis

```javascript
// Después de crear reporte
const report = await api.createReport(reportData);

if (report.ai_validated) {
  console.log(`Confianza IA: ${report.ai_confidence * 100}%`);
  console.log(`Urgencia: ${report.ai_urgency_level}`);
  console.log(`Razonamiento: ${report.ai_reasoning}`);
  
  const keywords = JSON.parse(report.ai_keywords);
  console.log(`Palabras clave: ${keywords.join(', ')}`);
}
```

---

## 🎯 Ventajas del Sistema

### Para Ciudadanos
- ✅ Mejor categorización automática
- ✅ Priorización más precisa
- ✅ Feedback inmediato sobre la urgencia
- ✅ Mayor confianza en el sistema

### Para Personal Municipal
- ✅ Reportes pre-clasificados
- ✅ Palabras clave para búsqueda rápida
- ✅ Recomendaciones de acción
- ✅ Estimación de impacto
- ✅ Menos trabajo manual de clasificación

### Para Administradores
- ✅ Métricas de confianza de IA
- ✅ Análisis de tendencias por palabras clave
- ✅ Identificación de reportes críticos
- ✅ Datos estructurados para análisis

---

## 💰 Costos Estimados

### OpenAI GPT-4o-mini
- **Input:** $0.150 / 1M tokens
- **Output:** $0.600 / 1M tokens

### Estimación por Reporte
- Tokens promedio: ~500 tokens (input + output)
- Costo por reporte: ~$0.0004 USD
- **1000 reportes:** ~$0.40 USD
- **10,000 reportes:** ~$4.00 USD

**Muy económico para el valor agregado** ✅

---

## 🔒 Seguridad y Privacidad

### Datos Enviados a OpenAI
- ✅ Solo categoría y descripción
- ✅ NO se envían datos personales
- ✅ NO se envían coordenadas exactas
- ✅ NO se envían fotos

### Buenas Prácticas
- API Key en `.env` (no en código)
- Validación de entrada antes de enviar
- Manejo de errores robusto
- Fallback a validación tradicional

---

## 🐛 Troubleshooting

### Error: "OPENAI_API_KEY not configured"
**Solución:** Agregar API key en `backend/.env`
```bash
OPENAI_API_KEY=sk-proj-...
```

### Error: "Rate limit exceeded"
**Solución:** Esperar o actualizar plan de OpenAI

### IA devuelve resultados inconsistentes
**Solución:** Ajustar `temperature` en `ai_validator.py` (actualmente 0.3)

### Validación muy lenta
**Solución:** 
- Cambiar a modelo más rápido
- Reducir `max_tokens`
- Implementar caché de respuestas

---

## 📊 Métricas y Monitoreo

### Consultas Útiles

**Reportes validados por IA:**
```sql
SELECT COUNT(*) FROM reports WHERE ai_validated = 1;
```

**Confianza promedio:**
```sql
SELECT AVG(ai_confidence) FROM reports WHERE ai_validated = 1;
```

**Reportes por urgencia:**
```sql
SELECT ai_urgency_level, COUNT(*) 
FROM reports 
WHERE ai_validated = 1 
GROUP BY ai_urgency_level;
```

**Categorías sugeridas vs seleccionadas:**
```sql
SELECT 
  category as seleccionada,
  ai_suggested_category as sugerida,
  COUNT(*) as total
FROM reports 
WHERE ai_validated = 1 
GROUP BY category, ai_suggested_category;
```

---

## 🚀 Mejoras Futuras

### Corto Plazo
- [ ] Caché de análisis para descripciones similares
- [ ] Dashboard de métricas de IA
- [ ] Notificaciones para reportes críticos
- [ ] Feedback loop (aprender de correcciones manuales)

### Mediano Plazo
- [ ] Análisis de imágenes con GPT-4 Vision
- [ ] Detección de duplicados
- [ ] Agrupación automática de reportes relacionados
- [ ] Predicción de tiempo de resolución

### Largo Plazo
- [ ] Modelo fine-tuned específico para el municipio
- [ ] Análisis de sentimiento ciudadano
- [ ] Generación automática de respuestas
- [ ] Integración con sistemas municipales existentes

---

## 📚 Referencias

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [GPT-4o-mini Pricing](https://openai.com/pricing)
- [Best Practices for Prompts](https://platform.openai.com/docs/guides/prompt-engineering)

---

**¡El sistema de IA está listo para mejorar la gestión de reportes cívicos!** 🎉
