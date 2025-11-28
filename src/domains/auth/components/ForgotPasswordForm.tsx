
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { URLS } from "@/constants/route";
import Link from "next/link";
import * as z from "zod";
import { useRouter } from "next/navigation";
import authActions from "../actions";
import logger from "@/utils/logger";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});
type FormInput = z.infer<typeof schema>;

const Form = () => {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } =
    useForm<FormInput>({
      resolver: zodResolver(schema),
      defaultValues: { email: "" },
      mode: "onSubmit",
    });

  const onSubmit = async (values: FormInput) => {
    try {
      const formData = new FormData();
      formData.append("email", values.email);
      
      const result = await authActions.forgotPassword(formData);
      
      if (result.success && result.userExists !== false) {
        // Redirect to email sent page with email in query params
        router.push(`${URLS.PASSWORD_EMAIL_SENT}?email=${encodeURIComponent(values.email)}`);
      } else {
        // Email not registered
        setError("email", {
          type: "manual",
          message: "User does not exists. Please contact your administrator",
        });
      }
    } catch (error) {
      logger.error("Error in forgot password:", error);
      setError("email", {
        type: "manual",
        message: "User does not exists. Please contact your administrator",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
      <div>
        <Label htmlFor="email" className="text-black text-xs sm:text-[13px] md:text-sm">
          Email<span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your registered email"
          disabled={isSubmitting}
          className={`mt-1 h-11 md:h-12 text-sm sm:text-[15px] border-none bg-[#F2F5F6]
                      placeholder:text-[#9EA9AA] placeholder:text-sm sm:placeholder:text-[15px]
                      focus-visible:ring-1 focus-visible:ring-offset-0
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${errors.email ? "ring-1 ring-red-500" : ""}`}
          {...register("email")}
        />
        <p className="min-h-[16px] text-sm text-red-500 mt-1">{errors.email?.message}</p>
      </div>

      <Button
        type="submit"
        variant="default"
        size="default"
        disabled={isSubmitting}
        className="w-full h-11 md:h-12 text-sm sm:text-[15px] bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] hover:opacity-90 text-white font-medium"
      >
        {isSubmitting ? "Sending..." : "Send Reset Link"}
      </Button>

      <div className="flex justify-center pt-1">
        <Link href={URLS.LOGIN} className="text-xs sm:text-sm font-medium text-[#0069A0] hover:underline">
          Back to Login
        </Link>
      </div>
    </form>
  );
}

export default Form;
