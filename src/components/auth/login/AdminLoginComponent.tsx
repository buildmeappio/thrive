import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import { PasswordInput } from "~/components/ui/PasswordInput";

export function AdminLoginComponent() {
  return (
    <div className="flex min-h-screen flex-col justify-between md:flex-row">
      <div className="mt-14 pl-40 flex flex-1 flex-col">
        <h1 className="mb-8 text-xl font-bold md:text-4xl">
          Welcome To{" "}
          <span className="bg-gradient-to-r from-[#01F4C8] to-[#00A8FF] bg-clip-text text-transparent">
            Thrive
          </span>{" "}
          <br />
          Admin Dashboard
        </h1>
        <div className="w-full max-w-sm rounded-xl border-[#E9EDEE] bg-white p-6 shadow-xs">
          <h2 className="mb-4 text-lg font-semibold">Log In</h2>
          <form>
            <div className="mb-5">
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
                className="text-sm font-medium text-[#0069A0] hover:underline"
              >
                Forgot Password?
              </a>
            </div>
            <Button type="submit" variant="adminLogin" size="adminLogin">
              Log In
            </Button>
          </form>
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/adminLogin.png"
            alt="Admin Dashboard Preview"
            width={800}
            height={200}
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
