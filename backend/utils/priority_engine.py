"""
Priority calculation engine for reports.

Calculates the priority level (1-5) for civic incident reports based on
category, description keywords, and location.
"""
from typing import Optional


# Critical keywords that increase priority
CRITICAL_KEYWORDS = [
    "accidente",
    "niños",
    "niño",
    "niña",
    "riesgo",
    "peligro",
    "peligroso",
    "urgente",
    "emergencia",
    "grave",
    "severo",
    "inundación",
    "inundado",
    "desbordamiento",
    "fuga",
    "explosión",
    "incendio",
    "colapso",
    "herido",
    "lesionado"
]


def calculate_priority(
    category: str,
    description: str,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None
) -> int:
    """
    Calculate report priority based on category, keywords, and location.
    
    Base priority by category:
    - bache: 3
    - alumbrado: 2
    - basura: 1
    - drenaje: 4
    - vialidad: 3
    
    Priority modifiers:
    - +1 if description contains critical keywords (accidente, niños, riesgo, peligro, etc.)
    - +1 for future critical zone detection (TODO)
    
    Final priority is clamped between 1 and 5.
    
    Args:
        category: Type of incident (bache, alumbrado, basura, drenaje, vialidad)
        description: Incident description (analyzed for keywords)
        latitude: GPS latitude (optional, for future critical zone detection)
        longitude: GPS longitude (optional, for future critical zone detection)
        
    Returns:
        Priority level between 1 (low) and 5 (critical)
        
    Examples:
        >>> calculate_priority("bache", "Un bache grande")
        3
        >>> calculate_priority("bache", "Bache con riesgo de accidente para niños")
        4
        >>> calculate_priority("drenaje", "Drenaje colapsado, peligro de inundación")
        5
    """
    # Base priority by category
    category_priorities = {
        "bache": 3,
        "alumbrado": 2,
        "basura": 1,
        "drenaje": 4,
        "vialidad": 3,
    }
    
    # Get base priority (default to 2 if category not found)
    priority = category_priorities.get(category.lower(), 2)
    
    # Keyword analysis - increase priority if critical keywords found
    description_lower = description.lower()
    has_critical_keyword = any(keyword in description_lower for keyword in CRITICAL_KEYWORDS)
    
    if has_critical_keyword:
        priority += 1
    
    # TODO: Add critical zone detection based on coordinates
    # Example: Check if coordinates fall within high-traffic areas, schools, hospitals
    # if is_critical_zone(latitude, longitude):
    #     priority += 1
    
    # TODO: Add time-based priority adjustments
    # Example: Reports during peak hours or at night could have different priorities
    
    # TODO: Add historical data analysis
    # Example: Areas with recurring issues could have increased priority
    
    # Ensure priority is between 1 and 5
    priority = max(1, min(5, priority))
    
    return priority
