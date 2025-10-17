import { Suspense } from "react";
import { WizardInfoForm } from "@/components/member-info/wizard-info-form";

function MemberInfoContent() {
  return <WizardInfoForm />;
}

export default function MemberInfoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <MemberInfoContent />
    </Suspense>
  );
}
