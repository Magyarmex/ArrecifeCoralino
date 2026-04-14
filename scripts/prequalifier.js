const copy = {
  es: {
    pageTitle: 'Precalificador Hipotecario | Home Loan Pre-Qualifier',
    tagline: 'Evaluación preliminar para crédito hipotecario en México',
    title: 'Precalificador de crédito hipotecario',
    subtitle:
      'Completa tus datos para conocer si tu perfil podría ser sujeto de crédito con criterios bancarios comunes en México.',
    fullName: 'Nombre completo',
    age: 'Edad',
    maritalStatus: 'Estado civil',
    selectOne: 'Selecciona una opción',
    single: 'Soltero(a)',
    married: 'Casado(a)',
    cohabitation: 'Unión libre',
    divorced: 'Divorciado(a)',
    widowed: 'Viudo(a)',
    activity: 'Empleo o actividad económica',
    salaried: 'Empleado asalariado',
    selfEmployed: 'Independiente / freelance',
    businessOwner: 'Dueño de negocio',
    informal: 'Actividad informal',
    unemployed: 'Sin actividad actual',
    debt: 'Deudas mensuales vigentes (MXN)',
    creditHistory: 'Historial crediticio',
    excellent: 'Excelente / sin atrasos',
    good: 'Bueno / atrasos menores',
    limited: 'Limitado / poco historial',
    negative: 'Negativo / atrasos frecuentes',
    submit: 'Evaluar perfil',
    resultTitle: 'Resultado preliminar',
    disclaimer:
      'Este resultado es orientativo y no constituye aprobación bancaria. Una institución financiera en México validará identidad, ingresos, capacidad de pago y Buró de Crédito conforme a su política y regulación vigente.',
    likely: 'Podrías ser elegible para una evaluación formal.',
    review: 'Tu perfil requiere revisión adicional antes de considerarse elegible.',
    unlikely: 'Por ahora es poco probable que califiques; conviene fortalecer tu perfil primero.',
    why: 'Factores considerados:',
    missingData: 'Completa todos los campos para obtener un resultado.',
    reasons: {
      ageAdult: 'Edad dentro del rango típico de evaluación (18+).',
      ageSenior: 'Edad cercana a límites usuales de plazo; podrían pedir condiciones adicionales.',
      ageUnder: 'La mayoría de bancos solicita mayoría de edad para contratar.',
      activityStable: 'Actividad económica formal con mejor trazabilidad.',
      activityMedium: 'Actividad económica válida, pero puede requerir mayor comprobación de ingresos.',
      activityLow: 'Actividad con mayor riesgo percibido para originación hipotecaria.',
      debtLow: 'Nivel de deudas manejable para un análisis inicial.',
      debtMedium: 'Nivel de deudas moderado; puede ajustar capacidad de pago.',
      debtHigh: 'Nivel de deudas alto para criterios hipotecarios conservadores.',
      creditStrong: 'Historial crediticio favorable.',
      creditFair: 'Historial aceptable con observaciones.',
      creditThin: 'Historial limitado; podrían solicitar más respaldo.',
      creditWeak: 'Historial con incidencias que reduce probabilidad de aprobación.',
      maritalShared: 'Estado civil puede permitir análisis de ingresos compartidos si aplica.',
    },
  },
  en: {
    pageTitle: 'Pre-Qualifier | Home Loan in Mexico',
    tagline: 'Preliminary mortgage screening for Mexico',
    title: 'Home loan pre-qualifier',
    subtitle:
      'Complete your information to estimate whether your profile could be considered creditworthy using common Mexico banking criteria.',
    fullName: 'Full name',
    age: 'Age',
    maritalStatus: 'Marital status',
    selectOne: 'Select one option',
    single: 'Single',
    married: 'Married',
    cohabitation: 'Domestic partnership',
    divorced: 'Divorced',
    widowed: 'Widowed',
    activity: 'Employment or economic activity',
    salaried: 'Salaried employee',
    selfEmployed: 'Self-employed / freelance',
    businessOwner: 'Business owner',
    informal: 'Informal activity',
    unemployed: 'Not currently employed',
    debt: 'Current monthly debt obligations (MXN)',
    creditHistory: 'Credit history',
    excellent: 'Excellent / no late payments',
    good: 'Good / minor delays',
    limited: 'Limited / thin credit file',
    negative: 'Negative / recurrent late payments',
    submit: 'Evaluate profile',
    resultTitle: 'Preliminary result',
    disclaimer:
      'This is an orientation only and not a bank approval. A Mexican financial institution will validate identity, income, repayment capacity, and credit bureau data under its internal policy and regulation.',
    likely: 'You may be eligible for a formal mortgage review.',
    review: 'Your profile needs additional review before being considered eligible.',
    unlikely: 'At this time, qualifying is less likely; improve your profile first.',
    why: 'Key factors considered:',
    missingData: 'Complete all fields to receive a result.',
    reasons: {
      ageAdult: 'Age is within a typical evaluation range (18+).',
      ageSenior: 'Age is near common term limits; extra conditions may apply.',
      ageUnder: 'Most banks require legal adulthood to contract credit.',
      activityStable: 'Formal economic activity with better income traceability.',
      activityMedium: 'Valid economic activity, but additional proof may be needed.',
      activityLow: 'Activity with higher perceived risk for mortgage origination.',
      debtLow: 'Debt level appears manageable for an initial screen.',
      debtMedium: 'Debt level is moderate and may reduce repayment capacity.',
      debtHigh: 'Debt level is high for conservative mortgage criteria.',
      creditStrong: 'Credit history is favorable.',
      creditFair: 'Credit history is acceptable with observations.',
      creditThin: 'Limited credit history; additional support may be requested.',
      creditWeak: 'Credit incidents reduce approval probability.',
      maritalShared: 'Marital status could support combined income assessment when applicable.',
    },
  },
};

