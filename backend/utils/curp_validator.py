"""
CURP validation utility.

Validates Mexican CURP (Clave Única de Registro de Población) format.
"""
import re


def validate_curp(curp: str) -> bool:
    """
    Validate CURP format using regex pattern.
    
    CURP format: 4 letters + 6 digits + H/M + 5 letters + 1 alphanumeric + 1 digit
    Example: ABCD123456HMNABC01
    
    Args:
        curp: CURP string to validate
        
    Returns:
        True if CURP matches the valid format, False otherwise
    """
    if not curp:
        return False
    
    # CURP regex pattern
    # Format: LLLL######HM*****#
    # L = Letter, # = Digit, H/M = Gender, * = Letter or digit
    pattern = r"^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$"
    
    return bool(re.match(pattern, curp.upper()))
