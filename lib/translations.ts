export type Lang = 'en'

export const t = {
  en: {
    // Header
    beta: 'BETA',

    // Landing
    eyebrow: 'TTB Label Compliance',
    headline: 'Check your label before you submit to TTB.',
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
  },
}
