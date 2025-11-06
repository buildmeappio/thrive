import InterpreterDetail from "@/domains/interpreter/components/InterpreterDetail";
import { getInterpreterById } from "@/domains/interpreter/actions";
import { getInterpreterAvailabilityAction } from "@/domains/interpreter/actions";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: Props) => {
  try {
    const { id } = await params;
    const interpreter = await getInterpreterById(id);

    // Fetch availability on the server
    const availabilityResult = await getInterpreterAvailabilityAction({
      interpreterId: id,
    });

    const availability =
      availabilityResult.success && availabilityResult.data
        ? availabilityResult.data
        : null;

    return (
      <InterpreterDetail
        interpreter={interpreter}
        initialAvailability={availability}
      />
    );
  } catch {
    return notFound();
  }
};

export default Page;
