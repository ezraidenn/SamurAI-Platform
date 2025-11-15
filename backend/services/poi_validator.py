"""
POI Validation Service using OpenAI GPT

Valida puntos de interés con IA:
- Determina categoría automáticamente
- Valida contenido (permite spam comercial moderado)
- Valida fotos
- Sugiere mejoras
"""
from openai import OpenAI
from typing import Dict, Optional
import json
import base64
from pathlib import Path
from backend.config import OPENAI_API_KEY, AI_VALIDATION_ENABLED


# Categorías válidas
VALID_CATEGORIES = {
    "tienda": ["abarrotes", "ropa", "electronica", "ferreteria", "papeleria", "otro"],
    "supermercado": ["cadena", "local"],
    "restaurante": ["comida_yucateca", "tacos", "pizza", "mariscos", "internacional", "otro"],
    "cafe": ["cafe", "panaderia", "postres"],
    "salud": ["clinica", "farmacia", "consultorio", "laboratorio", "dentista", "otro"],
    "educacion": ["escuela", "kinder", "universidad", "academia", "biblioteca"],
    "belleza": ["peluqueria", "estetica", "spa", "barberia"],
    "taller": ["mecanico", "electronica", "carpinteria", "plomeria", "otro"],
    "oficina": ["abogado", "contador", "arquitecto", "notaria", "otro"],
    "financiero": ["banco", "cajero", "casa_cambio", "cooperativa"],
    "gobierno": ["oficina_municipal", "policia", "bomberos", "correos"],
    "deporte": ["gimnasio", "cancha", "parque_deportivo"],
    "entretenimiento": ["cine", "teatro", "eventos", "juegos"],
    "religion": ["iglesia", "templo", "capilla"],
    "parque": ["parque", "plaza", "jardin"],
    "gasolinera": ["gasolinera", "gas_lp"],
    "hotel": ["hotel", "hostal", "posada"],
    "otro": []
}


