import { Interpreter, InterpreterLanguage, Language } from "@prisma/client";
import { InterpreterData } from "../../types/InterpreterData";

type InterpreterWithRelations = Interpreter & {
  languages: (InterpreterLanguage & {
    language: Language;
  })[];
};

export class InterpreterDto {
  static toInterpreterData(
    interpreter: InterpreterWithRelations,
  ): InterpreterData {
    return {
      id: interpreter.id,
      companyName: interpreter.companyName,
      contactPerson: interpreter.contactPerson,
      email: interpreter.email,
      phone: interpreter.phone ?? undefined,
      languages: interpreter.languages.map((il) => ({
        id: il.language.id,
        name: il.language.name,
      })),
      createdAt: interpreter.createdAt,
      updatedAt: interpreter.updatedAt,
      deletedAt: interpreter.deletedAt ?? undefined,
    };
  }

  static toInterpreterDataList(
    interpreters: InterpreterWithRelations[],
  ): InterpreterData[] {
    return interpreters.map((interpreter) =>
      this.toInterpreterData(interpreter),
    );
  }
}
