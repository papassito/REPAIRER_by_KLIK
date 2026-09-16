import { 
  Customer, 
  Device, 
  Part, 
  RepairOrder, 
  AuditLogEntry, 
  UserProfile,
  StockMovement
} from '../types/repairer';

export const CURRENT_USER: UserProfile = {
  id: 'usr_tech_01',
  name: 'Ing. Mateo Valdés',
  email: 'mateo.valdes@klik-repair.com',
  role: 'TECHNICIAN',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
};

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_01',
    name: 'Carlos Mendoza Ríos',
    phone: '+52 55 4912 8841',
    email: 'carlos.mendoza@solusol.net',
    dniOrTaxId: 'RFC: MERC880412-K76',
    address: 'Av. Insurgentes Sur 1450, Col. Actipan, CDMX',
    createdAt: '2026-09-02T10:14:00Z'
  },
  {
    id: 'cust_02',
    name: 'Elena Rostova Aguilar',
    phone: '+52 55 7712 3349',
    email: 'elena.rostova@gmail.com',
    dniOrTaxId: 'RFC: ROAE930519-1L2',
    address: 'Calle Durango 88, Col. Roma Norte, CDMX',
    createdAt: '2026-09-03T11:30:00Z'
  },
  {
    id: 'cust_03',
    name: 'David Herrera Gómez',
    phone: '+52 55 9182 4470',
    email: 'david.herrera@techflow.io',
    dniOrTaxId: 'RFC: HEGD900210-9M4',
    address: 'Campos Elíseos 204, Polanco, CDMX',
    createdAt: '2026-09-04T15:20:00Z'
  },
  {
    id: 'cust_04',
    name: 'Sofía Morales Peña',
    phone: '+52 55 6091 2288',
    email: 'sofia.morales@artstudio.mx',
    createdAt: '2026-09-05T09:45:00Z'
  }
];

export const INITIAL_DEVICES: Device[] = [
  {
    id: 'dev_01',
    customerId: 'cust_01',
    type: 'smartphone',
    brand: 'Samsung',
    model: 'Galaxy A54 5G (SM-A546E)',
    serialNumber: 'R5CX30XYZ89',
    imei1: '354892109847120',
    imei2: '354892109847138',
    operatingSystem: 'Android 14 (One UI 6.1)',
    color: 'Awesome Graphite',
    storage: '128 GB',
    carrier: 'Desbloqueado',
    notes: 'Ingresa con protector de pantalla con ligero desprendimiento.',
    technicalIdentity: {
      adbSerial: 'R5CX30XYZ89',
      androidId: '8f4c2e11ab9087cd',
      buildFingerprint: 'samsung/a54xxx/a54:14/UP1A.231005.007/A546EXXU4BXB2',
      manufacturer: 'samsung',
      product: 'a54xeea',
      model: 'SM-A546E',
      bootloaderState: 'LOCKED',
      usbVendorId: '04e8',
      usbProductId: '6860',
      lastConnectedAt: '2026-09-07T11:20:00Z',
      connectionHistory: [
        {
          timestamp: '2026-09-07T11:15:00Z',
          state: 'ADB_READY',
          bridge: 'ADB',
          details: 'Handshake completado. RSA fingerprint verificado.'
        }
      ]
    }
  },
  {
    id: 'dev_02',
    customerId: 'cust_02',
    type: 'smartphone',
    brand: 'Apple',
    model: 'iPhone 14 Pro (A2890)',
    serialNumber: 'F2LXW099MD6M',
    imei1: '359124098124501',
    operatingSystem: 'iOS 17.5.1',
    color: 'Deep Purple',
    storage: '256 GB',
    carrier: 'Telcel',
    notes: 'Vidrio frontal estrellado, display touch responde intermitente.'
  },
  {
    id: 'dev_03',
    customerId: 'cust_03',
    type: 'laptop',
    brand: 'Dell',
    model: 'XPS 15 9520',
    serialNumber: '4K8LPX3-9520',
    operatingSystem: 'Windows 11 Pro 23H2',
    color: 'Platinum Silver / Carbon Fiber',
    storage: '1 TB NVMe SSD',
    notes: 'Se apaga a los 15 minutos de renderizado 3D por sobrecalentamiento extremo.'
  },
  {
    id: 'dev_04',
    customerId: 'cust_04',
    type: 'console',
    brand: 'Nintendo',
    model: 'Switch OLED (HEG-001)',
    serialNumber: 'XBW10029481920',
    operatingSystem: 'Horizon OS 18.0.0',
    color: 'Blanco',
    storage: '64 GB Interno',
    notes: 'Error 2016-0247 al insertar cualquier tarjeta microSD.'
  }
];

