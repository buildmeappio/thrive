"use server";
import { getExaminerCount as getExaminerCountHandler } from "../server/handlers/getExaminerCount";

const getExaminerCount = async () => {
  return getExaminerCountHandler();
};

export default getExaminerCount;
