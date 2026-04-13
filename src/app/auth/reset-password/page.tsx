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
import {
  Home,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
} from "lucide-react";

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type Form = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [canReset, setCanReset] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const hashHasRecovery =
      typeof window !== "undefined" &&
      window.location.hash.includes("type=recovery");

    if (searchParams.get("recovery") === "1" || hashHasRecovery) {
      setCanReset(true);
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY") {
        setCanReset(true);
      }
    });

    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setTimedOut(true);
    }, 8000);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      sub.subscription.unsubscribe();
    };
  }, [searchParams]);

  const onSubmit = async (data: Form) => {
    setIsLoading(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      if (error) throw error;
      toast.success("Password updated. You can sign in now.");
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Could not update password";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!canReset) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground text-sm">
          {timedOut
            ? "This reset link is invalid or expired. Request a new one below."
            : "Checking your reset link… If nothing happens, open the link from your email again."}
        </p>
        {!timedOut && (
          <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden />
        )}
        <Button variant="outline" asChild className="w-full">
          <Link href="/auth/forgot-password">Request new link</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            className="pl-12 pr-12 h-12"
            {...register("password")}
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repeat password"
            className="pl-12 h-12"
            {...register("confirmPassword")}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Updating…
          </>
        ) : (
          "Update password"
        )}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
          <h1 className="text-4xl font-bold mb-4">Choose a new password</h1>
          <p className="text-lg text-white/80">
            Pick a strong password you haven&apos;t used elsewhere.
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

          <h2 className="text-3xl font-bold mb-2">Set new password</h2>
          <p className="text-muted-foreground mb-8">
            Enter and confirm your new password below.
          </p>

          <Suspense
            fallback={
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