export const INITIAL_PARTS: Part[] = [
  {
    id: 'part_01',
    sku: 'SAM-A54-CHG-SUB',
    name: 'Sub-placa de Carga OEM Samsung Galaxy A54 5G con IC Protección',
    category: 'Placas & Conectores',
    compatibleModels: ['Samsung Galaxy A54 5G', 'SM-A546E', 'SM-A546B'],
    supplier: 'ServiPartes Móviles S.A.',
    cost: 14.50,
    salePrice: 28.00,
    stock: 7,
    minStock: 3,
    location: 'Estante B-04 / Cajón 2'
  },
  {
    id: 'part_02',
    sku: 'SAM-A54-FLX-01',
    name: 'Flex Interconexión Main a Sub-board Samsung A54 5G',
    category: 'Flexores',
    compatibleModels: ['Samsung Galaxy A54 5G', 'SM-A546E'],
    supplier: 'ServiPartes Móviles S.A.',
    cost: 4.80,
    salePrice: 12.00,
    stock: 12,
    minStock: 4,
    location: 'Gaveta C-11'
  },
  {
    id: 'part_03',
    sku: 'APL-IP14P-DISP',
    name: 'Pantalla OLED Super Retina XDR iPhone 14 Pro Original Refurb',
    category: 'Pantallas',
    compatibleModels: ['iPhone 14 Pro', 'A2890', 'A2650'],
    supplier: 'Cupertino Parts Direct',
    cost: 110.00,
    salePrice: 195.00,
    stock: 2,
    minStock: 2,
    location: 'Caja Fuerte Repuestos A-01'
  },
  {
    id: 'part_04',
    sku: 'GEN-THM-MX6',
    name: 'Pasta Térmica Arctic MX-6 Micropartículas de Carbono 4g',
    category: 'Insumos de Taller',
    compatibleModels: ['Universal Laptop / Desktop / GPU / Consola'],
    supplier: 'Compusoluciones Latam',
    cost: 5.50,
    salePrice: 14.00,
    stock: 22,
    minStock: 5,
    location: 'Mesa Técnica 1 - Dispensador'
  },
  {
    id: 'part_05',
    sku: 'NSW-SD-SLOT',
    name: 'Lector de Tarjetas MicroSD Nintendo Switch OLED Modular',
    category: 'Módulos Consola',
    compatibleModels: ['Nintendo Switch OLED HEG-001'],
    supplier: 'ConsoleFix Supply',
    cost: 6.20,
    salePrice: 18.00,
    stock: 5,
    minStock: 2,
    location: 'Gaveta E-04'
  }
];

