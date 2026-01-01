interface ContractContentProps {
  processedHtml: string;
}

export const ContractContent = ({ processedHtml }: ContractContentProps) => {
  return (
    <div
      id="contract"
      className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-white rounded-[20px]"
      style={{
        padding: "40px 50px",
        maxWidth: "210mm",
        lineHeight: "1.4",
        boxShadow: "0px 0px 36.35px 0px #00000008",
        height: "calc(100vh - 100px)",
      }}
    >
      <div
        id="contract"
        className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none focus:outline-none font-poppins"
        dangerouslySetInnerHTML={{
          __html: processedHtml || "<div>Sample Contract Content Here</div>",
        }}
      />
    </div>
  );
};
