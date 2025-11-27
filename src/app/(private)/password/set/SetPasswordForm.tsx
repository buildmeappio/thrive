"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { URLS } from "@/constants/route";
import authActions from "@/domains/auth/actions";
import { useSession } from "next-auth/react";

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormInput = z.infer<typeof schema>;

const SetPasswordForm = () => {
  const router = useRouter();
  const { update } = useSession();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormInput>({
      resolver: zodResolver(schema),
      defaultValues: { password: "", confirmPassword: "" },
      mode: "onSubmit",
    });

  const onSubmit = async (values: FormInput) => {
    try {
      const result = await authActions.completeTemporaryPassword({
        password: values.password,
      });
      
      if (result.success) {
        await update?.({ mustResetPassword: false } as any);
        toast.success("Password set successfully!");
        setTimeout(() => {
          router.replace(URLS.DASHBOARD);
        }, 1500);
      } else {
        toast.error(result.error || "Failed to set password. Please try again.");
      }
    } catch (error) {
      console.error("Error setting password:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
      <div>
        <Label htmlFor="password" className="text-black text-xs sm:text-[13px] md:text-sm">
          New Password<span className="text-red-500">*</span>
        </Label>
        <PasswordInput
          id="password"
          placeholder="Enter new password"
          disabled={isSubmitting}
          className={`h-11 md:h-12 text-sm sm:text-[15px] border-none bg-[#F2F5F6]
                      placeholder:text-[#9EA9AA] placeholder:text-sm sm:placeholder:text-[15px]
                      focus-visible:ring-1 focus-visible:ring-offset-0
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${errors.password ? "ring-1 ring-red-500" : ""}`}
          {...register("password")}
        />
        <p className="min-h-[16px] text-xs text-red-500 mt-1">{errors.password?.message}</p>
      </div>

      <div>
        <Label htmlFor="confirmPassword" className="text-black text-xs sm:text-[13px] md:text-sm">
          Confirm Password<span className="text-red-500">*</span>
        </Label>
        <PasswordInput
          id="confirmPassword"
          placeholder="Confirm new password"
          disabled={isSubmitting}
          className={`h-11 md:h-12 text-sm sm:text-[15px] border-none bg-[#F2F5F6]
                      placeholder:text-[#9EA9AA] placeholder:text-sm sm:placeholder:text-[15px]
                      focus-visible:ring-1 focus-visible:ring-offset-0
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${errors.confirmPassword ? "ring-1 ring-red-500" : ""}`}
          {...register("confirmPassword")}
        />
        <p className="min-h-[16px] text-xs text-red-500 mt-1">{errors.confirmPassword?.message}</p>
      </div>

      <Button
        type="submit"
        variant="default"
        size="default"
        disabled={isSubmitting}
        className="w-full h-11 md:h-12 text-sm sm:text-[15px] bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] hover:opacity-90 text-white font-medium"
      >
        {isSubmitting ? "Setting Password..." : "Set Password"}
      </Button>
    </form>
  );
};

export default SetPasswordForm;

