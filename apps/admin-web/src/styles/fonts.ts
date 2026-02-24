import localFont from 'next/font/local';

export const degular = localFont({
  src: [
    {
      path: '../../public/fonts/degular/fonnts.com-DegularDemo-Thin.otf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../public/fonts/degular/fonnts.com-DegularDemo-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/degular/fonnts.com-DegularDemo-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/degular/fonnts.com-DegularDemo-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/degular/fonnts.com-DegularDemo-Semibold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/degular/fonnts.com-DegularDemo-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/degular/fonnts.com-DegularDemo-Black.otf',
      weight: '900',
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
      path: '../assets/fonts/poppins/Poppins-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/poppins/Poppins-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../assets/fonts/poppins/Poppins-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-poppins',
  display: 'swap',
});
