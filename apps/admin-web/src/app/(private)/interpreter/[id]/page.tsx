import InterpreterDetail from '@/domains/interpreter/components/InterpreterDetail';
import {
  getInterpreterById,
  getInterpreterAvailabilityAction,
  getLanguages,
  updateInterpreter,
  deleteInterpreter,
  saveInterpreterAvailabilityAction,
} from '@/domains/interpreter/actions';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: Props) => {
  try {
    const { id } = await params;
    const [interpreter, availabilityResult, languages] = await Promise.all([
      getInterpreterById(id),
      getInterpreterAvailabilityAction({ interpreterId: id }),
      getLanguages(),
    ]);

    const availability =
      availabilityResult.success && availabilityResult.data ? availabilityResult.data : null;

    return (
      <InterpreterDetail
        interpreter={interpreter}
        initialAvailability={availability}
        languages={languages}
        onUpdate={updateInterpreter}
        onDelete={deleteInterpreter}
        onSaveAvailability={saveInterpreterAvailabilityAction}
      />
    );
  } catch {
    return notFound();
  }
};

export default Page;
