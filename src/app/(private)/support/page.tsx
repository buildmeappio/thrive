import { Metadata } from "next";
import {
  Mail,
  MessageCircle,
  BookOpen,
  HelpCircle,
  Phone,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Support | Thrive - Examiner",
  description: "Access your support to manage your support tickets",
};

export const dynamic = "force-dynamic";

const SupportPage = () => {
  return (
    <>
      <div className="mb-4 sm:mb-6 dashboard-zoom-mobile">
        <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
          Support
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Get help and find answers to your questions
        </p>
      </div>

      <div className="flex flex-col gap-6 sm:gap-8 mb-20 dashboard-zoom-mobile">
        {/* Support Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Contact Support Card */}
          <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-6 sm:p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                Contact Support
              </h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Reach out to our support team for assistance with any questions or
              issues.
            </p>
            <a
              href="mailto:support@thrivenetwork.ca"
              className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-[#00A8FF] hover:text-[#01F4C8] transition-colors"
            >
              <Mail className="w-4 h-4" />
              support@thrivenetwork.ca
            </a>
          </div>

          {/* Help Center Card */}
          <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-6 sm:p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                Help Center
              </h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Browse our knowledge base for guides, tutorials, and frequently
              asked questions.
            </p>
            <button className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-[#00A8FF] hover:text-[#01F4C8] transition-colors">
              <HelpCircle className="w-4 h-4" />
              View Documentation
            </button>
          </div>

          {/* Support Hours Card */}
          <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-6 sm:p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                Support Hours
              </h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Our support team is available to help you during business hours.
            </p>
            <div className="text-sm sm:text-base font-medium text-gray-900">
              Monday - Friday
              <br />
              9:00 AM - 5:00 PM EST
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
            Quick Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="#"
              className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 hover:border-[#00A8FF] hover:bg-[#00A8FF]/5 transition-all group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-[#00A8FF] group-hover:to-[#01F4C8] transition-all">
                <HelpCircle className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-[#00A8FF] transition-colors">
                  FAQ
                </h4>
                <p className="text-sm text-gray-600">
                  Frequently asked questions
                </p>
              </div>
            </a>

            <a
              href="#"
              className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 hover:border-[#00A8FF] hover:bg-[#00A8FF]/5 transition-all group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-[#00A8FF] group-hover:to-[#01F4C8] transition-all">
                <BookOpen className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-[#00A8FF] transition-colors">
                  User Guide
                </h4>
                <p className="text-sm text-gray-600">
                  Learn how to use the platform
                </p>
              </div>
            </a>

            <a
              href="#"
              className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 hover:border-[#00A8FF] hover:bg-[#00A8FF]/5 transition-all group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-[#00A8FF] group-hover:to-[#01F4C8] transition-all">
                <Phone className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-[#00A8FF] transition-colors">
                  Phone Support
                </h4>
                <p className="text-sm text-gray-600">
                  Call us for immediate assistance
                </p>
              </div>
            </a>

            <a
              href="#"
              className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 hover:border-[#00A8FF] hover:bg-[#00A8FF]/5 transition-all group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-[#00A8FF] group-hover:to-[#01F4C8] transition-all">
                <MessageCircle className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-[#00A8FF] transition-colors">
                  Live Chat
                </h4>
                <p className="text-sm text-gray-600">
                  Chat with our support team
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupportPage;
