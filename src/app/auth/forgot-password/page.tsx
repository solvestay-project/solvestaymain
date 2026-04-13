"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Home, Mail, ArrowLeft, Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type Form = z.infer<typeof schema>;

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      toast.error(err);
      router.replace("/auth/forgot-password", { scroll: false });
    }
  }, [searchParams, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    setIsLoading(true);
    const supabase = createClient();
    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/auth/reset-password")}`;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        data.email,
        { redirectTo }
      );
      if (error) throw error;
      setSent(true);
      toast.success("Check your email for a reset link.");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary to-accent relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
              <Home className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">Solvestay</span>
          </Link>
          <h1 className="text-4xl font-bold mb-4">Reset your password</h1>
          <p className="text-lg text-white/80">
            We&apos;ll email you a secure link to choose a new password.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>

          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Solvestay</span>
          </div>

          <h2 className="text-3xl font-bold mb-2">Forgot password?</h2>
          <p className="text-muted-foreground mb-8">
            Enter your account email and we&apos;ll send you reset instructions.
          </p>

          {sent ? (
            <div className="rounded-xl border bg-muted/40 p-6 text-sm text-muted-foreground">
              If an account exists for that address, you&apos;ll receive an email
              shortly. You can close this tab or{" "}
              <Link href="/auth/login" className="text-primary font-medium hover:underline">
                return to sign in
              </Link>
              .
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="pl-12 h-12"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
