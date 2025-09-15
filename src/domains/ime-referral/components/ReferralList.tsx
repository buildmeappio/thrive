'use client';
import { formatDate } from '@/utils/dateTime';
import { ChevronRight, FileText, Calendar, User } from 'lucide-react';
import useRouter from '@/hooks/useRouter';
import { URLS } from '@/constants/routes';

type ReferralListProps = {
  referrals: Array<{
    referralId: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
    cases: Array<{
      caseId: string;
    }>;
  }>;
};

const ReferralList: React.FC<ReferralListProps> = ({ referrals }) => {
  const router = useRouter();

  const getCasesBadgeColor = (count: number) => {
    if (count >= 5)
      return 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30';
    if (count >= 3)
      return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30';
    if (count >= 1)
      return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30';
    return 'bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg shadow-gray-500/30';
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-4">
        <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-2xl font-semibold text-transparent">
          IME Referrals
        </h1>

        {/* Referrals List */}
        <div className="overflow-hidden rounded-2xl border border-white/50 bg-white shadow-md">
          {/* Table Header */}
          <div className="border-b border-gray-200 bg-[#000093]">
            <div className="grid grid-cols-12 gap-6 px-8 py-6">
              <div className="col-span-4 flex items-center gap-2">
                <User className="h-5 w-5 text-[#FFFFFF]" />
                <span className="font-bold text-[#FFFFFF]">Claimant Name</span>
              </div>
              <div className="col-span-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#FFFFFF]" />
                <span className="font-bold text-[#FFFFFF]">Number of Cases</span>
              </div>
              <div className="col-span-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#FFFFFF]" />
                <span className="font-bold text-[#FFFFFF]">Submitted On</span>
              </div>
              <div className="col-span-2 flex justify-center">
                <span className="font-bold text-[#FFFFFF]">Action</span>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {referrals.length === 0 ? (
              <div className="p-16 text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-gray-100 to-gray-200">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">No Referrals Found</h3>
                <p className="text-gray-500">There are currently no referrals to display.</p>
              </div>
            ) : (
              referrals.map((referral, index) => (
                <div
                  key={referral.referralId}
                  className={`group grid cursor-pointer grid-cols-12 gap-6 px-8 py-6 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                  onClick={() => {
                    router.push(URLS.REFERRAL_BY_ID, { params: { id: referral.referralId } });
                  }}
                >
                  {/* Claimant Name */}
                  <div className="col-span-4 flex items-center gap-4">
                    <div>
                      <p className="font-bold text-gray-900">
                        {referral.firstName} {referral.lastName}
                      </p>
                      <p className="text-sm text-gray-500">ID: {referral.referralId.slice(-8)}</p>
                    </div>
                  </div>

                  {/* Number of Cases */}
                  <div className="col-span-3 flex items-center">
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-xl px-4 py-2 text-sm font-bold ${getCasesBadgeColor(referral.cases.length)}`}
                      >
                        {referral.cases.length} Case{referral.cases.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Submitted On */}
                  <div className="col-span-3 flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-green-100 to-emerald-100">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {formatDate(referral.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {Math.floor(
                            (Date.now() - new Date(referral.createdAt).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{' '}
                          days ago
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="col-span-2 flex items-center justify-center">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        router.push(URLS.REFERRAL_BY_ID, { params: { id: referral.referralId } });
                      }}
                      className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#000093] shadow-lg shadow-cyan-500/30 transition-all duration-300 group-hover:from-blue-500 group-hover:to-indigo-600 hover:scale-110 hover:shadow-xl hover:shadow-cyan-500/40"
                    >
                      <ChevronRight className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {referrals.length > 0 && (
            <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50 px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {referrals.length} referral{referrals.length !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600"></div>
                    <span>1-2 Cases</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"></div>
                    <span>3-4 Cases</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gradient-to-r from-red-500 to-rose-600"></div>
                    <span>5+ Cases</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralList;
