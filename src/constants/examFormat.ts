export const ExamFormat = Object.freeze({
  IN_PERSON: 'In-Person',
    VIRTUAL: 'Virtual',
    TELEPHONE: 'Telephone',
    PAPER_REVIEW: 'Paper Review',
    HYBRID: 'Hybrid',
    ON_SITE: 'On-Site'
} as const);

export type ExamFormatType = (typeof ExamFormat)[keyof typeof ExamFormat];
