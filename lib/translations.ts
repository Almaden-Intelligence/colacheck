export type Lang = 'en' | 'es'

export const t = {
  en: {
    // Header
    tagline: 'Almaden Trade',
    beta: 'BETA',

    // Landing
    eyebrow: 'TTB Label Compliance',
    headline: 'Check your label before TTB does.',
    subheadline: 'Upload your beverage alcohol label and get an instant compliance report against federal regulations — with specific citations and actionable fixes.',

    // Category
    selectCategory: '1. Select Category',
    wine: 'Wine',
    spirits: 'Distilled Spirits',
    beer: 'Malt Beverage',
    soon: 'Soon',

    // Upload
    uploadImages: '2. Upload Label Images',
    frontLabel: 'Front Label',
    backLabel: 'Back Label',
    required: 'Required',
    requiredIfHasOne: 'Required if your product has one',
    dropHere: 'Drop image here',
    browseFiles: 'or click to browse',
    fileTypes: 'JPEG · PNG · WebP',
    minSize: 'Min 150 KB · Max 10 MB',
    bothLabels: 'Upload both labels if your product has them — analyzed together',
    remove: 'Remove',

    // Submit
    disclaimer: 'COLACheck provides informational guidance based on published TTB regulations. This tool does not constitute legal advice.',
    runCheck: 'Run Compliance Check →',
    analyzing: 'Analyzing — 15–30 seconds…',

    // Errors
    invalidType: 'Please upload a JPEG, PNG, or WebP image.',
    tooSmall: 'Image must be at least 150 KB. Your file is',
    kb: 'KB.',
    tooBig: 'Image must be under 10 MB.',
    failedRead: 'Failed to read file.',
    checkFailed: 'Check failed.',
    somethingWrong: 'Something went wrong.',

    // Report header
    backToHome: '← COLACheck',
    print: 'Print',
    downloadPDF: 'Download PDF',

    // Report status
    overallPass: 'Compliance Check Passed',
    overallPassSub: 'All mandatory requirements appear to be met.',
    overallReview: 'Review Required',
    overallReviewSub: 'Some items could not be verified from the image alone.',
    overallFail: 'Compliance Issues Found',
    overallFailSub: 'One or more mandatory requirements appear to be missing or incorrect.',
    checksPassed: 'checks passed',

    // Report body
    complianceChecks: 'Compliance Checks',
    labelsAnalyzed: 'Labels Analyzed',
    front: 'Front',
    back: 'Back',
    imageNote: 'Image Note',
    finding: 'Finding',
    requirement: 'Requirement',
    suggestedFix: 'Suggested Fix',
    downloadPDFReport: 'Download PDF Report',
    checkAnother: '← Check Another Label',
    needHelp: 'Need help filing?',
    needHelpBody: 'Coming soon — Almaden Trade will handle your full COLA submission to TTB, from label review to approval.',
    contactUs: 'Contact Almaden Trade →',
    comingSoon: 'Coming soon',
    learnMore: 'Learn more at almadentrade.com →',
  },

  es: {
    // Header
    tagline: 'Almaden Trade',
    beta: 'BETA',

    // Landing
    eyebrow: 'Cumplimiento de Etiquetas TTB',
    headline: 'Verifique su etiqueta antes de que lo haga el TTB.',
    subheadline: 'Cargue su etiqueta de bebida alcohólica y obtenga un informe de cumplimiento instantáneo con las regulaciones federales — con citas específicas y correcciones accionables.',

    // Category
    selectCategory: '1. Seleccionar Categoría',
    wine: 'Vinos',
    spirits: 'Licores',
    beer: 'Cervezas',
    soon: 'Pronto',

    // Upload
    uploadImages: '2. Cargar Imágenes de Etiqueta',
    frontLabel: 'Etiqueta Frontal',
    backLabel: 'Etiqueta Trasera',
    required: 'Requerida',
    requiredIfHasOne: 'Requerida si su producto la tiene',
    dropHere: 'Arrastre la imagen aquí',
    browseFiles: 'o haga clic para buscar',
    fileTypes: 'JPEG · PNG · WebP',
    minSize: 'Mín. 150 KB · Máx. 10 MB',
    bothLabels: 'Cargue ambas etiquetas si su producto las tiene — se analizan juntas',
    remove: 'Eliminar',

    // Submit
    disclaimer: 'COLACheck proporciona orientación informativa basada en las regulaciones TTB publicadas. Esta herramienta no constituye asesoría legal.',
    runCheck: 'Ejecutar Verificación de Cumplimiento →',
    analyzing: 'Analizando — 15–30 segundos…',

    // Errors
    invalidType: 'Por favor cargue una imagen JPEG, PNG o WebP.',
    tooSmall: 'La imagen debe tener al menos 150 KB. Su archivo tiene',
    kb: 'KB.',
    tooBig: 'La imagen debe ser menor a 10 MB.',
    failedRead: 'Error al leer el archivo.',
    checkFailed: 'La verificación falló.',
    somethingWrong: 'Algo salió mal.',

    // Report header
    backToHome: '← COLACheck',
    print: 'Imprimir',
    downloadPDF: 'Descargar PDF',

    // Report status
    overallPass: 'Verificación de Cumplimiento Aprobada',
    overallPassSub: 'Todos los requisitos obligatorios parecen estar cumplidos.',
    overallReview: 'Se Requiere Revisión',
    overallReviewSub: 'Algunos elementos no pudieron verificarse solo con la imagen.',
    overallFail: 'Se Encontraron Problemas de Cumplimiento',
    overallFailSub: 'Uno o más requisitos obligatorios parecen estar ausentes o incorrectos.',
    checksPassed: 'verificaciones aprobadas',

    // Report body
    complianceChecks: 'Verificaciones de Cumplimiento',
    labelsAnalyzed: 'Etiquetas Analizadas',
    front: 'Frontal',
    back: 'Trasera',
    imageNote: 'Nota sobre la Imagen',
    finding: 'Hallazgo',
    requirement: 'Requisito',
    suggestedFix: 'Corrección Sugerida',
    downloadPDFReport: 'Descargar Informe PDF',
    checkAnother: '← Verificar Otra Etiqueta',
    needHelp: '¿Necesita ayuda para presentar?',
    needHelpBody: 'Próximamente — Almaden Trade gestionará su envío COLA completo al TTB, desde la revisión de la etiqueta hasta la aprobación.',
    contactUs: 'Contactar Almaden Trade →',
    comingSoon: 'Próximamente',
    learnMore: 'Más información en almadentrade.com →',
  },
}
