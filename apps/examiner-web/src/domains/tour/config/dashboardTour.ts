import { Step } from 'react-joyride';

export const dashboardTourSteps: Step[] = [
  {
    target: '[data-tour="new-case-offers"]',
    content:
      'This table shows appointment offers that are pending your review. You can accept or decline these offers here.',
    placement: 'bottom',
    disableBeacon: true,
    disableScrolling: false,
    disableOverlay: false,
  },
  {
    target: '[data-tour="upcoming-appointments"]',
    content:
      'View all your upcoming appointments here. This table displays case numbers, claimants, appointment dates, and due dates.',
    placement: 'bottom',
    disableScrolling: false,
  },
  {
    target: '[data-tour="reports-table"]',
    content:
      'This table shows reports that are waiting to be submitted. Keep track of pending submissions and their due dates here.',
    placement: 'bottom',
    disableScrolling: false,
    disableOverlay: false,
    spotlightClicks: false,
    spotlightPadding: 5,
  },
  {
    target: '[data-tour="recent-updates"]',
    content:
      'Stay updated with recent activity and notifications. This panel shows the latest updates about your appointments and cases.',
    placement: 'left',
    disableScrolling: false,
  },
  {
    target: '[data-tour="summary-panel"]',
    content:
      'View your earnings, invoiced amounts, and total IMEs. You can filter this summary by different time periods using the dropdown.',
    placement: 'left',
    disableScrolling: false,
  },
  {
    target: '[data-tour="settings-button"]',
    content:
      'Access your account settings from the sidebar. Here you can manage your profile, preferences, and account information.',
    placement: 'right',
    disableScrolling: false,
    disableOverlay: false,
    spotlightPadding: 5,
  },
];
