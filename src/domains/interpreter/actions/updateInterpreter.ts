"use server";
import interpreterService from "../server/interpreter.service";
import { InterpreterDto } from "../server/dto/interpreter.dto";
import { AvailabilityBlock } from "@prisma/client";

type UpdateInterpreterInput = {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  languageIds?: string[];
  availability?: Array<{ weekday: number; block: AvailabilityBlock }>;
};

const updateInterpreter = async (id: string, data: UpdateInterpreterInput) => {
  const interpreter = await interpreterService.updateInterpreter(id, data);
  return InterpreterDto.toInterpreterData(interpreter);
};

export default updateInterpreter;

