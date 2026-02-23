'use client';

import { useSession } from 'next-auth/react';

const Greetings = () => {
  const { data: session } = useSession();
  console.log('session', session);
  const name = session?.user?.firstName;
  const organization = session?.user?.organizationName;
  return (
    <div className="mb-2 text-[32px] font-semibold text-[#000000] sm:text-[36px] md:text-[40px]">
      Welcome, <span className="text-[#000093]">{name}</span> from <span>{organization}</span>!
    </div>
  );
};
export default Greetings;
