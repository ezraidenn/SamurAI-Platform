"""
AI Validation Service using OpenAI GPT
Analyzes civic reports to improve categorization and priority assignment
Includes image analysis with GPT-4 Vision for complete validation
"""
from openai import OpenAI
from typing import Dict, Optional
import json
import base64
import requests
from pathlib import Path
from backend.config import OPENAI_API_KEY, OPENAI_MODEL, AI_VALIDATION_ENABLED


class AIValidator:
    """Service for AI-powered report validation and analysis"""
    
    def __init__(self):
        """Initialize OpenAI client"""
        if not OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY not configured in .env")
        
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        self.model = OPENAI_MODEL
        self.vision_model = "gpt-4o"  # GPT-4 Vision for image analysis
    
    def analyze_report_with_image(
        self,
        category: str,
        description: str,
        image_path: Optional[str] = None
    ) -> Dict:
        """
        Complete report analysis including image validation with GPT-4 Vision.
        
        Args:
            category: User-selected category
            description: User's description
            image_path: Path to uploaded image (local or URL)
            
        Returns:
            Dict with complete analysis including image validation
        """
        if not AI_VALIDATION_ENABLED:
            return self._default_validation(category)
        
        try:
            # Analyze image if provided
            image_analysis = None
            if image_path:
                image_analysis = self._analyze_image(category, description, image_path)
            
            # Analyze text
            text_analysis = self._analyze_text(category, description, bool(image_path))
            
            # Combine analyses
            return self._combine_analyses(text_analysis, image_analysis, category)
            
        except Exception as e:
            print(f"❌ Complete AI Validation Error: {e}")
            return self._default_validation(category)
    
    def _analyze_image(self, category: str, description: str, image_path: str) -> Dict:
        """
        Analyze image using GPT-4 Vision to validate it matches the report.
        
        Returns:
            Dict with image analysis results
        """
        try:
            # Encode image
            image_data = self._encode_image(image_path)
            
            # Create vision prompt
            prompt = self._build_vision_prompt(category, description)
            
            # Call GPT-4 Vision
            response = self.client.chat.completions.create(
                model=self.vision_model,
                messages=[
                    {
                        "role": "system",
                        "content": self._get_vision_system_prompt()
                    },
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
                max_tokens=1000,
                temperature=0.3
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            print(f"⚠️  Image analysis failed: {e}")
            return None
    
    def _encode_image(self, image_path: str) -> str:
        """Encode image to base64"""
        try:
            # Check if it's a URL or local path
            if image_path.startswith('http'):
                response = requests.get(image_path)
                return base64.b64encode(response.content).decode('utf-8')
            else:
                with open(image_path, "rb") as image_file:
                    return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            print(f"Error encoding image: {e}")
            return None
    
    def _analyze_text(self, category: str, description: str, has_photo: bool) -> Dict:
        """Analyze text description (original method)"""
        try:
            prompt = self._build_prompt(category, description, has_photo)
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": self._get_system_prompt()
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=800
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            print(f"⚠️  Text analysis failed: {e}")
            return None
    
    def check_offensive_text(self, description: str) -> Dict:
        """
        Check if text contains offensive, vulgar, or inappropriate content.
        
        Args:
            description: Text to analyze
            
        Returns:
            Dict with offensive content detection results
        """
        try:
            prompt = f"""Analiza el siguiente texto de un reporte cívico y determina si contiene:
- Lenguaje ofensivo, vulgar o groserías
- Insultos o palabras inapropiadas
- Contenido sexual explícito
- Amenazas o violencia
- Discriminación o discurso de odio
- Spam o texto sin sentido (ej: "asdfghjkl", "snionioaendionodneiodnioqenioe")
- Texto de prueba (ej: "esto es una prueba", "test", "prueba del sistema", "hackathon")
- Descripciones extremadamente vagas que no explican el problema

Texto a analizar: "{description}"

IMPORTANTE: El mensaje "professional_feedback" debe:
- Usar "detectamos" en lugar de "la IA detectó"
- Ser profesional y respetuoso
- Si es texto de prueba, ser CREATIVO y amigable: "¡Excelente! El sistema funciona perfectamente. Ahora que confirmaste que todo está listo, puedes crear tu reporte real cuando lo necesites. 🚀"
- Si es texto sin sentido, explicar claramente: "Detectamos que el texto no tiene sentido. Por favor, describe el problema de infraestructura vial que deseas reportar."
- Si es muy vago, pedir más detalles: "La descripción es muy general. Por favor, proporciona más detalles sobre el problema para que podamos atenderlo mejor."
- Invitar al usuario a corregir el contenido

Responde en formato JSON:
{{
    "is_offensive": true/false,
    "is_inappropriate": true/false,
    "is_spam": true/false,
    "is_test": true/false,
    "is_nonsense": true/false,
    "is_too_vague": true/false,
    "offense_type": "vulgar/insult/sexual/threat/hate/spam/test/nonsense/vague/none",
    "detected_words": ["palabra1", "palabra2"],
    "severity": "low/medium/high/critical",
    "requires_strike": true/false,
    "rejection_reason": "razón específica si es ofensivo",
    "professional_feedback": "mensaje profesional para el usuario usando 'detectamos'"
}}"""

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """Eres un moderador de contenido experto en detectar lenguaje ofensivo, vulgar e inapropiado en español.
Debes ser ESTRICTO al detectar:
- Groserías y palabras vulgares
- Insultos y lenguaje ofensivo
- Contenido sexual explícito
- Amenazas o violencia
- Discriminación
- Spam o texto sin sentido (letras aleatorias, tecleo sin sentido)
- Texto de prueba (menciones de "prueba", "test", "hackathon", "demo")
- Descripciones extremadamente vagas (menos de 10 palabras sin contexto útil)

IMPORTANTE:
- Para texto de prueba: Sé AMIGABLE y CREATIVO, confirma que el sistema funciona
- Para texto sin sentido: Pide descripción clara del problema
- Para texto vago: Solicita más detalles específicos
- NO rechaces descripciones cortas pero claras (ej: "bache grande en calle principal")

Responde siempre en formato JSON."""
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
                max_tokens=500
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            print(f"⚠️  Offensive text check failed: {e}")
            return {
                "is_offensive": False,
                "is_inappropriate": False,
                "offense_type": "none"
            }
    
    def analyze_report(
        self, 
        category: str, 
        description: str, 
        has_photo: bool = False
    ) -> Dict:
        """
        Analyze a civic report using AI to validate and improve categorization.
        
        Args:
            category: User-selected category (via_mal_estado, infraestructura_danada, senalizacion_transito, iluminacion_visibilidad)
            description: User's description of the issue
            has_photo: Whether the report includes a photo
            
        Returns:
            Dict with AI analysis:
            {
                "is_valid": bool,
                "confidence": float (0-1),
                "suggested_category": str,
                "suggested_priority": int (1-5),
                "reasoning": str,
                "keywords": List[str],
                "urgency_level": str (low, medium, high, critical),
                "estimated_impact": str,
                "recommendations": List[str]
            }
        """
        if not AI_VALIDATION_ENABLED:
            # Return default validation if AI is disabled
            return self._default_validation(category)
        
        try:
            # Construct the prompt
            prompt = self._build_prompt(category, description, has_photo)
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": self._get_system_prompt()
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.3,  # Lower temperature for more consistent results
                max_tokens=800
            )
            
            # Parse response
            result = json.loads(response.choices[0].message.content)
            
            # Validate and normalize the response
            return self._normalize_response(result, category)
            
        except Exception as e:
            print(f"❌ AI Validation Error: {e}")
            # Fallback to default validation on error
            return self._default_validation(category)
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for the AI"""
        return """Eres un experto analista de reportes cívicos para municipios en Yucatán, México.
Tu trabajo es analizar reportes ciudadanos sobre problemas urbanos y determinar:
1. Si el reporte es válido y está en la categoría correcta
2. El nivel de prioridad (1-5, donde 5 es crítico)
3. El nivel de urgencia (low, medium, high, critical)
4. Palabras clave relevantes
5. Impacto estimado en la comunidad
6. Recomendaciones para el personal municipal

Categorías válidas (4 categorías englobadas):
- via_mal_estado: Baches, grietas, fisuras, hundimientos, deformaciones y topes irregulares en calles
- infraestructura_danada: Banquetas rotas, drenaje insuficiente, alcantarillas o tapas de registro dañadas
- senalizacion_transito: Señalización dañada, semáforos fuera de servicio, pintura vial desgastada
- iluminacion_visibilidad: Falta de alumbrado público, vegetación que obstruye visibilidad

Responde SIEMPRE en formato JSON con esta estructura exacta:
{
    "is_valid": true/false,
    "confidence": 0.0-1.0,
    "suggested_category": "categoria",
    "suggested_priority": 1-5,
    "reasoning": "explicación breve",
    "keywords": ["palabra1", "palabra2"],
    "urgency_level": "low/medium/high/critical",
    "estimated_impact": "descripción del impacto",
    "recommendations": ["recomendación1", "recomendación2"]
}"""
    
    def _build_prompt(self, category: str, description: str, has_photo: bool) -> str:
        """Build the user prompt"""
        photo_info = "El reporte INCLUYE una fotografía." if has_photo else "El reporte NO incluye fotografía."
        
        return f"""Analiza este reporte ciudadano:

Categoría seleccionada: {category}
Descripción: {description}
{photo_info}

Proporciona un análisis completo en formato JSON."""
    
    def _normalize_response(self, result: Dict, original_category: str) -> Dict:
        """Normalize and validate AI response"""
        # Ensure all required fields exist
        normalized = {
            "is_valid": result.get("is_valid", True),
            "confidence": min(max(result.get("confidence", 0.7), 0.0), 1.0),
            "suggested_category": result.get("suggested_category", original_category),
            "suggested_priority": min(max(result.get("suggested_priority", 3), 1), 5),
            "reasoning": result.get("reasoning", "Análisis completado"),
            "keywords": result.get("keywords", [])[:10],  # Limit to 10 keywords
            "urgency_level": result.get("urgency_level", "medium"),
            "estimated_impact": result.get("estimated_impact", "Impacto moderado en la comunidad"),
            "recommendations": result.get("recommendations", [])[:5]  # Limit to 5 recommendations
        }
        
        # Validate category (4 categorías englobadas)
        valid_categories = ["via_mal_estado", "infraestructura_danada", "senalizacion_transito", "iluminacion_visibilidad"]
        if normalized["suggested_category"] not in valid_categories:
            normalized["suggested_category"] = "via_mal_estado"  # Default
        
        # Validate urgency level
        valid_urgency = ["low", "medium", "high", "critical"]
        if normalized["urgency_level"] not in valid_urgency:
            normalized["urgency_level"] = "medium"
        
        return normalized
    
    def _default_validation(self, category: str) -> Dict:
        """Return default validation when AI is disabled or fails"""
        return {
            "is_valid": True,
            "confidence": 0.5,
            "suggested_category": category,
            "suggested_priority": 3,
            "reasoning": "Validación básica sin IA",
            "keywords": [],
            "urgency_level": "medium",
            "estimated_impact": "Requiere evaluación manual",
            "recommendations": ["Revisar reporte manualmente"],
            "image_valid": True,
            "image_analysis": None,
            "severity_score": 5
        }
    
    def _get_vision_system_prompt(self) -> str:
        """System prompt for GPT-4 Vision"""
        return """Eres un experto analista de imágenes para reportes cívicos municipales con ALTA SENSIBILIDAD para detectar imágenes inválidas.

IMPORTANTE: Debes ser MUY ESTRICTO al validar imágenes. Rechaza cualquier imagen que:
- Sea una selfie o foto de personas (rostros, retratos)
- Sea un meme, captura de pantalla, o imagen de internet
- No muestre CLARAMENTE el problema reportado
- Sea una foto genérica que no evidencie el problema específico
- Muestre algo completamente diferente a la categoría

Tu trabajo es analizar la imagen y determinar:
1. ¿Es una foto REAL del problema reportado? (no selfies, no memes, no screenshots)
2. ¿Corresponde EXACTAMENTE a la categoría reportada?
3. La severidad del problema (escala 1-10) - SOLO si es válida
4. Detalles específicos observados
5. Cantidad/magnitud del problema

Categorías de problemas cívicos VÁLIDOS (4 categorías englobadas):
- via_mal_estado: Baches, grietas, fisuras, hundimientos, deformaciones y topes irregulares en calles
- infraestructura_danada: Banquetas rotas, drenaje insuficiente, alcantarillas o tapas de registro dañadas
- senalizacion_transito: Señalización dañada, semáforos fuera de servicio, pintura vial desgastada
- iluminacion_visibilidad: Falta de alumbrado público, vegetación que obstruye visibilidad

EJEMPLOS DE IMÁGENES INVÁLIDAS:
- Selfies o fotos de personas
- Memes o imágenes de internet
- Screenshots de redes sociales
- Fotos que no muestran el problema
- Imágenes borrosas donde no se ve nada
- Fotos de interiores cuando el problema es exterior
- Contenido ofensivo, vulgar o inapropiado
- Gestos obscenos o contenido sexual
- Violencia gráfica
- Discriminación o discurso de odio

DETECCIÓN DE CONTENIDO OFENSIVO:
Debes identificar si la imagen contiene:
- Lenguaje ofensivo visible (grafiti, letreros)
- Gestos obscenos o vulgares
- Contenido sexual o desnudez
- Violencia o gore
- Símbolos de odio o discriminación
- Burlas o acoso hacia personas

Responde SIEMPRE en formato JSON:
{
    "image_valid": true/false,
    "matches_category": true/false,
    "severity_score": 1-10 (o null si es inválida),
    "observed_details": "descripción detallada de lo que ves",
    "quantity_assessment": "mucho/moderado/poco" (o null si es inválida),
    "is_joke_or_fake": true/false,
    "is_offensive": true/false,
    "is_inappropriate": true/false,
    "offense_type": "selfie/meme/offensive/inappropriate/none",
    "rejection_reason": "razón específica si es inválida, null si es válida",
    "professional_feedback": "mensaje profesional y claro para el usuario",
    "requires_strike": true/false,
    "strike_severity": "low/medium/high/critical" (si requires_strike es true)
}"""
    
    def _build_vision_prompt(self, category: str, description: str) -> str:
        """Build prompt for vision analysis"""
        return f"""Analiza esta imagen de un reporte cívico:

Categoría reportada: {category}
Descripción del usuario: {description}

Valida si la imagen:
1. Corresponde a la categoría "{category}"
2. Muestra evidencia real del problema
3. No es una broma o imagen irrelevante
4. Qué tan severo es el problema (1-10)
5. Cantidad/magnitud del problema

Proporciona análisis completo en JSON."""
    
    def _combine_analyses(self, text_analysis: Dict, image_analysis: Dict, category: str) -> Dict:
        """Combine text and image analyses into final result"""
        if not text_analysis:
            text_analysis = self._default_validation(category)
        
        # Base result from text analysis
        result = text_analysis.copy()
        
        # Add image analysis if available
        if image_analysis:
            result["image_valid"] = image_analysis.get("image_valid", True)
            result["image_matches_category"] = image_analysis.get("matches_category", True)
            result["severity_score"] = image_analysis.get("severity_score", 5)
            result["observed_details"] = image_analysis.get("observed_details", "")
            result["quantity_assessment"] = image_analysis.get("quantity_assessment", "moderado")
            result["is_joke_or_fake"] = image_analysis.get("is_joke_or_fake", False)
            result["rejection_reason"] = image_analysis.get("rejection_reason")
            result["professional_feedback"] = image_analysis.get("professional_feedback", "")
            
            # Adjust validity based on image
            if not image_analysis.get("image_valid") or image_analysis.get("is_joke_or_fake"):
                result["is_valid"] = False
                result["confidence"] = 0.2
                result["reasoning"] = f"Imagen rechazada: {image_analysis.get('rejection_reason', 'No corresponde al reporte')}"
            
            # Adjust priority based on severity
            if image_analysis.get("severity_score"):
                severity = image_analysis["severity_score"]
                if severity >= 9:
                    result["suggested_priority"] = 5
                    result["urgency_level"] = "critical"
                elif severity >= 7:
                    result["suggested_priority"] = 4
                    result["urgency_level"] = "high"
                elif severity >= 5:
                    result["suggested_priority"] = 3
                    result["urgency_level"] = "medium"
                else:
                    result["suggested_priority"] = 2
                    result["urgency_level"] = "low"
            
            # Enhanced reasoning with image details
            if image_analysis.get("observed_details"):
                result["reasoning"] = f"{result.get('reasoning', '')} | Imagen: {image_analysis['observed_details']}"
        else:
            result["image_valid"] = True
            result["image_analysis"] = None
            result["severity_score"] = 5
        
        return result


# Singleton instance
_ai_validator_instance = None

def get_ai_validator() -> AIValidator:
    """Get or create AI validator instance"""
    global _ai_validator_instance
    if _ai_validator_instance is None:
        _ai_validator_instance = AIValidator()
    return _ai_validator_instance