class POIValidator:
    """Servicio de validación IA para POIs"""
    
    def __init__(self):
        """Inicializar cliente OpenAI"""
        if not OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY not configured in .env")
        
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        self.model = "gpt-4o"  # Modelo con visión
    
    async def validate_poi(
        self,
        nombre: str,
        descripcion: Optional[str],
        direccion: str,
        telefono: Optional[str] = None,
        photo_path: Optional[str] = None
    ) -> Dict:
        """
        Validación completa de POI con IA.
        
        Returns:
            Dict con resultado de validación
        """
        if not AI_VALIDATION_ENABLED:
            return self._default_validation()
        
        try:
            # Validar foto si existe
            photo_analysis = None
            if photo_path:
                photo_analysis = await self._validate_photo(photo_path, nombre, descripcion)
                
                # Si foto es rechazada, rechazar todo
                if not photo_analysis.get("approved", True):
                    return {
                        "approved": False,
                        "confidence": 0.1,
                        "categoria": None,
                        "subcategoria": None,
                        "confidence_categoria": 0.0,
                        "issues": ["Foto inapropiada o no válida"],
                        "warnings": [],
                        "suggestions": {},
                        "spam_level": "none",
                        "spam_acceptable": False,
                        "rejection_reason": photo_analysis.get("rejection_reason", "Foto no válida")
                    }
            
            # Validar datos del POI
            data_analysis = await self._validate_data(
                nombre, descripcion, direccion, telefono
            )
            
            # Combinar análisis
            return self._combine_analyses(data_analysis, photo_analysis)
            
        except Exception as e:
            print(f"❌ POI Validation Error: {e}")
            return self._default_validation()
    
    async def _validate_photo(
        self,
        photo_path: str,
        nombre: str,
        descripcion: Optional[str]
    ) -> Dict:
        """
        Valida foto del POI con GPT-4 Vision.
        """
        try:
            # Codificar imagen
            image_data = self._encode_image(photo_path)
            
            prompt = f"""
Analiza esta foto de un punto de interés (negocio/lugar):

Nombre: {nombre}
Descripción: {descripcion or "No proporcionada"}

Valida:
1. ¿Es una foto real de un negocio, local o lugar?
2. ¿Es apropiada para un directorio público?
3. ¿NO contiene contenido sexual, violento o inapropiado?
4. ¿La calidad es aceptable?

Responde en JSON:
{{
  "approved": true/false,
  "confidence": 0.0-1.0,
  "is_business_photo": true/false,
  "quality": "buena/regular/mala",
  "issues": ["lista de problemas"],
  "rejection_reason": "razón si rechaza"
}}
"""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_data}"
                                }
                            }
                        ]
                    }
                ],
                response_format={"type": "json_object"},
                max_tokens=500,
                temperature=0.3
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            print(f"❌ Photo Validation Error: {e}")
            return {"approved": True, "confidence": 0.5}  # Permisivo en caso de error
    
    async def _validate_data(
        self,
        nombre: str,
        descripcion: Optional[str],
        direccion: str,
        telefono: Optional[str]
    ) -> Dict:
        """
        Valida datos del POI y determina categoría con ChatGPT.
        """
        try:
            prompt = f"""
Analiza esta propuesta de punto de interés para Ucú, Yucatán:

DATOS:
Nombre: "{nombre}"
Descripción: "{descripcion or 'No proporcionada'}"
Dirección: "{direccion}"
Teléfono: "{telefono or 'No proporcionado'}"

TAREAS:

1. IDENTIFICAR CATEGORÍA:
   Determina la categoría más apropiada de esta lista:
   {json.dumps(list(VALID_CATEGORIES.keys()), indent=2)}
   
   Y su subcategoría correspondiente.

2. VALIDAR CONTENIDO:
   ✅ PERMITIDO (es un negocio, es normal):
   - Promociones ("mejores precios", "ofertas", "descuentos")
   - Llamados a la acción ("visítanos", "llámanos", "síguenos")
   - Servicios destacados ("envío gratis", "aceptamos tarjeta")
   - Emojis comerciales (🔥, ⭐, 💯, ✨)
   - Lenguaje promocional moderado
   
   ❌ RECHAZAR solo si hay:
   - Contenido sexual explícito
   - Violencia o drogas
   - Estafas obvias ("gana dinero fácil", "haz click aquí")
   - Información falsa grave
   - Lenguaje ofensivo/discriminatorio
   - Spam extremo (SOLO MAYÚSCULAS, !!!!!!!!!)

3. VALIDAR DATOS:
   - ¿El nombre tiene sentido?
   - ¿La dirección parece real para Ucú, Yucatán?
   - ¿El teléfono tiene formato válido? (999-XXX-XXXX o similar)

4. NIVEL DE SPAM:
   - none: Sin promociones
   - low: Promociones sutiles
   - medium: Promociones moderadas (ACEPTABLE)
   - high: Spam excesivo (RECHAZAR)

RESPONDE EN JSON:
{{
  "approved": true/false,
  "confidence": 0.0-1.0,
  
  "categoria": "categoria_detectada",
  "subcategoria": "subcategoria_detectada",
  "confidence_categoria": 0.0-1.0,
  
  "issues": ["problemas GRAVES encontrados"],
  "warnings": ["advertencias menores (no bloquean)"],
  
  "suggestions": {{
    "nombre": "sugerencia si hay error grave",
    "descripcion": "sugerencia si hay error grave",
    "datos_faltantes": ["horarios", "whatsapp", "etc"]
  }},
  
  "spam_level": "none/low/medium/high",
  "spam_acceptable": true/false,
  
  "rejection_reason": "razón SOLO si rechaza"
}}

IMPORTANTE: 
- Spam comercial normal es ACEPTABLE
- Solo rechaza contenido REALMENTE inapropiado
- Sé permisivo con promociones y lenguaje comercial
"""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "Eres un validador de puntos de interés. Debes ser permisivo con lenguaje comercial normal pero estricto con contenido inapropiado."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                response_format={"type": "json_object"},
                max_tokens=1000,
                temperature=0.3
            )
            
            result = json.loads(response.choices[0].message.content)
            
            # Validar que la categoría sea válida
            if result.get("categoria") not in VALID_CATEGORIES:
                result["categoria"] = "otro"
                result["subcategoria"] = None
                result["confidence_categoria"] = 0.5
            
            return result
            
        except Exception as e:
            print(f"❌ Data Validation Error: {e}")
            return self._default_validation()
    
    def _combine_analyses(
        self,
        data_analysis: Dict,
        photo_analysis: Optional[Dict]
    ) -> Dict:
        """
        Combina análisis de datos y foto.
        """
        result = data_analysis.copy()
        
        if photo_analysis:
            # Si foto tiene problemas, agregar a warnings
            if not photo_analysis.get("is_business_photo", True):
                result["warnings"].append("La foto podría no ser de un negocio")
            
            if photo_analysis.get("quality") == "mala":
                result["warnings"].append("La calidad de la foto es baja")
            
            # Ajustar confianza si foto tiene problemas
            if not photo_analysis.get("approved", True):
                result["confidence"] *= 0.5
        
        return result
    
    def _encode_image(self, image_path: str) -> str:
        """Codifica imagen a base64."""
        try:
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            print(f"❌ Image Encoding Error: {e}")
            raise
    
    def _default_validation(self) -> Dict:
        """
        Validación por defecto cuando IA no está disponible.
        """
        return {
            "approved": True,
            "confidence": 0.5,
            "categoria": "otro",
            "subcategoria": None,
            "confidence_categoria": 0.5,
            "issues": [],
            "warnings": ["Validación IA no disponible"],
            "suggestions": {},
            "spam_level": "none",
            "spam_acceptable": True,
            "rejection_reason": None
        }


# Instancia global
poi_validator = POIValidator()
