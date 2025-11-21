import { getAccountSettingsInfo } from '@/domains/auth/actions';
import ChangePassword from '@/domains/auth/components/ChangePassword/ChangePassword';
import UpdateOrganizationInfo from '@/domains/auth/components/updateOrganization/updateOrganization';
import { getOrganizationTypes } from '@/domains/organization/actions';
import { convertToTypeOptions } from '@/utils/convertToTypeOptions';

const Page = async () => {
  const [organizationTypes, accountInfo] = await Promise.all([
    getOrganizationTypes(),
    getAccountSettingsInfo(),
  ]);

  if (!accountInfo || !accountInfo.success || !accountInfo.data) {
    throw new Error('Failed to load account information');
  }
  return (
    <div>
      <h1 className="mb-6 text-[24px] font-semibold sm:text-[28px] md:text-[32px] lg:text-[36px] xl:text-[40px]">
        Account Settings
      </h1>
      <div>
        <div className="rounded-3xl bg-white px-8 py-4">
          <h1 className="mb-6 text-[20px] font-semibold sm:text-[24px] md:text-[28px] lg:text-[32px] xl:text-[28px]">
            Update Organization Information
          </h1>

          <UpdateOrganizationInfo
            organizationTypes={convertToTypeOptions(organizationTypes)}
            accountInfo={accountInfo.data}
          />
        </div>
      </div>
      <div>
        <div className="mt-8 rounded-3xl bg-white px-8 py-4">
          <h1 className="mb-6 text-[20px] font-semibold sm:text-[24px] md:text-[28px] lg:text-[32px] xl:text-[28px]">
            Change Password
          </h1>
          <ChangePassword />
        </div>
      </div>
    </div>
  );
};

export default Page;
