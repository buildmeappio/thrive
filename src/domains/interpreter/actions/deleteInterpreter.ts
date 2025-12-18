"use server";
import interpreterService from "../server/interpreter.service";

const deleteInterpreter = async (id: string) => {
  await interpreterService.deleteInterpreter(id);
  return { success: true };
};

export default deleteInterpreter;
