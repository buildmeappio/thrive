import { useEffect } from "react";
import {
  listContractsAction,
  getContractAction,
} from "@/domains/contracts/actions";
import { listCustomVariablesAction } from "@/domains/custom-variables/actions/listCustomVariables";
import type {
  ExaminerStatus,
  ContractData,
} from "../types/examinerDetail.types";
import logger from "@/utils/logger";

interface UseContractDataProps {
  status: ExaminerStatus;
  examinerId: string;
  isApplication: boolean;
  setContractData: (data: ContractData | null) => void;
  setLoadingContractData: (loading: boolean) => void;
}

export const useContractData = ({
  status,
  examinerId,
  isApplication,
  setContractData,
  setLoadingContractData,
}: UseContractDataProps) => {
  useEffect(() => {
    const loadContractData = async () => {
      // Only load if contract has been sent/signed
      if (
        !["contract_sent", "contract_signed", "approved", "active"].includes(
          status,
        )
      ) {
        return;
      }

      setLoadingContractData(true);
      try {
        // Get contract for this examiner/application
        const contracts = await listContractsAction({
          [isApplication ? "applicationId" : "examinerProfileId"]: examinerId,
          status: "ALL",
        });

        if (contracts && contracts.length > 0) {
          // Get the latest contract
          const latestContract = contracts[0];

          // Get contract details with fieldValues
          const contractDetailResult = await getContractAction(
            latestContract.id,
          );
          if (contractDetailResult.success && contractDetailResult.data) {
            const fieldValues = contractDetailResult.data.fieldValues || {};

            // Load custom variables to get their labels
            const customVarsResult = await listCustomVariablesAction({
              isActive: true,
            });

            if (customVarsResult.success && customVarsResult.data) {
              setContractData({
                fieldValues,
                customVariables: customVarsResult.data,
              });
            }
          }
        }
      } catch (error) {
        logger.error("Error loading contract data:", error);
      } finally {
        setLoadingContractData(false);
      }
    };

    loadContractData();
  }, [
    status,
    examinerId,
    isApplication,
    setContractData,
    setLoadingContractData,
  ]);
};