export const INITIAL_ORDERS: RepairOrder[] = [
  {
    id: 'ord_01',
    orderNumber: 'KLIK-2026-0108',
    customerId: 'cust_01',
    customerName: 'Carlos Mendoza Ríos',
    customerPhone: '+52 55 4912 8841',
    customerEmail: 'carlos.mendoza@solusol.net',
    deviceId: 'dev_01',
    deviceSummary: 'Samsung Galaxy A54 5G (128GB)',
    status: 'IN_REPAIR',
    priority: 'HIGH',
    intakeReason: 'No carga batería ni es detectado por cargador original. Indica 0% de corriente.',
    receivedAccessories: ['Protector TPU transparente', 'Bandeja SIM instalada'],
    physicalCondition: 'Micro rayones en contorno de puerto USB. Carcasa y pantalla en buen estado sin golpes.',
    createdAt: '2026-09-07T09:15:00Z',
    createdBy: 'Recepción - Ana Morales',
    assignedTechnicianId: 'usr_tech_01',
    assignedTechnicianName: 'Ing. Mateo Valdés',
    evidence: [
      {
        id: 'ev_01',
        repairOrderId: 'ord_01',
        type: 'front',
        fileUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        createdAt: '2026-09-07T09:18:00Z',
        createdBy: 'Ana Morales',
        metadata: {
          description: 'Cara Frontal: Pantalla íntegra sin fracturas evidentes.',
          damageFlagged: false
        }
      },
      {
        id: 'ev_02',
        repairOrderId: 'ord_01',
        type: 'back',
        fileUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
        hash: 'b5a2c99a81ef34a1795bc9e29a9972b22f0e0dfb9370814bb66141386abda062',
        createdAt: '2026-09-07T09:19:00Z',
        createdBy: 'Ana Morales',
        metadata: {
          description: 'Cara Trasera: Tapa de cristal en excelente estado sin astilladuras.',
          damageFlagged: false
        }
      },
      {
        id: 'ev_03',
        repairOrderId: 'ord_01',
        type: 'bottom',
        fileUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
        hash: '7d5668e1a6c4295e87a20c32616f731118182f458e0a30b42c12a76f634bbd8d',
        createdAt: '2026-09-07T09:20:00Z',
        createdBy: 'Ana Morales',
        metadata: {
          description: 'Vista Inferior: Signos de sulfato y deformación de lengüeta interna USB-C.',
          damageFlagged: true,
          damageNotes: 'Pines de carga VBUS con corrosión verdosa visible bajo lupa.'
        }
      },
      {
        id: 'ev_04',
        repairOrderId: 'ord_01',
        type: 'top',
        fileUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
        hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
        createdAt: '2026-09-07T09:21:00Z',
        createdBy: 'Ana Morales',
        metadata: {
          description: 'Borde Superior: Micrófono secundario y bandeja SIM limpios.',
          damageFlagged: false
        }
      }
    ],
    checkIn: {
      id: 'chk_01',
      conductedAt: '2026-09-07T09:22:00Z',
      conductedBy: 'Ana Morales',
      items: {
        powersOn: { id: 'c1', name: 'Enciende', subsystem: 'Energía', status: 'PASS', notes: 'Enciende con batería residual (14%)' },
        charges: { id: 'c2', name: 'Carga de Batería', subsystem: 'Energía', status: 'FAIL', notes: 'Tester USB marca 5.0V / 0.00A continuos' },
        screenDisplay: { id: 'c3', name: 'Pantalla AMOLED', subsystem: 'Display', status: 'PASS', notes: 'Sin manchas ni líneas' },
        touch: { id: 'c4', name: 'Digitalizador Touch', subsystem: 'Display', status: 'PASS', notes: 'Respuesta fluida 120Hz' },
        frontCamera: { id: 'c5', name: 'Cámara Frontal 32MP', subsystem: 'Óptica', status: 'PASS' },
        rearCamera: { id: 'c6', name: 'Cámaras Traseras Triple', subsystem: 'Óptica', status: 'PASS' },
        microphone: { id: 'c7', name: 'Micrófono Principal', subsystem: 'Audio', status: 'PASS' },
        speakers: { id: 'c8', name: 'Bocinas Estéreo', subsystem: 'Audio', status: 'PASS' },
        buttons: { id: 'c9', name: 'Botones Power / Vol', subsystem: 'Chasis', status: 'PASS' },
        wifi: { id: 'c10', name: 'Conectividad Wi-Fi 6', subsystem: 'Radiofrecuencia', status: 'PASS' },
        bluetooth: { id: 'c11', name: 'Bluetooth 5.3', subsystem: 'Radiofrecuencia', status: 'PASS' },
        cellular: { id: 'c12', name: 'Red Móvil 5G', subsystem: 'Radiofrecuencia', status: 'PASS' },
        sensors: { id: 'c13', name: 'Acelerómetro / Proximidad', subsystem: 'Sensores', status: 'PASS' },
        biometrics: { id: 'c14', name: 'Huella Bajo Pantalla', subsystem: 'Seguridad', status: 'PASS' }
      },
      initialTechnicalSummary: 'Equipo enciende con remanente de batería. No recibe amperaje por USB-C. Falla localizada en etapa de alimentación y puerto de carga.'
    },
    diagnosticSessions: [
      {
        id: 'diag_sess_01',
        repairOrderId: 'ord_01',
        deviceId: 'dev_01',
        technicianId: 'usr_tech_01',
        technicianName: 'Ing. Mateo Valdés',
        bridge: 'ADB',
        startedAt: '2026-09-07T10:00:00Z',
        finishedAt: '2026-09-07T10:14:00Z',
        status: 'COMPLETED',
        tests: [
          {
            id: 't1',
            subsystem: 'cpu',
            name: 'Exynos 1380 Octa-Core Thermal & Stress',
            status: 'PASS',
            severity: 'INFO',
            details: '8 núcleos operando a frecuencias nominales. Temperatura CPU 38.2°C.',
            commandUsed: 'cat /sys/devices/system/cpu/cpu*/cpufreq/scaling_cur_freq'
          },
          {
            id: 't2',
            subsystem: 'memory',
            name: 'RAM LPDDR4X 6GB Integrity Check',
            status: 'PASS',
            severity: 'INFO',
            details: 'Memoria física total 5.6GB disponible, sin fugas ni panic dump.',
            commandUsed: 'dumpsys meminfo'
          },
          {
            id: 't3',
            subsystem: 'storage',
            name: 'UFS 2.2 128GB Smart Health & I/O',
            status: 'PASS',
            severity: 'INFO',
            details: 'Espacio ocupado 44.8GB / 128GB. Desgaste estimado < 5%.',
            commandUsed: 'df -h /data'
          },
          {
            id: 't4',
            subsystem: 'battery',
            name: 'FuelGauge & Battery Manager Subsystem',
            status: 'FAIL',
            severity: 'CRITICAL',
            details: 'status: 3 (Discharging), health: 2 (Good), present: true, level: 12, scale: 100, voltage: 3740mV, current_now: -420mA. Sin entrada VBUS.',
            commandUsed: 'dumpsys battery',
            rawOutput: 'Current Battery Service state:\n  AC powered: false\n  USB powered: false\n  Wireless powered: false\n  Max charging current: 0\n  Max charging voltage: 0\n  Charge counter: 580000\n  status: 3 (Discharging)\n  health: 2 (Good)\n  present: true\n  level: 12\n  scale: 100\n  voltage: 3740\n  temperature: 284\n  technology: Li-ion'
          },
          {
            id: 't5',
            subsystem: 'usb',
            name: 'USB Type-C CC1/CC2 Line Continuity',
            status: 'FAIL',
            severity: 'CRITICAL',
            details: 'Línea de comunicación de carga rápida no detecta negotiate protocol. Conector fisurado.',
            commandUsed: 'cat /sys/class/power_supply/battery/current_now'
          }
        ],
        findings: [
          {
            id: 'find_01',
            symptom: 'Dispositivo no recarga acumulador de energía (0mA)',
            observation: 'Microscopio trinocular evidencia pines 3 y 4 del puerto USB-C fundidos por arco eléctrico de humedad.',
            hypothesis: 'Falla confinada a la sub-placa de carga inferior y conector flex secundario.',
            testConducted: 'Medición con multímetro de línea VBUS: 0V en capacitor C5014.',
            testResult: 'Línea abierta antes del diodo TVS.',
            conclusion: 'Reemplazo indispensable de la sub-placa de carga original y flex de enlace para restablecer Super Fast Charging 25W.',
            severity: 'CRITICAL',
            recommendedPartSku: 'SAM-A54-CHG-SUB'
          }
        ],
        summary: 'Falla localizada en puerto de carga. Batería principal en excelente salud química. No requiere cambio de batería.'
      }
    ],
    findings: [
      {
        id: 'find_01',
        symptom: 'No carga batería (0mA)',
        observation: 'Pines USB-C internos fracturados con restos de sulfato.',
        hypothesis: 'Sub-placa de carga con circuito abierto en línea VBUS.',
        testConducted: 'ADB Dumpsys Battery + Multímetro digital Fluke en test points.',
        testResult: '0V en entrada VBUS. Subplaca sin continuidad.',
        conclusion: 'Sustitución de sub-placa de carga completa OEM y flex de señal.',
        severity: 'CRITICAL',
        recommendedPartSku: 'SAM-A54-CHG-SUB'
      }
    ],
    estimates: [
      {
        id: 'est_01_v1',
        versionNumber: 1,
        repairOrderId: 'ord_01',
        createdAt: '2026-09-07T10:30:00Z',
        createdBy: 'Ing. Mateo Valdés',
        status: 'APPROVED',
        laborTotal: 35.00,
        partsTotal: 40.00,
        servicesTotal: 0.00,
        discountTotal: 5.00,
        taxRate: 0.16,
        taxTotal: 11.20,
        grandTotal: 81.20,
        notes: 'Incluye limpieza ultrasónica del chasis y calibración de ciclo de carga.',
        viewedAt: '2026-09-07T10:45:00Z',
        approvedAt: '2026-09-07T10:50:00Z',
        approvedBy: 'Carlos Mendoza Ríos (Vía Portal KLIK)',
        customerSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10 40 Q 60 10 90 35 T 180 30" fill="none" stroke="%2338bdf8" stroke-width="3"/></svg>',
        items: [
          {
            id: 'ei_1',
            type: 'PART',
            description: 'Sub-placa de Carga OEM Samsung Galaxy A54 5G con IC Protección',
            partId: 'part_01',
            partSku: 'SAM-A54-CHG-SUB',
            quantity: 1,
            unitCost: 14.50,
            unitPrice: 28.00,
            total: 28.00
          },
          {
            id: 'ei_2',
            type: 'PART',
            description: 'Flex Interconexión Main a Sub-board Samsung A54 5G',
            partId: 'part_02',
            partSku: 'SAM-A54-FLX-01',
            quantity: 1,
            unitCost: 4.80,
            unitPrice: 12.00,
            total: 12.00
          },
          {
            id: 'ei_3',
            type: 'LABOR',
            description: 'Mano de obra técnica: Micro-desmontaje, reemplazo de submódulo y sellado térmico IP67',
            quantity: 1,
            unitCost: 0,
            unitPrice: 35.00,
            total: 35.00
          }
        ]
      }
    ],
    activeEstimateId: 'est_01_v1',
    authorizedAt: '2026-09-07T10:50:00Z',
    authorizedBy: 'Carlos Mendoza Ríos',
    workLogs: [
      {
        id: 'wl_01',
        timestamp: '2026-09-07T11:00:00Z',
        technicianId: 'usr_tech_01',
        technicianName: 'Ing. Mateo Valdés',
        category: 'DISASSEMBLY',
        action: 'Desmontaje de tapa trasera con plancha térmica a 75°C y ventosa de vacío de precisión',
        notes: 'Sellado original desprendido sin dañar pintura reflectiva.',
        toolsUsed: ['Plancha Térmica QianLi', 'Púas iFlex', 'Pinzas antiestáticas']
      },
      {
        id: 'wl_02',
        timestamp: '2026-09-07T11:22:00Z',
        technicianId: 'usr_tech_01',
        technicianName: 'Ing. Mateo Valdés',
        category: 'REPLACEMENT',
        action: 'Instalación de Sub-placa de carga OEM SAM-A54-CHG-SUB y Flex Nuevo',
        notes: 'Comprobación de antena RF coaxial y micrófono inferior alineados.',
        partsReplaced: ['Sub-placa de carga', 'Flex Interconexión']
      },
      {
        id: 'wl_03',
        timestamp: '2026-09-07T11:45:00Z',
        technicianId: 'usr_tech_01',
        technicianName: 'Ing. Mateo Valdés',
        category: 'TEST',
        action: 'Prueba de Carga Dinámica preliminar en banco',
        notes: 'Consumo registrado: 9.1V a 2.45A (Samsung Super Fast Charging 25W activo). Batería subió de 12% a 35% en 15 minutos.'
      }
    ],
    partsConsumed: [
      {
        partId: 'part_01',
        sku: 'SAM-A54-CHG-SUB',
        name: 'Sub-placa de Carga OEM Samsung Galaxy A54 5G',
        quantity: 1,
        unitPrice: 28.00,
        consumedAt: '2026-09-07T11:22:00Z'
      },
      {
        partId: 'part_02',
        sku: 'SAM-A54-FLX-01',
        name: 'Flex Interconexión Main a Sub-board Samsung A54 5G',
        quantity: 1,
        unitPrice: 12.00,
        consumedAt: '2026-09-07T11:22:00Z'
      }
    ],
    payments: [],
    statusHistory: [
      { status: 'RECEIVED', timestamp: '2026-09-07T09:15:00Z', changedBy: 'Ana Morales', comment: 'Recepción inicial en sucursal' },
      { status: 'INSPECTION', timestamp: '2026-09-07T09:22:00Z', changedBy: 'Ana Morales', comment: 'Check-in y toma de fotografías' },
      { status: 'DIAGNOSING', timestamp: '2026-09-07T10:00:00Z', changedBy: 'Ing. Mateo Valdés', comment: 'Conexión ADB e inicio de pruebas eléctricas' },
      { status: 'DIAGNOSED', timestamp: '2026-09-07T10:15:00Z', changedBy: 'Ing. Mateo Valdés', comment: 'Diagnóstico confirmado: Sub-placa dañada' },
      { status: 'ESTIMATE_PENDING', timestamp: '2026-09-07T10:30:00Z', changedBy: 'Ing. Mateo Valdés', comment: 'Presupuesto v1 redactado' },
      { status: 'WAITING_APPROVAL', timestamp: '2026-09-07T10:35:00Z', changedBy: 'Sistema KLIK', comment: 'Presupuesto notificado al cliente vía SMS/Portal' },
      { status: 'APPROVED', timestamp: '2026-09-07T10:50:00Z', changedBy: 'Carlos Mendoza Ríos', comment: 'Aprobación firmada por el cliente' },
      { status: 'IN_REPAIR', timestamp: '2026-09-07T11:00:00Z', changedBy: 'Ing. Mateo Valdés', comment: 'Apertura y reparación en Workbench' }
    ]
  },
  {
    id: 'ord_02',
    orderNumber: 'KLIK-2026-0105',
    customerId: 'cust_02',
    customerName: 'Elena Rostova Aguilar',
    customerPhone: '+52 55 7712 3349',
    customerEmail: 'elena.rostova@gmail.com',
    deviceId: 'dev_02',
    deviceSummary: 'Apple iPhone 14 Pro (256GB)',
    status: 'WAITING_PART',
    priority: 'NORMAL',
    intakeReason: 'Pantalla fracturada tras caída en pavimento. Vidrio estrellado.',
    receivedAccessories: ['Mica de cristal roto ya removida'],
    physicalCondition: 'Impacto fuerte en esquina superior derecha. Marco de acero con muesca leve.',
    createdAt: '2026-09-05T14:10:00Z',
    createdBy: 'Recepción - Ana Morales',
    assignedTechnicianId: 'usr_tech_01',
    assignedTechnicianName: 'Ing. Mateo Valdés',
    evidence: [],
    checkIn: {
      id: 'chk_02',
      conductedAt: '2026-09-05T14:15:00Z',
      conductedBy: 'Ana Morales',
      items: {
        powersOn: { id: 'c1', name: 'Enciende', subsystem: 'Energía', status: 'PASS' },
        charges: { id: 'c2', name: 'Carga', subsystem: 'Energía', status: 'PASS' },
        screenDisplay: { id: 'c3', name: 'Pantalla', subsystem: 'Display', status: 'FAIL', notes: 'Líneas verticales verdes' },
        touch: { id: 'c4', name: 'Touch', subsystem: 'Display', status: 'WARNING', notes: 'Zona superior no responde' },
        frontCamera: { id: 'c5', name: 'Cámara Frontal', subsystem: 'Óptica', status: 'PASS' },
        rearCamera: { id: 'c6', name: 'Cámara Trasera', subsystem: 'Óptica', status: 'PASS' },
        microphone: { id: 'c7', name: 'Micrófono', subsystem: 'Audio', status: 'PASS' },
        speakers: { id: 'c8', name: 'Bocinas', subsystem: 'Audio', status: 'PASS' },
        buttons: { id: 'c9', name: 'Botones', subsystem: 'Chasis', status: 'PASS' },
        wifi: { id: 'c10', name: 'Wi-Fi', subsystem: 'RF', status: 'PASS' },
        bluetooth: { id: 'c11', name: 'Bluetooth', subsystem: 'RF', status: 'PASS' },
        cellular: { id: 'c12', name: 'Red Móvil', subsystem: 'RF', status: 'PASS' },
        sensors: { id: 'c13', name: 'Sensores', subsystem: 'Sensores', status: 'PASS' },
        biometrics: { id: 'c14', name: 'Face ID', subsystem: 'Seguridad', status: 'PASS', notes: 'TrueDepth intacto' }
      },
      initialTechnicalSummary: 'Display OLED dañado por compresión. Face ID funcional. Requiere reemplazo de panel completo con reprogramación de TrueTone.'
    },
    diagnosticSessions: [],
    findings: [],
    estimates: [
      {
        id: 'est_02_v1',
        versionNumber: 1,
        repairOrderId: 'ord_02',
        createdAt: '2026-09-05T15:00:00Z',
        createdBy: 'Ing. Mateo Valdés',
        status: 'APPROVED',
        laborTotal: 45.00,
        partsTotal: 195.00,
        servicesTotal: 15.00,
        discountTotal: 0.00,
        taxRate: 0.16,
        taxTotal: 40.80,
        grandTotal: 295.80,
        approvedAt: '2026-09-05T16:00:00Z',
        approvedBy: 'Elena Rostova Aguilar',
        items: []
      }
    ],
    workLogs: [],
    partsConsumed: [],
    payments: [
      {
        id: 'pay_01',
        repairOrderId: 'ord_02',
        amount: 150.00,
        method: 'CARD',
        reference: 'AUTH-9920194',
        date: '2026-09-05T16:05:00Z',
        receivedBy: 'Caja - Roberto Silva',
        invoiceIssued: true
      }
    ],
    statusHistory: [
      { status: 'RECEIVED', timestamp: '2026-09-05T14:10:00Z', changedBy: 'Ana Morales' },
      { status: 'APPROVED', timestamp: '2026-09-05T16:00:00Z', changedBy: 'Elena Rostova Aguilar' },
      { status: 'WAITING_PART', timestamp: '2026-09-06T09:00:00Z', changedBy: 'Ing. Mateo Valdés', comment: 'Esperando arribo de lote OLED Refurb original' }
    ]
  },
  {
    id: 'ord_03',
    orderNumber: 'KLIK-2026-0098',
    customerId: 'cust_03',
    customerName: 'David Herrera Gómez',
    customerPhone: '+52 55 9182 4470',
    customerEmail: 'david.herrera@techflow.io',
    deviceId: 'dev_03',
    deviceSummary: 'Dell XPS 15 9520 (i7 12th / RTX 3050)',
    status: 'READY_FOR_PICKUP',
    priority: 'HIGH',
    intakeReason: 'Thermal throttling severo y apagado automático en cargas de render.',
    receivedAccessories: ['Cargador USB-C 130W Dell original'],
    physicalCondition: 'Excelente estado cosmético.',
    createdAt: '2026-09-04T16:00:00Z',
    createdBy: 'Ing. Mateo Valdés',
    assignedTechnicianId: 'usr_tech_01',
    assignedTechnicianName: 'Ing. Mateo Valdés',
    evidence: [],
    checkIn: {
      id: 'chk_03',
      conductedAt: '2026-09-04T16:20:00Z',
      conductedBy: 'Ing. Mateo Valdés',
      items: {
        powersOn: { id: 'c1', name: 'Enciende', subsystem: 'Energía', status: 'PASS' },
        charges: { id: 'c2', name: 'Carga', subsystem: 'Energía', status: 'PASS' },
        screenDisplay: { id: 'c3', name: 'Pantalla 4K OLED', subsystem: 'Display', status: 'PASS' },
        touch: { id: 'c4', name: 'Touch', subsystem: 'Display', status: 'PASS' },
        frontCamera: { id: 'c5', name: 'Cámara Web', subsystem: 'Óptica', status: 'PASS' },
        rearCamera: { id: 'c6', name: 'Cámara Trasera', subsystem: 'Óptica', status: 'NOT_TESTED' },
        microphone: { id: 'c7', name: 'Micrófonos', subsystem: 'Audio', status: 'PASS' },
        speakers: { id: 'c8', name: 'Bocinas Quad', subsystem: 'Audio', status: 'PASS' },
        buttons: { id: 'c9', name: 'Teclado retroiluminado', subsystem: 'Chasis', status: 'PASS' },
        wifi: { id: 'c10', name: 'Wi-Fi Killer', subsystem: 'RF', status: 'PASS' },
        bluetooth: { id: 'c11', name: 'Bluetooth', subsystem: 'RF', status: 'PASS' },
        cellular: { id: 'c12', name: 'Móvil', subsystem: 'RF', status: 'NOT_TESTED' },
        sensors: { id: 'c13', name: 'Sensores térmicos', subsystem: 'Sensores', status: 'WARNING', notes: 'Core #2 a 102°C en reposo' },
        biometrics: { id: 'c14', name: 'Lector Huella / Windows Hello', subsystem: 'Seguridad', status: 'PASS' }
      },
      initialTechnicalSummary: 'Pasta térmica original totalmente cristalizada. Disipador con alfombra de polvo.'
    },
    diagnosticSessions: [],
    findings: [],
    estimates: [],
    workLogs: [
      {
        id: 'wl_301',
        timestamp: '2026-09-06T10:00:00Z',
        technicianId: 'usr_tech_01',
        technicianName: 'Ing. Mateo Valdés',
        category: 'DISASSEMBLY',
        action: 'Desmontaje de vapor chamber y turbinas dobles',
        toolsUsed: ['Destornillador Torx T5', 'Brocha antiestática ESD']
      },
      {
        id: 'wl_302',
        timestamp: '2026-09-06T11:15:00Z',
        technicianId: 'usr_tech_01',
        technicianName: 'Ing. Mateo Valdés',
        category: 'REPAIR',
        action: 'Limpieza química con alcohol isopropílico 99.9% y aplicación de compuesto térmico Arctic MX-6',
        partsReplaced: ['Pasta Térmica Arctic MX-6']
      }
    ],
    partsConsumed: [
      {
        partId: 'part_04',
        sku: 'GEN-THM-MX6',
        name: 'Pasta Térmica Arctic MX-6',
        quantity: 1,
        unitPrice: 14.00,
        consumedAt: '2026-09-06T11:15:00Z'
      }
    ],
    qualityControl: {
      id: 'qc_03',
      repairOrderId: 'ord_03',
      performedAt: '2026-09-06T15:00:00Z',
      performedBy: 'Ing. Mateo Valdés (QC Certified)',
      status: 'PASSED',
      checklist: [
        { id: 'qc_1', name: 'Stress Test CPU Cinebench R23 30 min continuo', status: 'PASS', notes: 'Temperatura máxima estabilizada en 76°C' },
        { id: 'qc_2', name: 'Carga completa 130W', status: 'PASS' },
        { id: 'qc_3', name: 'Revolución balanceada de turbinas sin chirridos', status: 'PASS' },
        { id: 'qc_4', name: 'Puertos Thunderbolt 4 funcionales', status: 'PASS' }
      ],
      beforeAfterComparison: {
        initialSymptom: 'Apagado por sobrecalentamiento > 102°C',
        initialFaultConfirmed: 'Cero conductividad térmica por desecación de compuesto fábrica',
        repairedSolution: 'Mantenimiento preventivo exhaustivo, limpieza de aletas y Arctic MX-6',
        postRepairValidation: 'Cero thermal throttling. Rendimiento sostenido al 100%'
      },
      notes: 'Equipo verificado listo para entrega al cliente.'
    },
    payments: [
      {
        id: 'pay_301',
        repairOrderId: 'ord_03',
        amount: 85.00,
        method: 'TRANSFER',
        reference: 'SPEI-81920847',
        date: '2026-09-06T16:00:00Z',
        receivedBy: 'Roberto Silva',
        invoiceIssued: true
      }
    ],
    warranty: {
      id: 'warr_03',
      repairOrderId: 'ord_03',
      policyNumber: 'KLIK-WARR-2026-098',
      durationDays: 60,
      startDate: '2026-09-06',
      endDate: '2026-11-05',
      terms: 'Garantía sobre estabilidad térmica y mano de obra del mantenimiento preventivo.',
      status: 'ACTIVE',
      claims: []
    },
    statusHistory: [
      { status: 'RECEIVED', timestamp: '2026-09-04T16:00:00Z', changedBy: 'Ing. Mateo Valdés' },
      { status: 'IN_REPAIR', timestamp: '2026-09-06T10:00:00Z', changedBy: 'Ing. Mateo Valdés' },
      { status: 'QUALITY_CONTROL', timestamp: '2026-09-06T15:00:00Z', changedBy: 'Ing. Mateo Valdés' },
      { status: 'READY_FOR_PICKUP', timestamp: '2026-09-06T16:30:00Z', changedBy: 'Sistema KLIK', comment: 'Cliente notificado para recolección' }
    ]
  }
];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'sm_01',
    partId: 'part_01',
    partSku: 'SAM-A54-CHG-SUB',
    partName: 'Sub-placa de Carga OEM Samsung Galaxy A54 5G',
    repairOrderId: 'ord_01',
    type: 'CONSUMPTION',
    quantity: 1,
    previousStock: 8,
    newStock: 7,
    timestamp: '2026-09-07T11:22:00Z',
    performedBy: 'Ing. Mateo Valdés',
    reason: 'Consumo directo en reparación orden KLIK-2026-0108'
  },
  {
    id: 'sm_02',
    partId: 'part_02',
    partSku: 'SAM-A54-FLX-01',
    partName: 'Flex Interconexión Main a Sub-board Samsung A54 5G',
    repairOrderId: 'ord_01',
    type: 'CONSUMPTION',
    quantity: 1,
    previousStock: 13,
    newStock: 12,
    timestamp: '2026-09-07T11:22:00Z',
    performedBy: 'Ing. Mateo Valdés',
    reason: 'Consumo directo en reparación orden KLIK-2026-0108'
  },
  {
    id: 'sm_03',
    partId: 'part_04',
    partSku: 'GEN-THM-MX6',
    partName: 'Pasta Térmica Arctic MX-6',
    repairOrderId: 'ord_03',
    type: 'CONSUMPTION',
    quantity: 1,
    previousStock: 23,
    newStock: 22,
    timestamp: '2026-09-06T11:15:00Z',
    performedBy: 'Ing. Mateo Valdés',
    reason: 'Mantenimiento térmico orden KLIK-2026-0098'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud_01',
    repairOrderId: 'ord_01',
    timestamp: '2026-09-07T09:15:00Z',
    who: { id: 'usr_rec_01', name: 'Ana Morales', role: 'RECEPTION' },
    what: 'Creación de Orden de Reparación KLIK-2026-0108',
    actionType: 'ORDER_CREATE',
    where: 'Terminal Recepción Sucursal Norte',
    why: 'Ingreso presencial de cliente con falla de carga en dispositivo',
    result: 'PASS',
    payloadSummary: 'Cliente Carlos Mendoza, Samsung A54 5G, IMEI 354892109847120',
    hash: 'fa82019b8827cf48921a9901e827110023bf9a8b192083921019284719283920'
  },
  {
    id: 'aud_02',
    repairOrderId: 'ord_01',
    timestamp: '2026-09-07T09:22:00Z',
    who: { id: 'usr_rec_01', name: 'Ana Morales', role: 'RECEPTION' },
    what: 'Registro de Check-in Técnico inicial y carga de 4 evidencias fotográficas',
    actionType: 'CHECK_IN_INSPECTION',
    where: 'Módulo de Inspección Visual #1',
    why: 'Protocolo de protección legal mutua y validación de estado cosmético',
    result: 'PASS',
    payloadSummary: '14 subsistemas evaluados. Carga = FAIL. 4 fotos con hash SHA-256 inmutable.',
    hash: '91823901bcda9018234891a02984189201948291049281049182049182049182'
  },
  {
    id: 'aud_03',
    repairOrderId: 'ord_01',
    timestamp: '2026-09-07T10:05:00Z',
    who: { id: 'usr_tech_01', name: 'Ing. Mateo Valdés', role: 'TECHNICIAN' },
    what: 'Conexión ADB y Ejecución de Comandos Allowlist (dumpsys battery, wm, df)',
    actionType: 'ADB_COMMAND',
    where: 'Estación de Diagnóstico #3 (Linux Workstation)',
    why: 'Diagnóstico automatizado de telemetría de hardware de batería y sistema',
    result: 'PASS',
    command: 'dumpsys battery; df -h /data',
    payloadSummary: 'Handshake RSA exitoso. Telemetría confirma 0mA corriente de entrada y puerto abierto.',
    hash: 'cc10982390123849102830192840192840192840192840192840192840192840'
  },
  {
    id: 'aud_04',
    repairOrderId: 'ord_01',
    timestamp: '2026-09-07T10:50:00Z',
    who: { id: 'cust_01', name: 'Carlos Mendoza Ríos', role: 'CUSTOMER' },
    what: 'Aprobación formal de Presupuesto v1 ($81.20 USD)',
    actionType: 'ESTIMATE_APPROVE',
    where: 'Portal Seguro del Cliente (IP 189.201.42.10)',
    why: 'Aceptación explícita de costos de refacciones y mano de obra con firma criptográfica',
    result: 'PASS',
    payloadSummary: 'Versión 1 aprobada con firma digital. Transición a REPAIR_AUTHORIZED.',
    hash: 'dd81920381092830192830192830192830192830192830192830192830192830'
  },
  {
    id: 'aud_05',
    repairOrderId: 'ord_01',
    timestamp: '2026-09-07T11:22:00Z',
    who: { id: 'usr_tech_01', name: 'Ing. Mateo Valdés', role: 'TECHNICIAN' },
    what: 'Consumo auditable de refacciones: SAM-A54-CHG-SUB y SAM-A54-FLX-01',
    actionType: 'PART_CONSUME',
    where: 'Workbench #3 / Sistema de Inventario',
    why: 'Instalación física de componentes de repuesto en el equipo',
    result: 'PASS',
    payloadSummary: 'Stock debitado con trazabilidad. Stock_movement sm_01 y sm_02 vinculados a orden.',
    hash: 'ee71829381920381920381920381920381920381920381920381920381920381'
  }
];
