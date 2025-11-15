/**
 * Location Service
 * 
 * Servicios para autocompletar dirección usando:
 * - API de códigos postales de México (COPOMEX)
 * - Reverse geocoding con Nominatim (OpenStreetMap)
 */

// Configuración de APIs
const COPOMEX_API_URL = 'https://api.copomex.com/query';
const COPOMEX_TOKEN = 'pruebas'; // Token de prueba - reemplazar con token real en producción
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org';

/**
 * Obtener información de dirección por código postal
 * @param {string} codigoPostal - Código postal de 5 dígitos
 * @returns {Promise<Object>} Información de colonias, municipio y estado
 */
export async function getAddressByPostalCode(codigoPostal) {
  try {
    // Validar formato de código postal
    if (!/^\d{5}$/.test(codigoPostal)) {
      throw new Error('Código postal inválido. Debe tener 5 dígitos.');
    }

    const response = await fetch(
      `${COPOMEX_API_URL}/info_cp/${codigoPostal}?token=${COPOMEX_TOKEN}`
    );

    if (!response.ok) {
      throw new Error('Error al consultar el código postal');
    }

    const data = await response.json();

    if (!data || data.error || !data.response || !data.response.asentamiento) {
      throw new Error('Código postal no encontrado');
    }

    // Extraer colonias únicas
    const colonias = [...new Set(data.response.asentamiento)].sort();
    const municipio = data.response.municipio || '';
    const estado = data.response.estado || '';

    return {
      success: true,
      colonias,
      municipio,
      estado,
      codigoPostal
    };
  } catch (error) {
    console.error('Error en getAddressByPostalCode:', error);
    return {
      success: false,
      error: error.message,
      colonias: [],
      municipio: '',
      estado: ''
    };
  }
}

/**
 * Obtener dirección por coordenadas (reverse geocoding)
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {Promise<Object>} Información de dirección completa
 */
export async function getAddressByCoordinates(lat, lng) {
  try {
    const response = await fetch(
      `${NOMINATIM_API_URL}/reverse?` +
      `format=json&` +
      `lat=${lat}&` +
      `lon=${lng}&` +
      `addressdetails=1&` +
      `accept-language=es`,
      {
        headers: {
          'User-Agent': 'SamurAI-Platform/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener la dirección');
    }

    const data = await response.json();

    if (!data || !data.address) {
      throw new Error('No se pudo obtener la dirección para estas coordenadas');
    }

    const address = data.address;

    // Extraer información relevante
    const codigoPostal = address.postcode || '';
    const colonia = address.suburb || address.neighbourhood || address.quarter || '';
    const municipio = address.city || address.town || address.municipality || '';
    const estado = address.state || '';
    const calle = address.road || '';
    const numero = address.house_number || '';

    // Construir dirección completa
    let direccionCompleta = '';
    if (calle) {
      direccionCompleta = calle;
      if (numero) direccionCompleta += ` ${numero}`;
    }

    return {
      success: true,
      codigoPostal,
      colonia,
      municipio,
      estado,
      direccion: direccionCompleta,
      displayName: data.display_name
    };
  } catch (error) {
    console.error('Error en getAddressByCoordinates:', error);
    return {
      success: false,
      error: error.message,
      codigoPostal: '',
      colonia: '',
      municipio: '',
      estado: '',
      direccion: ''
    };
  }
}

/**
 * Validar que la dirección pertenezca a Mérida, Yucatán
 * @param {string} municipio - Nombre del municipio
 * @param {string} estado - Nombre del estado
 * @param {string} codigoPostal - Código postal (opcional)
 * @returns {Object} Resultado de validación
 */
export function validateMeridaYucatan(municipio, estado, codigoPostal = '') {
  // Normalizar strings para comparación
  const normalizeMunicipio = (str) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .trim();
  };

  const normalizeEstado = (str) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  const municipioNorm = normalizeMunicipio(municipio);
  const estadoNorm = normalizeEstado(estado);

  // Validar municipio (Mérida)
  const esMerida = municipioNorm === 'merida';

  // Validar estado (Yucatán)
  const esYucatan = estadoNorm === 'yucatan';

  // Lista de códigos postales válidos de Mérida (opcional pero recomendado)
  const codigosPostalesMerida = [
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
  ];

  // Validar código postal si se proporciona
  let cpValido = true;
  if (codigoPostal) {
    cpValido = codigosPostalesMerida.includes(codigoPostal);
  }

  const esValido = esMerida && esYucatan && cpValido;

  return {
    valid: esValido,
    esMerida,
    esYucatan,
    cpValido,
    mensaje: esValido
      ? 'Ubicación válida: Mérida, Yucatán'
      : `La ubicación ingresada no pertenece a Mérida, Yucatán. ${
          !esMerida ? `Municipio detectado: ${municipio}. ` : ''
        }${
          !esYucatan ? `Estado detectado: ${estado}. ` : ''
        }${
          codigoPostal && !cpValido ? `Código postal ${codigoPostal} no pertenece a Mérida. ` : ''
        }Verifica el código postal o la ubicación en el mapa.`
  };
}

/**
 * Obtener información completa de dirección por código postal
 * con validación de Mérida incluida
 * @param {string} codigoPostal - Código postal
 * @returns {Promise<Object>} Información completa con validación
 */
export async function getAndValidateAddressByCP(codigoPostal) {
  const addressData = await getAddressByPostalCode(codigoPostal);
  
  if (!addressData.success) {
    return addressData;
  }

  const validation = validateMeridaYucatan(
    addressData.municipio,
    addressData.estado,
    codigoPostal
  );

  return {
    ...addressData,
    validation
  };
}

/**
 * Obtener información completa de dirección por coordenadas
 * con validación de Mérida incluida
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {Promise<Object>} Información completa con validación
 */
export async function getAndValidateAddressByCoords(lat, lng) {
  const addressData = await getAddressByCoordinates(lat, lng);
  
  if (!addressData.success) {
    return addressData;
  }

  const validation = validateMeridaYucatan(
    addressData.municipio,
    addressData.estado,
    addressData.codigoPostal
  );

  return {
    ...addressData,
    validation
  };
}
