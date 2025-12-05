"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { checkExaminerStatus } from "@/app/actions/checkExaminerStatus";

export function useSuspendedCheck() {
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { isSuspended } = await checkExaminerStatus();
        
        if (isSuspended) {
          // Log out and redirect
          await signOut({ 
            redirect: true,
            callbackUrl: "/examiner/login?error=suspended&message=Your account has been suspended. Please contact support@thrivenetwork.ca"
          });
        }
      } catch (error) {
        console.error("Error checking suspension status:", error);
      }
    };

    // Check immediately on mount
    checkStatus();
    
    // Check every 30 seconds for real-time updates
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, [router]);
}

