"use server";
import interpreterService from "../server/interpreter.service";

const getLanguages = async () => {
  return await interpreterService.getLanguages();
};

export default getLanguages;

