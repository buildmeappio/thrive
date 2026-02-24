import { Metadata } from 'next';
import { Mail, MessageCircle, BookOpen, HelpCircle, Phone, Clock } from 'lucide-react';
import OrganizationGuard from '@/components/OrganizationGuard';

export const metadata: Metadata = {
  title: 'Support | Thrive',
  description: 'Access your support to manage your support tickets',
};

export const dynamic = 'force-dynamic';

const SupportPage = () => {
  return (
    <OrganizationGuard>
      <div className="mb-4 sm:mb-6">
        <h1 className="font-poppins text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
          Support
        </h1>
        <p className="mt-2 text-sm text-[#4D4D4D] sm:text-base">
          Get help and find answers to your questions
        </p>
      </div>

      <div className="mb-20 flex flex-col gap-6 sm:gap-8">
        {/* Support Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Contact Support Card */}
          <div className="rounded-[29px] border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E0E0FF]">
                <MessageCircle className="h-6 w-6 text-[#000093]" />
              </div>
              <h3 className="font-poppins text-lg font-semibold text-black sm:text-xl">
                Contact Support
              </h3>
            </div>
            <p className="font-poppins mb-4 text-sm text-[#4D4D4D] sm:text-base">
              Reach out to our support team for assistance with any questions or issues.
            </p>
            <a
              href="mailto:support@thrivenetwork.ca"
              className="font-poppins inline-flex items-center gap-2 text-sm font-medium text-[#000093] transition-colors hover:text-[#0000BA] sm:text-base"
            >
              <Mail className="h-4 w-4" />
              support@thrivenetwork.ca
            </a>
          </div>

          {/* Help Center Card */}
          <div className="rounded-[29px] border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E0E0FF]">
                <BookOpen className="h-6 w-6 text-[#000093]" />
              </div>
              <h3 className="font-poppins text-lg font-semibold text-black sm:text-xl">
                Help Center
              </h3>
            </div>
            <p className="font-poppins mb-4 text-sm text-[#4D4D4D] sm:text-base">
              Browse our knowledge base for guides, tutorials, and frequently asked questions.
            </p>
            <button className="font-poppins inline-flex items-center gap-2 text-sm font-medium text-[#000093] transition-colors hover:text-[#0000BA] sm:text-base">
              <HelpCircle className="h-4 w-4" />
              View Documentation
            </button>
          </div>

          {/* Support Hours Card */}
          <div className="rounded-[29px] border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E0E0FF]">
                <Clock className="h-6 w-6 text-[#000093]" />
              </div>
              <h3 className="font-poppins text-lg font-semibold text-black sm:text-xl">
                Support Hours
              </h3>
            </div>
            <p className="font-poppins mb-4 text-sm text-[#4D4D4D] sm:text-base">
              Our support team is available to help you during business hours.
            </p>
            <div className="font-poppins text-sm font-medium text-black sm:text-base">
              Monday - Friday
              <br />
              9:00 AM - 5:00 PM EST
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="rounded-[29px] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-poppins mb-6 text-xl font-semibold text-black sm:text-2xl">
            Quick Links
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <a
              href="#"
              className="group flex items-center gap-3 rounded-2xl border border-gray-200 p-4 transition-all hover:border-[#000093] hover:bg-[#FAFAFF]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E0E0FF] transition-all group-hover:bg-[#000093]">
                <HelpCircle className="h-5 w-5 text-[#000093] transition-colors group-hover:text-white" />
              </div>
              <div>
                <h4 className="font-poppins font-semibold text-black transition-colors group-hover:text-[#000093]">
                  FAQ
                </h4>
                <p className="font-poppins text-sm text-[#4D4D4D]">Frequently asked questions</p>
              </div>
            </a>

            <a
              href="#"
              className="group flex items-center gap-3 rounded-2xl border border-gray-200 p-4 transition-all hover:border-[#000093] hover:bg-[#FAFAFF]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E0E0FF] transition-all group-hover:bg-[#000093]">
                <BookOpen className="h-5 w-5 text-[#000093] transition-colors group-hover:text-white" />
              </div>
              <div>
                <h4 className="font-poppins font-semibold text-black transition-colors group-hover:text-[#000093]">
                  User Guide
                </h4>
                <p className="font-poppins text-sm text-[#4D4D4D]">Learn how to use the platform</p>
              </div>
            </a>

            <a
              href="#"
              className="group flex items-center gap-3 rounded-2xl border border-gray-200 p-4 transition-all hover:border-[#000093] hover:bg-[#FAFAFF]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E0E0FF] transition-all group-hover:bg-[#000093]">
                <Phone className="h-5 w-5 text-[#000093] transition-colors group-hover:text-white" />
              </div>
              <div>
                <h4 className="font-poppins font-semibold text-black transition-colors group-hover:text-[#000093]">
                  Phone Support
                </h4>
                <p className="font-poppins text-sm text-[#4D4D4D]">
                  Call us for immediate assistance
                </p>
              </div>
            </a>

            <a
              href="#"
              className="group flex items-center gap-3 rounded-2xl border border-gray-200 p-4 transition-all hover:border-[#000093] hover:bg-[#FAFAFF]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E0E0FF] transition-all group-hover:bg-[#000093]">
                <MessageCircle className="h-5 w-5 text-[#000093] transition-colors group-hover:text-white" />
              </div>
              <div>
                <h4 className="font-poppins font-semibold text-black transition-colors group-hover:text-[#000093]">
                  Live Chat
                </h4>
                <p className="font-poppins text-sm text-[#4D4D4D]">Chat with our support team</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </OrganizationGuard>
  );
};

export default SupportPage;
