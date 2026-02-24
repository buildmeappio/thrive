'use client';

import { useState, useCallback } from 'react';
import { useSignatureCanvas } from './hooks/useSignatureCanvas';
import { usePdfGeneration } from './hooks/usePdfGeneration';
import { useContractSigning } from './hooks/useContractSigning';
import { useContractDomUpdates } from './hooks/useContractDomUpdates';
import { processContractHtmlWithHeadersFooters } from './utils/contractHelpers';
import { ContractStyles } from './styles/contractStyles';
import { DeclinedView } from './components/DeclinedView';
import { SignedView } from './components/SignedView';
import { SignaturePanel } from './components/SignaturePanel';
import { DeclineModal } from './components/DeclineModal';
import { ContractContent } from './components/ContractContent';
import { ContractSigningViewProps } from '../types/contract.types';

const ContractSigningView = ({
  token: _token,
  contractId,
  examinerProfileId,
  examinerEmail,
  examinerName,
  feeStructure,
  contractHtml,
  isAlreadySigned,
  headerConfig,
  footerConfig,
  checkboxGroupsFromTemplate,
}: ContractSigningViewProps) => {
  const today = new Date().toISOString().split('T')[0];
  const [sigName, _setSigName] = useState(examinerName);
  const [sigDate, _setSigDate] = useState(feeStructure.effectiveDate || today);
  const [agree, setAgree] = useState(false);

  // Process HTML with headers/footers first
  const processedHtml =
    headerConfig || footerConfig
      ? processContractHtmlWithHeadersFooters(contractHtml, headerConfig, footerConfig)
      : contractHtml;

  // Hooks
  const { canvasRef, signatureImage, clearSignature, validateSignature } = useSignatureCanvas();
  const { generatePdfFromHtml } = usePdfGeneration();

  const {
    isSigning,
    isDeclining,
    signed,
    declined,
    showDeclineModal,
    declineReason,
    setShowDeclineModal,
    setDeclineReason,
    handleSign: handleSignInternal,
    handleDecline,
  } = useContractSigning({
    contractId,
    examinerProfileId,
    examinerEmail,
    sigName,
    sigDate,
    contractHtml,
    signatureImage,
    checkboxValues: {}, // Empty object - checkboxes are not interactive
    generatePdfFromHtml,
  });

  // Handle signing with signature validation
  const handleSign = useCallback(async () => {
    if (!validateSignature()) {
      return;
    }
    await handleSignInternal();
  }, [validateSignature, handleSignInternal]);

  // Update DOM with signature, date, and name
  useContractDomUpdates({
    contractHtml: processedHtml,
    signatureImage,
    sigName,
    sigDate,
    checkboxValues: {}, // Empty - checkboxes are read-only
    checkboxGroups: [], // Empty - checkboxes are read-only
  });

  if (declined) {
    return <DeclinedView />;
  }

  if (signed || isAlreadySigned) {
    return <SignedView />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F4FBFF]">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-6 lg:flex-row lg:gap-8">
          <ContractContent processedHtml={processedHtml} />
          <SignaturePanel
            sigName={sigName}
            sigDate={sigDate}
            signatureImage={signatureImage}
            canvasRef={canvasRef}
            clearSignature={clearSignature}
            agree={agree}
            setAgree={setAgree}
            onSign={handleSign}
            onDecline={() => setShowDeclineModal(true)}
            isSigning={isSigning}
          />
        </div>
      </div>

      <DeclineModal
        show={showDeclineModal}
        declineReason={declineReason}
        isDeclining={isDeclining}
        onReasonChange={setDeclineReason}
        onConfirm={handleDecline}
        onCancel={() => {
          setShowDeclineModal(false);
          setDeclineReason('');
        }}
      />

      <ContractStyles />
    </div>
  );
};

export default ContractSigningView;
