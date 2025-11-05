"use server";
import interpreterService from "../server/interpreter.service";
import { InterpreterDto } from "../server/dto/interpreter.dto";
import { InterpreterFilters } from "../types/InterpreterData";

const getInterpreters = async (filters: InterpreterFilters = {}) => {
  const result = await interpreterService.getInterpreters(filters);
  
  return {
    data: InterpreterDto.toInterpreterDataList(result.data),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
  };
};

export default getInterpreters;

