import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import { PasswordInput } from "~/components/ui/PasswordInput";
import { ArrowRight } from "lucide-react";
export function OrganizationLoginComponent() {
  return (
    <div className="flex min-h-screen flex-col justify-center md:justify-between md:flex-row">
      <div className="px-6 flex w-full flex-col justify-center items-center md:mt-14 md:ml-40 md:w-[45%] md:items-start md:px-0 md:justify-start">
        <h1 className="mb-8 text-2xl font-bold text-center md:text-4xl md:text-left">
          Welcome To <span>Thrive</span>{" "}
        </h1>
        <div className="w-full max-w-sm rounded-xl border-[#E9EDEE] bg-white p-6 shadow-xs">
          <h2 className="mb-6 text-lg font-semibold">Log In</h2>
          <form>
            <div className="mb-6">
              <Label htmlFor="email" className="text-black">
                Email<span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className="mt-1 border-none bg-[#F2F5F6] placeholder:text-[#9EA9AA] focus-visible:ring-1 focus-visible:ring-offset-0"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="password" className="text-black">
                Password<span className="text-red-500">*</span>
              </Label>
              <PasswordInput />
            </div>
            <div className="mb-4 text-right">
              <a
                href="#"
                className="text-sm font-medium text-[#140047] hover:underline"
              >
                Forgot Password?
              </a>
            </div>
            <Button variant="organizationLogin" size="organizationLogin">
              Login{" "}
              <span>
                <ArrowRight strokeWidth={3} color="white" />
              </span>
            </Button>
          </form>
        </div>
      </div>
      <div className="hidden md:block relative mt-10 flex-1 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/org-gettingStarted.png"
            alt="Admin Dashboard Preview"
            width={200}
            height={200}
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}