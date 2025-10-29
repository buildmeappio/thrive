"use server";
import interpreterService from "../server/interpreter.service";
import { InterpreterDto } from "../server/dto/interpreter.dto";

type CreateInterpreterInput = {
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  languageIds: string[];
};

const createInterpreter = async (data: CreateInterpreterInput) => {
  const interpreter = await interpreterService.createInterpreter(data);
  return InterpreterDto.toInterpreterData(interpreter);
};

export default createInterpreter;

