import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
import { capitalizeWords } from "@/utils/text";
import { formatText } from "../../utils";
import type { ExaminerData } from "../../types/ExaminerData";

interface IMEBackgroundSectionProps {
  examiner: ExaminerData;
}

export const IMEBackgroundSection = ({
  examiner,
}: IMEBackgroundSectionProps) => {
  return (
    <Section title="IME Background and Experience">
      <FieldRow
        label="Have you completed any IMEs?"
        value={
          examiner.imesCompleted
            ? examiner.imesCompleted.toLowerCase() === "yes"
              ? "Yes"
              : examiner.imesCompleted.toLowerCase() === "no"
                ? "No"
                : examiner.imesCompleted.charAt(0).toUpperCase() +
                  examiner.imesCompleted.slice(1).toLowerCase()
            : "-"
        }
        type="text"
      />
      <FieldRow
        label="Are you currently conducting IMEs?"
        value={examiner.currentlyConductingIMEs ? "Yes" : "No"}
        type="text"
      />
      <FieldRow
        label="Assessment Types"
        value={
          examiner.assessmentTypes && examiner.assessmentTypes.length > 0
            ? examiner.assessmentTypes
                .map((type) => formatText(type))
                .join(", ")
            : "-"
        }
        type="text"
      />
      {examiner.assessmentTypeOther &&
      examiner.assessmentTypeOther.trim() !== "" ? (
        <FieldRow
          label="Other Assessment Type"
          value={capitalizeWords(examiner.assessmentTypeOther)}
          type="text"
        />
      ) : null}
      {/* Tell us about your experience */}
      {examiner.experienceDetails &&
      examiner.experienceDetails.trim() !== "" ? (
        <div className="rounded-lg bg-[#F6F6F6] px-4 py-3 min-h-[169px] flex flex-col">
          <h4 className="font-normal font-[Poppins] text-[14px] sm:text-[16px] leading-none tracking-[-0.03em] text-[#4E4E4E] mb-3">
            Tell us about your experience
          </h4>
          <p
            className="font-poppins text-sm sm:text-base text-[#000080] flex-1 overflow-hidden"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 6,
              WebkitBoxOrient: "vertical",
              textOverflow: "ellipsis",
            }}
          >
            {examiner.experienceDetails}
          </p>
        </div>
      ) : (
        <FieldRow label="Tell us about your experience" value="-" type="text" />
      )}
    </Section>
  );
};
