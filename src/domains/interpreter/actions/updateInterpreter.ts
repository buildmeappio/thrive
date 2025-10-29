"use server";
import interpreterService from "../server/interpreter.service";
import { InterpreterDto } from "../server/dto/interpreter.dto";

type UpdateInterpreterInput = {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  languageIds?: string[];
};

const updateInterpreter = async (id: string, data: UpdateInterpreterInput) => {
  const interpreter = await interpreterService.updateInterpreter(id, data);
  return InterpreterDto.toInterpreterData(interpreter);
};

export default updateInterpreter;

