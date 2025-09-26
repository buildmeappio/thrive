'use server';

import { CreateMedicalExaminerInput } from "../server/handlers/createMedicalExaminer";
import authHandlers from "../server/handlers/index";

const createMedicalExaminer = async (payload: CreateMedicalExaminerInput) => {
    const result = await authHandlers.createMedicalExaminer(payload);
    return result;
};

export default createMedicalExaminer;