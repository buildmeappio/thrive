
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { URLS } from "@/constants/route";
import Link from "next/link";
import * as z from "zod";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});
type FormInput = z.infer<typeof schema>;

const Form = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormInput>({
      resolver: zodResolver(schema),
      defaultValues: { email: "" },
      mode: "onSubmit",
    });

  const onSubmit = async (values: FormInput) => {
    // TODO: call API
    await new Promise(r => setTimeout(r, 800));
    console.log(`Reset link sent`, values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label htmlFor="email" className="text-black text-[13px] md:text-sm">
          Email<span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your registered email"
          disabled={isSubmitting}
          className={`mt-1 h-11 md:h-12 text-[15px] border-none bg-[#F2F5F6]
                      placeholder:text-[#9EA9AA] focus-visible:ring-1 focus-visible:ring-offset-0
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${errors.email ? "ring-1 ring-red-500" : ""}`}
          {...register("email")}
        />
        <p className="min-h-[16px] text-xs text-red-500">{errors.email?.message}</p>
      </div>

      <Button
        type="submit"
        variant="adminLogin"
        size="adminLogin"
        disabled={isSubmitting}
        className="w-full h-11 md:h-12 text-[15px]"
      >
        {isSubmitting ? "Sending..." : "Send Reset Link"}
      </Button>

      <div className="flex justify-center">
        <Link href={URLS.LOGIN} className="text-sm font-medium text-[#0069A0] hover:underline">
          Back to Login
        </Link>
      </div>
    </form>
  );
}

export default Form;
