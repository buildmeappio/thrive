import { notFound } from "next/navigation";
import { getLatestContract } from "@/domains/contract/server/actions/getLatestContract.actions";
import ContractSigningView from "@/domains/contract/components/ContractSigningView";
import authActions from "@/domains/auth/actions";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

const ContractSigningPage = async ({ params, searchParams }: PageProps) => {
  const { id } = await params;
  const { token } = await searchParams;

  if (!token) {
    notFound();
  }

  if (token) {
    try {
      await authActions.verifyAccountToken({ token });
    } catch (error) {
      console.error("Error verifying token:", error);
      notFound();
    }
  }

  // Fetch contract by ID
  const contract = await getLatestContract(id);

  if (!contract || !contract.data) {
    notFound();
  }

  // Check if we have a pre-signed URL
  if (!contract.presignedPdfUrl) {
    throw new Error("Failed to generate PDF URL");
  }

  return (
    <ContractSigningView
      token={token}
      contractId={id}
      examinerName={contract.data.examinerName}
      feeStructure={contract.data.feeStructure}
    />
  );
};

export default ContractSigningPage;
