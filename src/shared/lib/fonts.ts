import localFont from 'next/font/local';

// Degular font for headings
export const degular = localFont({
  src: [
    {
      path: '../../../public/fonts/degular/DegularText-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/degular/DegularText-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/degular/DegularText-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-degular',
  display: 'swap',
});

// Poppins font for body text
export const poppins = localFont({
  src: [
    {
      path: '../../../public/fonts/poppins/Poppins-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/poppins/Poppins-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/poppins/Poppins-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-poppins',
  display: 'swap',
});
