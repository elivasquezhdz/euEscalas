/* ============================================================
   Definición de escalas - Valoración Geriátrica Integral
   Cada escala expone:
     id, name, short, category, tag, description,
     items: [ { id, text, hint?, options:[{label, value}] } ] o sections
     interpret(score, ctx) -> { label, level: 'ok'|'warn'|'danger'|'info', detail }
     maxScore (numérico o función)
   ============================================================ */
(function () {
  const SI_NO = [
    { label: 'No', value: 0 },
    { label: 'Sí', value: 1 },
  ];
  const NO_SI = [
    { label: 'No', value: 0 },
    { label: 'Sí', value: 1 },
  ];

  // Helper para construir reactivos rápidos
  const q = (id, text, options, hint) => ({ id, text, options, hint });

  const SCALES = [];

  /* ====== 1. FRAIL ============================================ */
  SCALES.push({
    id: 'frail',
    name: 'FRAIL',
    short: 'FRAIL',
    icon: 'F',
    category: 'Fragilidad',
    tag: 'Detección de fragilidad',
    description:
      'Cuestionario FRAIL para detección de fragilidad en el adulto mayor. Cada respuesta afirmativa suma 1 punto.',
    items: [
      q('fatigue', '¿Está usted cansado?', SI_NO),
      q('resistance', '¿Es incapaz de subir un piso de escaleras?', SI_NO),
      q('ambulation', '¿Es incapaz de caminar una manzana?', SI_NO),
      q('illness', '¿Tiene más de cinco enfermedades?', SI_NO),
      q('weight', '¿Ha perdido más del 5% de su peso en los últimos 6 meses?', SI_NO),
    ],
    interpret(s) {
      if (s === 0) return { label: 'Robusto', level: 'ok', detail: 'Sin criterios de fragilidad.' };
      if (s <= 2) return { label: 'Prefrágil', level: 'warn', detail: '1-2 criterios positivos. Vigilar y prevenir.' };
      return { label: 'Frágil', level: 'danger', detail: '3 o más criterios. Intervención geriátrica.' };
    },
  });

  /* ====== 2. Yesavage GDS-15 =================================== */
  SCALES.push({
    id: 'yesavage',
    name: 'Yesavage GDS-15',
    short: 'Yesavage',
    icon: 'Y',
    category: 'Ánimo',
    tag: 'Depresión geriátrica',
    description:
      'Escala de Depresión Geriátrica de Yesavage (versión reducida, 15 ítems). Marcar la respuesta del paciente.',
    items: [
      // Cada ítem indica el valor que suma cuando se responde de forma "depresiva"
      // Estructura: opciones con value 0/1 según convención del GDS-15.
      q('y1', '¿Está satisfecho/a con su vida?', [
        { label: 'Sí', value: 0 }, { label: 'No', value: 1 },
      ]),
      q('y2', '¿Ha renunciado a muchas actividades?', [
        { label: 'Sí', value: 1 }, { label: 'No', value: 0 },
      ]),
      q('y3', '¿Siente que su vida está vacía?', [
        { label: 'Sí', value: 1 }, { label: 'No', value: 0 },
      ]),
      q('y4', '¿Se encuentra a menudo aburrido/a?', [
        { label: 'Sí', value: 1 }, { label: 'No', value: 0 },
      ]),
      q('y5', '¿Tiene a menudo buen ánimo?', [
        { label: 'Sí', value: 0 }, { label: 'No', value: 1 },
      ]),
      q('y6', '¿Teme que algo malo le pase?', [
        { label: 'Sí', value: 1 }, { label: 'No', value: 0 },
      ]),
      q('y7', '¿Se siente feliz muchas veces?', [
        { label: 'Sí', value: 0 }, { label: 'No', value: 1 },
      ]),
      q('y8', '¿Se siente a menudo abandonado/a?', [
        { label: 'Sí', value: 1 }, { label: 'No', value: 0 },
      ]),
      q('y9', '¿Prefiere quedarse en casa a salir y hacer cosas nuevas?', [
        { label: 'Sí', value: 1 }, { label: 'No', value: 0 },
      ]),
      q('y10', '¿Cree tener más problemas de memoria que la mayoría de la gente?', [
        { label: 'Sí', value: 1 }, { label: 'No', value: 0 },
      ]),
      q('y11', '¿Piensa que es maravilloso vivir?', [
        { label: 'Sí', value: 0 }, { label: 'No', value: 1 },
      ]),
      q('y12', '¿Le cuesta iniciar nuevos proyectos?', [
        { label: 'Sí', value: 1 }, { label: 'No', value: 0 },
      ]),
      q('y13', '¿Se siente lleno/a de energía?', [
        { label: 'Sí', value: 0 }, { label: 'No', value: 1 },
      ]),
      q('y14', '¿Siente que su situación es desesperada?', [
        { label: 'Sí', value: 1 }, { label: 'No', value: 0 },
      ]),
      q('y15', '¿Cree que mucha gente está mejor que usted?', [
        { label: 'Sí', value: 1 }, { label: 'No', value: 0 },
      ]),
    ],
    interpret(s) {
      if (s <= 4) return { label: 'Normal', level: 'ok', detail: '0-4 puntos.' };
      if (s <= 9) return { label: 'Depresión leve', level: 'warn', detail: '5-9 puntos: probable depresión leve.' };
      return { label: 'Depresión establecida', level: 'danger', detail: '≥10 puntos: depresión establecida.' };
    },
  });

  /* ====== 3. CAM (Confusion Assessment Method) ================= */
  SCALES.push({
    id: 'cam',
    name: 'CAM',
    short: 'CAM',
    icon: 'C',
    category: 'Cognición',
    tag: 'Detección de delirium',
    description:
      'Confusion Assessment Method. El diagnóstico de delirium requiere la presencia de los criterios 1 y 2, y al menos uno de los criterios 3 ó 4.',
    items: [
      q('c1', '1. Comienzo agudo y curso fluctuante', SI_NO,
        '¿Hay evidencia de un cambio agudo en el estado mental basal? ¿La conducta fluctúa durante el día?'),
      q('c2', '2. Alteración de la atención', SI_NO,
        '¿El paciente presenta dificultad para mantener la atención, distractibilidad o pérdida del hilo del discurso?'),
      q('c3', '3. Pensamiento desorganizado', SI_NO,
        '¿El pensamiento del paciente es desorganizado o incoherente, con conversación irrelevante o flujo ilógico?'),
      q('c4', '4. Alteración del nivel de conciencia', SI_NO,
        '¿El nivel de conciencia es distinto al alerta (vigilante, letárgico, estupor, coma)?'),
    ],
    customResult: true,
    interpret(_, ctx) {
      const v = ctx.values;
      const c1 = v.c1 === 1, c2 = v.c2 === 1, c3 = v.c3 === 1, c4 = v.c4 === 1;
      const positive = c1 && c2 && (c3 || c4);
      if (positive) {
        return { label: 'Delirium positivo', level: 'danger', detail: 'Criterios CAM cumplidos. Valorar etiología y manejo inmediato.' };
      }
      if (c1 || c2 || c3 || c4) {
        return { label: 'No diagnóstico de delirium', level: 'warn', detail: 'No se cumplen criterios CAM completos. Reevaluar.' };
      }
      return { label: 'Sin delirium', level: 'ok', detail: 'Ningún criterio positivo.' };
    },
  });

  /* ====== 4. MMSE (Folstein) =================================== */
  SCALES.push({
    id: 'mmse',
    name: 'Mini-Mental (MMSE)',
    short: 'MMSE',
    icon: 'M',
    category: 'Cognición',
    tag: 'Estado cognitivo',
    description:
      'Mini-Examen del Estado Mental (Folstein). Puntaje total sobre 30 puntos.',
    sections: [
      {
        title: '1. Orientación (10 pts)',
        items: [
          q('o_year', 'Año', [ {label:'Correcto', value:1}, {label:'Incorrecto', value:0} ]),
          q('o_season', 'Estación', [ {label:'Correcto', value:1}, {label:'Incorrecto', value:0} ]),
          q('o_month', 'Mes', [ {label:'Correcto', value:1}, {label:'Incorrecto', value:0} ]),
          q('o_day', 'Día', [ {label:'Correcto', value:1}, {label:'Incorrecto', value:0} ]),
          q('o_weekday', 'Día de la semana', [ {label:'Correcto', value:1}, {label:'Incorrecto', value:0} ]),
          q('o_place', 'Lugar (hospital/casa)', [ {label:'Correcto', value:1}, {label:'Incorrecto', value:0} ]),
          q('o_floor', 'Piso', [ {label:'Correcto', value:1}, {label:'Incorrecto', value:0} ]),
          q('o_city', 'Ciudad', [ {label:'Correcto', value:1}, {label:'Incorrecto', value:0} ]),
          q('o_state', 'Estado', [ {label:'Correcto', value:1}, {label:'Incorrecto', value:0} ]),
          q('o_country', 'País', [ {label:'Correcto', value:1}, {label:'Incorrecto', value:0} ]),
        ],
      },
      {
        title: '2. Memoria inmediata (3 pts) — Pelota, Bandera, Árbol',
        items: [
          q('m_imm', 'Palabras repetidas correctamente',
            [ {label:'0', value:0}, {label:'1', value:1}, {label:'2', value:2}, {label:'3', value:3} ],
            'Nombrar las 3 palabras y pedir que las repita.'),
        ],
      },
      {
        title: '3. Atención y cálculo (5 pts) — 100, 93, 86, 79, 72, 65',
        items: [
          q('a_calc', 'Restas correctas',
            [ {label:'0', value:0}, {label:'1', value:1}, {label:'2', value:2}, {label:'3', value:3}, {label:'4', value:4}, {label:'5', value:5} ],
            'Restar 7 a partir de 100 cinco veces. Alternativa: deletrear MUNDO al revés.'),
        ],
      },
      {
        title: '4. Recuerdo (3 pts)',
        items: [
          q('r_rec', 'Palabras recordadas',
            [ {label:'0', value:0}, {label:'1', value:1}, {label:'2', value:2}, {label:'3', value:3} ],
            'Recordar las 3 palabras previas (Pelota, Bandera, Árbol).'),
        ],
      },
      {
        title: '5. Lenguaje (9 pts)',
        items: [
          q('l_name', 'Nombrar: Lápiz y Reloj',
            [ {label:'0', value:0}, {label:'1', value:1}, {label:'2', value:2} ]),
          q('l_rep', 'Repetición: "Ni sí, ni no, ni pero"',
            [ {label:'Correcto', value:1}, {label:'Incorrecto', value:0} ]),
          q('l_read', 'Leer y obedecer: "Cierre los ojos"',
            [ {label:'Correcto', value:1}, {label:'Incorrecto', value:0} ]),
          q('l_order', 'Orden de 3 pasos: Tomar, doblar, colocar',
            [ {label:'0', value:0}, {label:'1', value:1}, {label:'2', value:2}, {label:'3', value:3} ]),
          q('l_write', 'Escribir una frase con sentido',
            [ {label:'Correcto', value:1}, {label:'Incorrecto', value:0} ]),
          q('l_copy', 'Copiar dibujo (pentágonos)',
            [ {label:'Correcto', value:1}, {label:'Incorrecto', value:0} ]),
        ],
      },
    ],
    interpret(s, ctx) {
      const age = ctx.patient?.age || 0;
      let cutoff = 24;
      if (age >= 75) cutoff = 23;
      if (s >= cutoff) return { label: 'Sin deterioro', level: 'ok', detail: `Puntaje ≥ ${cutoff}.` };
      if (s >= 18) return { label: 'Deterioro leve', level: 'warn', detail: 'Compatible con deterioro cognitivo leve.' };
      if (s >= 10) return { label: 'Deterioro moderado', level: 'danger', detail: 'Compatible con deterioro moderado.' };
      return { label: 'Deterioro severo', level: 'danger', detail: 'Compatible con deterioro severo.' };
    },
  });

  /* ====== 5. Lawton (IADL) ===================================== */
  SCALES.push({
    id: 'lawton',
    name: 'Lawton-Brody',
    short: 'Lawton',
    icon: 'L',
    category: 'Funcional',
    tag: 'Actividades instrumentales',
    description:
      'Escala de Lawton-Brody de actividades instrumentales de la vida diaria. Se considera independiente con la puntuación máxima (mujeres 8, hombres 5: no incluye lavandería, comida ni casa).',
    items: [
      q('lw_phone', 'Usar el teléfono',
        [ {label:'Independiente', value:1}, {label:'Dependiente', value:0} ],
        'Capaz de marcar números y contestar.'),
      q('lw_shop', 'Hacer compras',
        [ {label:'Independiente', value:1}, {label:'Dependiente', value:0} ]),
      q('lw_cook', 'Preparar la comida',
        [ {label:'Independiente', value:1}, {label:'Dependiente', value:0} ]),
      q('lw_house', 'Cuidar la casa',
        [ {label:'Independiente', value:1}, {label:'Dependiente', value:0} ]),
      q('lw_laundry', 'Lavado de ropa',
        [ {label:'Independiente', value:1}, {label:'Dependiente', value:0} ]),
      q('lw_transport', 'Usar medios de transporte',
        [ {label:'Independiente', value:1}, {label:'Dependiente', value:0} ]),
      q('lw_med', 'Responsabilidad sobre su medicación',
        [ {label:'Independiente', value:1}, {label:'Dependiente', value:0} ]),
      q('lw_money', 'Manejo de asuntos económicos',
        [ {label:'Independiente', value:1}, {label:'Dependiente', value:0} ]),
    ],
    interpret(s, ctx) {
      const sex = ctx.patient?.sex;
      if (sex === 'M') {
        if (s >= 5) return { label: 'Independiente', level: 'ok', detail: 'Hombres: máximo 5 (no incluye 3 ítems).' };
        if (s >= 3) return { label: 'Dependencia moderada', level: 'warn', detail: '' };
        return { label: 'Dependencia severa', level: 'danger', detail: '' };
      }
      if (s === 8) return { label: 'Independiente', level: 'ok', detail: 'Total de 8 actividades.' };
      if (s >= 4) return { label: 'Dependencia moderada', level: 'warn', detail: '' };
      if (s >= 1) return { label: 'Dependencia severa', level: 'danger', detail: '' };
      return { label: 'Dependencia total', level: 'danger', detail: '' };
    },
  });

  /* ====== 6. Barthel ========================================== */
  SCALES.push({
    id: 'barthel',
    name: 'Barthel',
    short: 'Barthel',
    icon: 'B',
    category: 'Funcional',
    tag: 'Actividades básicas',
    description:
      'Índice de Barthel para actividades básicas de la vida diaria. Puntaje máximo 100.',
    items: [
      q('b_eat', 'Comer',
        [ {label:'Dependiente', value:0}, {label:'Necesita ayuda', value:5}, {label:'Independiente', value:10} ]),
      q('b_bath', 'Bañarse',
        [ {label:'Dependiente', value:0}, {label:'Independiente', value:5} ]),
      q('b_groom', 'Aseo personal',
        [ {label:'Dependiente', value:0}, {label:'Independiente', value:5} ]),
      q('b_dress', 'Vestirse',
        [ {label:'Dependiente', value:0}, {label:'Necesita ayuda', value:5}, {label:'Independiente', value:10} ]),
      q('b_stool', 'Control intestinal',
        [ {label:'Incontinente', value:0}, {label:'Ocasional', value:5}, {label:'Continente', value:10} ]),
      q('b_urine', 'Control urinario',
        [ {label:'Incontinente', value:0}, {label:'Ocasional', value:5}, {label:'Continente', value:10} ]),
      q('b_toilet', 'Uso del sanitario',
        [ {label:'Dependiente', value:0}, {label:'Necesita ayuda', value:5}, {label:'Independiente', value:10} ]),
      q('b_chair', 'Trasladarse silla/cama',
        [ {label:'Incapaz', value:0}, {label:'Gran ayuda', value:5}, {label:'Mínima ayuda', value:10}, {label:'Independiente', value:15} ]),
      q('b_walk', 'Deambular',
        [ {label:'Inmóvil', value:0}, {label:'En silla de ruedas', value:5}, {label:'Con ayuda de 1', value:10}, {label:'Independiente', value:15} ]),
      q('b_stairs', 'Subir escaleras',
        [ {label:'Incapaz', value:0}, {label:'Necesita ayuda', value:5}, {label:'Independiente', value:10} ]),
    ],
    interpret(s) {
      if (s === 100) return { label: 'Independencia total', level: 'ok', detail: '100 puntos.' };
      if (s >= 60) return { label: 'Dependencia leve', level: 'warn', detail: '60-95 puntos.' };
      if (s >= 40) return { label: 'Dependencia moderada', level: 'warn', detail: '40-55 puntos.' };
      if (s >= 20) return { label: 'Dependencia severa', level: 'danger', detail: '20-35 puntos.' };
      return { label: 'Dependencia total', level: 'danger', detail: '< 20 puntos.' };
    },
  });

  /* ====== 7. Tinetti (POMA) =================================== */
  SCALES.push({
    id: 'tinetti',
    name: 'Tinetti (POMA)',
    short: 'Tinetti',
    icon: 'T',
    category: 'Marcha',
    tag: 'Equilibrio y marcha',
    description:
      'Evaluación de la Movilidad Orientada por el Desempeño (Performance-Oriented Mobility Assessment). Puntaje máximo 28 (Equilibrio 16 + Marcha 12).',
    sections: [
      {
        title: 'Equilibrio (16 pts)',
        items: [
          q('t_e1', 'Equilibrio sentado en la silla',
            [ {label:'Se va de lado o resbala', value:0}, {label:'Firme y seguro', value:1} ]),
          q('t_e2', 'Levantarse de la silla',
            [ {label:'Incapaz sin ayuda', value:0}, {label:'Capaz en >1 intento', value:1}, {label:'Capaz a la primera', value:2} ]),
          q('t_e3', 'Intentos para levantarse',
            [ {label:'Incapaz sin ayuda', value:0}, {label:'Usa los brazos', value:1}, {label:'Sin brazos', value:2} ]),
          q('t_e4', 'Equilibrio inmediato (5 s)',
            [ {label:'Inestable / vacila', value:0}, {label:'Estable con apoyo', value:1}, {label:'Estable sin apoyo', value:2} ]),
          q('t_e5', 'Equilibrio en bipedestación',
            [ {label:'Inestable', value:0}, {label:'Base ancha o apoyo', value:1}, {label:'Base normal', value:2} ]),
          q('t_e6', 'Presión esternal',
            [ {label:'Comienza a caer', value:0}, {label:'Se tambalea / se recupera', value:1}, {label:'Firme', value:2} ]),
          q('t_e7', 'Ojos cerrados en bipedestación',
            [ {label:'Inestable', value:0}, {label:'Estable', value:1} ]),
          q('t_e8', 'Vuelta 360°',
            [ {label:'Pasos irregulares', value:0}, {label:'Pasos uniformes', value:1}, {label:'Inestable', value:0}, {label:'Estable', value:1} ],
            'Sumar pasos + estabilidad (máx 2).'),
          q('t_e9', 'Sentarse',
            [ {label:'Inseguro', value:0}, {label:'Usa los brazos', value:1}, {label:'Seguro con suavidad', value:2} ]),
        ],
      },
      {
        title: 'Marcha (12 pts)',
        items: [
          q('t_m1', 'Inicio de la marcha',
            [ {label:'Duda / arranca varias veces', value:0}, {label:'No titubea', value:1} ]),
          q('t_m2a', 'Balance pie derecho — paso',
            [ {label:'No rebasa al izquierdo', value:0}, {label:'Rebasa al izquierdo', value:1} ]),
          q('t_m2b', 'Balance pie derecho — altura',
            [ {label:'No deja el piso', value:0}, {label:'Deja el piso', value:1} ]),
          q('t_m2c', 'Balance pie izquierdo — paso',
            [ {label:'No rebasa al derecho', value:0}, {label:'Rebasa al derecho', value:1} ]),
          q('t_m2d', 'Balance pie izquierdo — altura',
            [ {label:'No deja el piso', value:0}, {label:'Deja el piso', value:1} ]),
          q('t_m3', 'Simetría del paso',
            [ {label:'Desigual', value:0}, {label:'Uniforme', value:1} ]),
          q('t_m4', 'Continuidad del paso',
            [ {label:'Discontinuos', value:0}, {label:'Parecen continuos', value:1} ]),
          q('t_m5', 'Camino',
            [ {label:'Marcada desviación', value:0}, {label:'Desviación leve / se apoya', value:1}, {label:'Derecho sin auxilio', value:2} ]),
          q('t_m6', 'Tronco',
            [ {label:'Balanceo marcado / apoyo físico', value:0}, {label:'Flexiona rodillas o dorso', value:1}, {label:'Sin balanceo, sin flexión', value:2} ]),
          q('t_m7', 'Base de sustentación',
            [ {label:'Talones se tocan al caminar', value:0}, {label:'Talones separados', value:1} ]),
        ],
      },
    ],
    interpret(s) {
      if (s >= 25) return { label: 'Bajo riesgo de caída', level: 'ok', detail: '25-28 puntos.' };
      if (s >= 19) return { label: 'Riesgo moderado', level: 'warn', detail: '19-24 puntos.' };
      return { label: 'Alto riesgo de caída', level: 'danger', detail: '< 19 puntos.' };
    },
  });

  /* ====== 8. Downton (caídas) ================================= */
  SCALES.push({
    id: 'downton',
    name: 'Downton',
    short: 'Downton',
    icon: 'D',
    category: 'Marcha',
    tag: 'Riesgo de caídas',
    description:
      'Escala de Downton para evaluación del riesgo de caídas. Puntaje ≥ 2 indica alto riesgo.',
    items: [
      q('d1', 'Caídas previas',
        [ {label:'Ninguna', value:0}, {label:'Sí', value:1} ]),
      q('d2_a', 'Medicamentos — Ninguno', [{label:'No', value:0}, {label:'Sí', value:0}]),
      q('d2_b', 'Medicamentos — Tranquilizantes / sedantes', NO_SI),
      q('d2_c', 'Medicamentos — Diuréticos', NO_SI),
      q('d2_d', 'Medicamentos — Hipotensores (no diuréticos)', NO_SI),
      q('d2_e', 'Medicamentos — Antiparkinsonianos', NO_SI),
      q('d2_f', 'Medicamentos — Antidepresivos', NO_SI),
      q('d2_g', 'Medicamentos — Otros', NO_SI),
      q('d3_vis', 'Déficits sensoriales — Alteraciones visuales', NO_SI),
      q('d3_aud', 'Déficits sensoriales — Alteraciones auditivas', NO_SI),
      q('d3_eq', 'Déficits sensoriales — Extremidades (ictus, etc.)', NO_SI),
      q('d4', 'Estado mental',
        [ {label:'Orientado', value:0}, {label:'Confuso', value:1} ]),
      q('d5', 'Deambulación',
        [ {label:'Normal', value:0}, {label:'Segura con ayuda', value:1}, {label:'Insegura con/sin ayuda', value:1}, {label:'Imposible', value:0} ]),
    ],
    interpret(s) {
      if (s >= 2) return { label: 'Alto riesgo de caídas', level: 'danger', detail: '≥ 2 puntos.' };
      if (s === 1) return { label: 'Riesgo moderado', level: 'warn', detail: '1 punto.' };
      return { label: 'Bajo riesgo', level: 'ok', detail: '0 puntos.' };
    },
  });

  /* ====== 9. MNA (cribado) ==================================== */
  SCALES.push({
    id: 'mna',
    name: 'MNA cribado',
    short: 'MNA',
    icon: 'N',
    category: 'Nutrición',
    tag: 'Mini Nutritional Assessment',
    description:
      'Mini Nutritional Assessment - Short Form. Detecta riesgo nutricional en adultos mayores. Puntaje máximo 14.',
    items: [
      q('mna_a', 'A. ¿Ha comido menos por falta de apetito, problemas digestivos o dificultades de masticación/deglución en los últimos 3 meses?', [
        { label: 'Anorexia severa', value: 0 },
        { label: 'Anorexia moderada', value: 1 },
        { label: 'Sin anorexia', value: 2 },
      ]),
      q('mna_b', 'B. Pérdida de peso en los últimos 3 meses', [
        { label: '> 3 kg', value: 0 },
        { label: 'No lo sabe', value: 1 },
        { label: '1 a 3 kg', value: 2 },
        { label: 'No ha habido pérdida', value: 3 },
      ]),
      q('mna_c', 'C. Movilidad', [
        { label: 'De la cama al sillón', value: 0 },
        { label: 'Autonomía en el interior', value: 1 },
        { label: 'Sale del domicilio', value: 2 },
      ]),
      q('mna_d', 'D. ¿Enfermedad aguda o estrés psicológico en los últimos 3 meses?', [
        { label: 'Sí', value: 0 },
        { label: 'No', value: 2 },
      ]),
      q('mna_e', 'E. Problemas neuropsicológicos', [
        { label: 'Demencia o depresión grave', value: 0 },
        { label: 'Demencia moderada', value: 1 },
        { label: 'Sin problemas', value: 2 },
      ]),
      q('mna_f', 'F. Índice de Masa Corporal (IMC)', [
        { label: '< 19', value: 0 },
        { label: '19 a < 21', value: 1 },
        { label: '21 a < 23', value: 2 },
        { label: '≥ 23', value: 3 },
      ]),
    ],
    interpret(s) {
      if (s >= 12) return { label: 'Estado nutricional normal', level: 'ok', detail: '12-14 puntos.' };
      if (s >= 8) return { label: 'Riesgo de malnutrición', level: 'warn', detail: '8-11 puntos.' };
      return { label: 'Malnutrición', level: 'danger', detail: '0-7 puntos.' };
    },
  });

  /* ====== 10. Beck Ansiedad ==================================== */
  SCALES.push({
    id: 'beck',
    name: 'Beck Ansiedad (BAI)',
    short: 'BAI',
    icon: 'A',
    category: 'Ánimo',
    tag: 'Ansiedad',
    description:
      'Inventario de Ansiedad de Beck. 21 síntomas valorados durante la última semana (0 = Nada, 3 = Severamente).',
    items: (() => {
      const opts = [
        { label: 'Nada (0)', value: 0 },
        { label: 'Leve (1)', value: 1 },
        { label: 'Moderado (2)', value: 2 },
        { label: 'Severo (3)', value: 3 },
      ];
      const items = [
        'Hormigueo o entumecimiento',
        'Sensación de calor',
        'Temblor de piernas',
        'Incapacidad para relajarse',
        'Miedo a que suceda lo peor',
        'Mareo o aturdimiento',
        'Palpitaciones o taquicardia',
        'Sensación de inestabilidad o inseguridad física',
        'Terror',
        'Nerviosismo',
        'Sensación de ahogo',
        'Temblor de manos',
        'Temblor generalizado o estremecimiento',
        'Miedo a perder el control',
        'Dificultad para respirar',
        'Miedo a morir',
        'Sobresalto',
        'Indigestión o malestar abdominal',
        'Palidez',
        'Rubor facial',
        'Sudores fríos o calientes',
      ];
      return items.map((t, i) => q(`bk_${i + 1}`, `${i + 1}. ${t}`, opts));
    })(),
    interpret(s) {
      if (s <= 7) return { label: 'Ansiedad mínima', level: 'ok', detail: '0-7 puntos.' };
      if (s <= 15) return { label: 'Ansiedad leve', level: 'warn', detail: '8-15 puntos.' };
      if (s <= 25) return { label: 'Ansiedad moderada', level: 'warn', detail: '16-25 puntos.' };
      return { label: 'Ansiedad severa', level: 'danger', detail: '26-63 puntos.' };
    },
  });

  /* ====== 11. GOHAI ============================================ */
  SCALES.push({
    id: 'gohai',
    name: 'GOHAI',
    short: 'GOHAI',
    icon: 'O',
    category: 'Salud oral',
    tag: 'Salud oral geriátrica',
    description:
      'Geriatric Oral Health Assessment Index. 12 ítems referentes a los últimos 3 meses. Mayor puntuación = mejor salud oral.',
    items: (() => {
      const positive = [
        { label: 'Siempre (5)', value: 5 },
        { label: 'Frecuentemente (4)', value: 4 },
        { label: 'Algunas veces (3)', value: 3 },
        { label: 'Rara vez (2)', value: 2 },
        { label: 'Nunca (1)', value: 1 },
      ];
      const negative = [
        { label: 'Siempre (1)', value: 1 },
        { label: 'Frecuentemente (2)', value: 2 },
        { label: 'Algunas veces (3)', value: 3 },
        { label: 'Rara vez (4)', value: 4 },
        { label: 'Nunca (5)', value: 5 },
      ];
      const list = [
        { t: '¿Cuántas veces limitó la clase o cantidad de alimentos por problemas con sus dientes o prótesis?', n: true },
        { t: '¿Cuántas veces tuvo problemas para morder o masticar?', n: true },
        { t: '¿Cuántas veces pudo tragar sin molestias?', n: false },
        { t: '¿Cuántas veces sus dientes o prótesis le impidieron hablar como quería?', n: true },
        { t: '¿Cuántas veces pudo comer cualquier cosa sin sentir molestia?', n: false },
        { t: '¿Cuántas veces limitó sus contactos con otras personas por problemas con sus dientes o prótesis?', n: true },
        { t: '¿Cuántas veces estuvo satisfecho con el aspecto de sus dientes/prótesis?', n: false },
        { t: '¿Cuántas veces usó medicamentos para aliviar dolor en boca/dientes?', n: true },
        { t: '¿Cuántas veces estuvo preocupado por problemas con sus dientes/encías/prótesis?', n: true },
        { t: '¿Cuántas veces se sintió nervioso por problemas con sus dientes/encías/prótesis?', n: true },
        { t: '¿Cuántas veces se sintió incómodo al comer delante de otras personas?', n: true },
        { t: '¿Cuántas veces sus dientes/encías presentaron sensibilidad al frío/calor/dulce?', n: true },
      ];
      return list.map((x, i) => q(`g_${i + 1}`, `${i + 1}. ${x.t}`, x.n ? negative : positive));
    })(),
    interpret(s) {
      if (s >= 57) return { label: 'Alta', level: 'ok', detail: 'Autopercepción alta de salud oral.' };
      if (s >= 51) return { label: 'Moderada', level: 'warn', detail: 'Autopercepción moderada.' };
      return { label: 'Baja', level: 'danger', detail: 'Autopercepción baja, requiere atención.' };
    },
  });

  /* ====== 12. Zarit abreviada ================================== */
  SCALES.push({
    id: 'zarit',
    name: 'Zarit abreviada',
    short: 'Zarit',
    icon: 'Z',
    category: 'Cuidador',
    tag: 'Sobrecarga del cuidador',
    description:
      'Escala de sobrecarga del cuidador de Zarit (versión abreviada de 7 ítems). Rango 7 a 35; ≥ 17 sugiere sobrecarga.',
    items: (() => {
      const opts = [
        { label: 'Nunca (1)', value: 1 },
        { label: 'Rara vez (2)', value: 2 },
        { label: 'Algunas veces (3)', value: 3 },
        { label: 'Bastantes veces (4)', value: 4 },
        { label: 'Casi siempre (5)', value: 5 },
      ];
      const items = [
        '¿Piensa que su familiar le pide más ayuda de la que realmente necesita?',
        '¿Piensa que debido al tiempo que dedica a su familiar no tiene suficiente tiempo para Ud.?',
        '¿Se siente agobiado por intentar compatibilizar el cuidado con otras responsabilidades?',
        '¿Piensa que su salud ha empeorado debido a tener que cuidar de su familiar?',
        '¿Piensa que no tiene tanta intimidad como le gustaría debido al cuidado de su familiar?',
        '¿Piensa que su vida social se ha resentido por cuidar a su familiar?',
        '¿Se siente incapaz de cuidar a su familiar por mucho más tiempo?',
      ];
      return items.map((t, i) => q(`z_${i + 1}`, `${i + 1}. ${t}`, opts));
    })(),
    interpret(s) {
      if (s >= 17) return { label: 'Sobrecarga del cuidador', level: 'danger', detail: '≥ 17 puntos: sobrecarga.' };
      return { label: 'Sin sobrecarga', level: 'ok', detail: '< 17 puntos.' };
    },
  });

  /* ====== 13. Athens (Insomnio) ================================ */
  SCALES.push({
    id: 'athens',
    name: 'Atenas (Insomnio)',
    short: 'Atenas',
    icon: 'S',
    category: 'Sueño',
    tag: 'Escala de Atenas para insomnio',
    description:
      'Escala de Atenas de Insomnio. Evalúa el sueño del último mes. Puntaje ≥ 6 sugiere insomnio.',
    items: (() => {
      const opts04 = (labels) => labels.map((label, value) => ({ label: `${label} (${value})`, value }));
      return [
        q('s1', 'Dificultad para quedarse dormido',
          opts04(['Nada','Leve','Moderado','Grave','Muy grave'])),
        q('s2', 'Dificultad para permanecer dormido',
          opts04(['Nada','Leve','Moderado','Grave','Muy grave'])),
        q('s3', 'Despertar mayor temprano',
          opts04(['Nada','Leve','Moderado','Grave','Muy grave'])),
        q('s4', 'Duración total del sueño',
          opts04(['Suficiente','Levemente insuficiente','Moderadamente insuficiente','Muy insuficiente','Sumamente insuficiente'])),
        q('s5', 'Calidad global del sueño',
          opts04(['Satisfactorio','Ligeramente insatisfactorio','Algo insatisfactorio','Muy insatisfactorio','Sumamente insatisfactorio'])),
        q('s6', 'Sensación de bienestar durante el día',
          opts04(['Normal','Ligeramente disminuida','Algo disminuida','Bastante disminuida','Sumamente disminuida'])),
        q('s7', 'Funcionamiento durante el día',
          opts04(['Normal','Ligeramente disminuido','Algo disminuido','Bastante disminuido','Sumamente disminuido'])),
        q('s8', 'Somnolencia durante el día',
          opts04(['Ninguna','Leve','Moderada','Grave','Muy grave'])),
      ];
    })(),
    interpret(s) {
      if (s >= 10) return { label: 'Insomnio severo', level: 'danger', detail: '≥ 10 puntos.' };
      if (s >= 6) return { label: 'Insomnio probable', level: 'warn', detail: '6-9 puntos.' };
      return { label: 'Sueño normal', level: 'ok', detail: '< 6 puntos.' };
    },
  });

  // Exponer al global
  window.VGI_SCALES = SCALES;

  // Agrupar por categoría para el sidebar
  window.VGI_GROUPS = SCALES.reduce((acc, sc) => {
    (acc[sc.category] = acc[sc.category] || []).push(sc);
    return acc;
  }, {});
})();
