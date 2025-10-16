import { HttpError } from './httpError';

type ResponseData = object | void | undefined | unknown | boolean | string | number | null;

export type ActionResponse<TData extends ResponseData> =
  | { success: true; data: TData }
  | { success: false; error: string };

export const handleAction = async <TData extends ResponseData>(
  action: () => Promise<TData>,
  errorMessage: string = 'Failed to process request'
): Promise<ActionResponse<TData>> => {
  try {
    const result = await action();
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof HttpError) {
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
};
