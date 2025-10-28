"use server";
import interpreterService from "../server/interpreter.service";
import { InterpreterDto } from "../server/dto/interpreter.dto";
import { AvailabilityBlock } from "@prisma/client";

type CreateInterpreterInput = {
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  languageIds: string[];
  availability: Array<{ weekday: number; block: AvailabilityBlock }>;
};

const createInterpreter = async (data: CreateInterpreterInput) => {
  const interpreter = await interpreterService.createInterpreter(data);
  return InterpreterDto.toInterpreterData(interpreter);
};

export default createInterpreter;