const form = document.getElementById('prequal-form');
const result = document.getElementById('result');
const resultMessage = document.getElementById('resultMessage');
const resultReasons = document.getElementById('resultReasons');
const langButtons = Array.from(document.querySelectorAll('.lang-btn'));

let lang = 'es';

function t(key) {
  return copy[lang][key] || key;
}

function applyTranslations() {
  document.documentElement.lang = lang;
  document.title = t('pageTitle');
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.dataset.i18n;
    if (key && copy[lang][key]) {
      node.textContent = copy[lang][key];
    }
  });
}

function evaluateProfile({ age, maritalStatus, activity, debt, creditHistory }) {
  const reasons = [];
  let score = 0;

  if (age < 18) {
    score -= 50;
    reasons.push(t('reasons').ageUnder);
  } else if (age >= 60) {
    score += 5;
    reasons.push(t('reasons').ageSenior);
  } else {
    score += 20;
    reasons.push(t('reasons').ageAdult);
  }

  const activityScores = {
    salaried: [20, t('reasons').activityStable],
    businessOwner: [15, t('reasons').activityStable],
    selfEmployed: [10, t('reasons').activityMedium],
    informal: [-10, t('reasons').activityLow],
    unemployed: [-30, t('reasons').activityLow],
  };

  const debtAmount = Number(debt);
  if (debtAmount <= 8000) {
    score += 20;
    reasons.push(t('reasons').debtLow);
  } else if (debtAmount <= 25000) {
    score += 5;
    reasons.push(t('reasons').debtMedium);
  } else {
    score -= 20;
    reasons.push(t('reasons').debtHigh);
  }

  const creditScores = {
    excellent: [25, t('reasons').creditStrong],
    good: [15, t('reasons').creditFair],
    limited: [5, t('reasons').creditThin],
    negative: [-35, t('reasons').creditWeak],
  };

  if (activityScores[activity]) {
    score += activityScores[activity][0];
    reasons.push(activityScores[activity][1]);
  }

  if (creditScores[creditHistory]) {
    score += creditScores[creditHistory][0];
    reasons.push(creditScores[creditHistory][1]);
  }

  if (maritalStatus === 'married' || maritalStatus === 'cohabitation') {
    score += 5;
    reasons.push(t('reasons').maritalShared);
  }

  if (score >= 55) {
    return { verdict: t('likely'), reasons };
  }

  if (score >= 30) {
    return { verdict: t('review'), reasons };
  }

  return { verdict: t('unlikely'), reasons };
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = {
    fullName: String(formData.get('fullName') || '').trim(),
    age: Number(formData.get('age')),
    maritalStatus: String(formData.get('maritalStatus') || ''),
    activity: String(formData.get('activity') || ''),
    debt: Number(formData.get('debt')),
    creditHistory: String(formData.get('creditHistory') || ''),
  };

  const complete =
    payload.fullName &&
    Number.isFinite(payload.age) &&
    payload.maritalStatus &&
    payload.activity &&
    Number.isFinite(payload.debt) &&
    payload.creditHistory;

  if (!complete) {
    result.hidden = false;
    resultMessage.innerHTML = `<strong>${t('missingData')}</strong>`;
    resultReasons.innerHTML = '';
    return;
  }

  const outcome = evaluateProfile(payload);
  result.hidden = false;
  resultMessage.innerHTML = `<strong>${payload.fullName}</strong>: ${outcome.verdict}`;
  resultReasons.innerHTML = '';

  outcome.reasons.forEach((reason) => {
    const li = document.createElement('li');
    li.textContent = reason;
    resultReasons.appendChild(li);
  });
});

langButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const nextLang = button.dataset.lang;
    if (!nextLang || nextLang === lang || !copy[nextLang]) {
      return;
    }

    lang = nextLang;
    langButtons.forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.lang === lang);
    });
    applyTranslations();
  });
});

applyTranslations();
