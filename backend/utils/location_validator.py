"""
Location Validator for Mérida, Yucatán

Validates that reports are from Mérida, Yucatán only.
"""
import re
from typing import Dict, Tuple

# Códigos postales válidos de Mérida, Yucatán
MERIDA_POSTAL_CODES = {
    '97000', '97050', '97070', '97100', '97110', '97113', '97115', '97117', '97118', '97119',
    '97120', '97125', '97127', '97128', '97129', '97130', '97133', '97134', '97135', '97137',
    '97138', '97139', '97140', '97143', '97144', '97145', '97146', '97147', '97148', '97149',
    '97150', '97153', '97154', '97155', '97156', '97157', '97158', '97159', '97160', '97163',
    '97164', '97165', '97166', '97167', '97168', '97169', '97170', '97173', '97174', '97175',
    '97176', '97177', '97178', '97179', '97180', '97183', '97184', '97185', '97186', '97187',
    '97188', '97189', '97190', '97193', '97194', '97195', '97196', '97197', '97198', '97199',
    '97200', '97203', '97204', '97205', '97206', '97207', '97208', '97209', '97210', '97213',
    '97214', '97215', '97216', '97217', '97218', '97219', '97220', '97223', '97224', '97225',
    '97226', '97227', '97228', '97229', '97230', '97233', '97234', '97235', '97236', '97237',
    '97238', '97239', '97240', '97243', '97244', '97245', '97246', '97247', '97248', '97249',
    '97250', '97253', '97254', '97255', '97256', '97257', '97258', '97259', '97260', '97263',
    '97264', '97265', '97266', '97267', '97268', '97269', '97270', '97273', '97274', '97275',
    '97276', '97277', '97278', '97279', '97280', '97283', '97284', '97285', '97286', '97287',
    '97288', '97289', '97290', '97293', '97294', '97295', '97296', '97297', '97298', '97299',
    '97300', '97302', '97303', '97304', '97305', '97306', '97307', '97308', '97309', '97310',
    '97312', '97313', '97314', '97315', '97316', '97317', '97318', '97319', '97320', '97323',
    '97324', '97325', '97326', '97327', '97328', '97329', '97330', '97333', '97334', '97335',
    '97336', '97337', '97338', '97339', '97340', '97343', '97344', '97345', '97346', '97347',
    '97348', '97349', '97350', '97353', '97354', '97355', '97356', '97357', '97358', '97359',
    '97360', '97363', '97364', '97365', '97366', '97367', '97368', '97369', '97370', '97373',
    '97374', '97375', '97376', '97377', '97378', '97379', '97380', '97383', '97384', '97385',
    '97386', '97387', '97388', '97389', '97390', '97393', '97394', '97395', '97396', '97397',
    '97398', '97399', '97400', '97410', '97413', '97414', '97415', '97416', '97417', '97418',
    '97419', '97420', '97423', '97424', '97425', '97426', '97427', '97428', '97429', '97430',
    '97433', '97434', '97435', '97436', '97437', '97438', '97439', '97440', '97443', '97444',
    '97445', '97446', '97447', '97448', '97449', '97450', '97453', '97454', '97455', '97456',
    '97457', '97458', '97459', '97460', '97463', '97464', '97465', '97466', '97467', '97468',
    '97469', '97470', '97473', '97474', '97475', '97476', '97477', '97478', '97479', '97480',
    '97483', '97484', '97485', '97486', '97487', '97488', '97489', '97490', '97493', '97494',
    '97495', '97496', '97497', '97498', '97499', '97500', '97503', '97504', '97505', '97506',
    '97507', '97508', '97509', '97510', '97513', '97514', '97515', '97516', '97517', '97518',
    '97519', '97520', '97523', '97524', '97525', '97526', '97527', '97528', '97529', '97530',
    '97533', '97534', '97535', '97536', '97537', '97538', '97539', '97540', '97543', '97544',
    '97545', '97546', '97547', '97548', '97549', '97550', '97553', '97554', '97555', '97556',
    '97557', '97558', '97559', '97560', '97563', '97564', '97565', '97566', '97567', '97568',
    '97569', '97570', '97573', '97574', '97575', '97576', '97577', '97578', '97579', '97580',
    '97583', '97584', '97585', '97586', '97587', '97588', '97589', '97590', '97593', '97594',
    '97595', '97596', '97597', '97598', '97599'
}


def normalize_string(text: str) -> str:
    """
    Normalize string for comparison (lowercase, no accents)
    """
    import unicodedata
    if not text:
        return ""
    
    # Remove accents
    text = unicodedata.normalize('NFD', text)
    text = ''.join(char for char in text if unicodedata.category(char) != 'Mn')
    
    # Lowercase and trim
    return text.lower().strip()


def validate_merida_location(
    description: str = None,
    postal_code: str = None,
    latitude: float = None,
    longitude: float = None
) -> Tuple[bool, str]:
    """
    Validate that a location is in Mérida, Yucatán
    
    Args:
        description: Report description that may contain address info
        postal_code: Postal code (optional)
        latitude: Latitude coordinate (optional)
        longitude: Longitude coordinate (optional)
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    
    # 1. Validate postal code if provided
    if postal_code:
        # Clean postal code
        clean_cp = re.sub(r'\D', '', postal_code)
        
        if clean_cp not in MERIDA_POSTAL_CODES:
            return False, f"El código postal {postal_code} no pertenece a Mérida, Yucatán"
    
    # 2. Validate coordinates if provided (rough bounding box for Mérida)
    if latitude is not None and longitude is not None:
        # Mérida approximate bounding box
        # North: 21.05, South: 20.85, East: -89.50, West: -89.75
        if not (20.85 <= latitude <= 21.05 and -89.75 <= longitude <= -89.50):
            return False, "Las coordenadas proporcionadas no están dentro de Mérida, Yucatán"
    
    # 3. Check description for municipality and state mentions
    if description:
        desc_normalized = normalize_string(description)
        
        # Check for explicit mentions of other municipalities
        other_municipalities = [
            'progreso', 'uman', 'tizimin', 'valladolid', 'tekax', 
            'motul', 'izamal', 'ticul', 'oxkutzcab', 'peto'
        ]
        
        for municipality in other_municipalities:
            if municipality in desc_normalized:
                return False, f"El reporte parece ser de {municipality.title()}, no de Mérida"
        
        # Check for mentions of other states
        other_states = [
            'campeche', 'quintana roo', 'tabasco', 'chiapas', 
            'veracruz', 'oaxaca', 'mexico', 'cdmx'
        ]
        
        for state in other_states:
            if state in desc_normalized:
                return False, f"El reporte parece ser de {state.title()}, no de Yucatán"
    
    # If all checks pass
    return True, "Ubicación válida: Mérida, Yucatán"


def extract_postal_code_from_description(description: str) -> str:
    """
    Try to extract postal code from description
    """
    if not description:
        return None
    
    # Look for 5-digit postal codes
    matches = re.findall(r'\b(97\d{3})\b', description)
    if matches:
        return matches[0]
    
    return None


def validate_report_location(report_data: Dict) -> Tuple[bool, str]:
    """
    Comprehensive validation of report location
    
    Args:
        report_data: Dictionary with report data (description, latitude, longitude, etc.)
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    description = report_data.get('description', '')
    latitude = report_data.get('latitude')
    longitude = report_data.get('longitude')
    
    # Try to extract postal code from description
    postal_code = extract_postal_code_from_description(description)
    
    # Validate
    is_valid, message = validate_merida_location(
        description=description,
        postal_code=postal_code,
        latitude=latitude,
        longitude=longitude
    )
    
    return is_valid, message
