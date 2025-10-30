"use client";

import React from "react";
import ChaperoneTable from "./ChaperoneTable";
import { ChaperoneData } from "../types/Chaperone";

interface ChaperoneComponentProps {
  chaperones: ChaperoneData[];
}

const ChaperoneComponent = ({ chaperones }: ChaperoneComponentProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
            Chaperones
          </h1>
        </div>
      </div>

      <ChaperoneTable chaperoneList={chaperones} />
    </div>
  );
};

export default ChaperoneComponent;
