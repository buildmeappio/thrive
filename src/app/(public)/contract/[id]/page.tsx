import { notFound } from "next/navigation";
import { getLatestContract } from "@/domains/contract/server/actions/getLatestContract.actions";
import ContractSigningView from "@/domains/contract/components/ContractSigningView";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

export interface ContractType {
  province: string;
  examinerName: string;
  examinerEmail: string;
  effectiveDate: string;
  feeStructure: {
    IMEFee: number;
    recordReviewFee: number;
    hourlyRate: number;
    cancellationFee: number;
    paymentTerms: string;
  };
}

const ContractSigningPage = async ({ params, searchParams }: PageProps) => {
  const { id } = await params;
  const { token } = await searchParams;

  if (!token) {
    notFound();
  }

  // if (token) {
  //   try {
  //     await authActions.verifyAccountToken({ token });
  //   } catch (error) {
  //     console.error("Error verifying token:", error);
  //     notFound();
  //   }
  // }

  // Fetch contract by ID
  const contract = await getLatestContract(id);

  if (!contract || !contract.data) {
    notFound();
  }

  if (!contract.contractHtml) {
    throw new Error("Failed to load contract HTML content");
  }

  const contractData = contract.data as unknown as ContractType;

  // Check if application exists (contracts are now signed at application level)
  if (!contract.application) {
    notFound();
  }

  // Check if contract is already signed by examining the timestamp on application
  const isAlreadySigned =
    contract.application.contractSignedByExaminerAt !== null;

  // Use applicationId for contract signing (contracts are signed at application level)
  // signContractByExaminer will handle both applicationId and examinerProfileId
  const signingId = contract.applicationId || contract.examinerProfileId;

  if (!signingId) {
    notFound();
  }

  return (
    <ContractSigningView
      token={token}
      contractId={id}
      examinerProfileId={signingId} // Can be applicationId or examinerProfileId
      examinerEmail={contract.application.email}
      examinerName={contractData.examinerName}
      feeStructure={contractData.feeStructure}
      contractHtml={contract.contractHtml}
      isAlreadySigned={isAlreadySigned}
    />
  );
};

export default ContractSigningPage;
