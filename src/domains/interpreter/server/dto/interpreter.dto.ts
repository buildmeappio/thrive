import { Interpreter, InterpreterLanguage, InterpreterAvailability, Language } from "@prisma/client";
import { InterpreterData } from "../../types/InterpreterData";

type InterpreterWithRelations = Interpreter & {
  languages: (InterpreterLanguage & {
    language: Language;
  })[];
  availability: InterpreterAvailability[];
};

export class InterpreterDto {
  static toInterpreterData(interpreter: InterpreterWithRelations): InterpreterData {
    return {
      id: interpreter.id,
      companyName: interpreter.companyName,
      contactPerson: interpreter.contactPerson,
      email: interpreter.email,
      phone: interpreter.phone ?? undefined,
      languages: interpreter.languages.map(il => ({
        id: il.language.id,
        name: il.language.name,
      })),
      availability: interpreter.availability.map(a => ({
        id: a.id,
        weekday: a.weekday,
        block: a.block,
      })),
      createdAt: interpreter.createdAt,
      updatedAt: interpreter.updatedAt,
    };
  }

  static toInterpreterDataList(interpreters: InterpreterWithRelations[]): InterpreterData[] {
    return interpreters.map(interpreter => this.toInterpreterData(interpreter));
  }
}

