"use server";
import interpreterService from "../server/interpreter.service";
import { InterpreterDto } from "../server/dto/interpreter.dto";

const getInterpreterById = async (id: string) => {
  const interpreter = await interpreterService.getInterpreterById(id);
  return InterpreterDto.toInterpreterData(interpreter);
};

export default getInterpreterById;

