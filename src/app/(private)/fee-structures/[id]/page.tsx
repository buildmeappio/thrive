import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FeeStructureDetailRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/dashboard/fee-structures/${id}`);
}
