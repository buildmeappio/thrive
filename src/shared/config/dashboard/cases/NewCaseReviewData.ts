import { NewCaseField } from "@/shared/types";

export const newCaseInformation: NewCaseField[] = [
        { label: 'Fee', value: '$1,500' },
        { label: 'Request Date/Time', value: 'April 14, 2025 - 5:00 PM' },
        { label: 'Due Date', value: 'May 14, 2025' },
        { label: 'Insurance Coverage', value: 'Motor Vehicle Accident' },
        { label: 'Medical Specialty', value: 'General Medicine' },
    ];

export const newCaseclaimantInformation: NewCaseField[] = [
        { label: 'Full Name', value: 'John Doe' },
        { label: 'Date of Birth', value: '21/02/2000' },
        { label: 'Gender', value: 'Male' },
        { label: 'Claimant Email Address', value: 'johndoe20@gmail.com' },
        { label: 'Claim Number', value: '421313' },
    ];

export const newCaseinsurerInformation: NewCaseField[] = [
        { label: 'Full Name', value: 'Lois Bucket' },
        { label: 'Phone Number', value: '(647) 555-1923' },
        { label: 'Email Address', value: 'lois@desjardins.com' },
        { label: 'Company Name', value: 'Desjardins' },
    ];
