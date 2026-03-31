"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Lock, User, Loader2, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      localStorage.setItem("sass_token", "mock_token");
      localStorage.setItem("sass_user", JSON.stringify({ userId: "1", username: "admin", role: "admin" }));
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Matrix-like glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 border border-primary/20 mb-4">
             <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-mono tracking-[0.3em] font-bold text-primary uppercase">SASS CORE</h1>
          <p className="text-[10px] font-mono text-muted uppercase tracking-widest italic">Secure Access Surveillance System // Tactical Node</p>
        </div>

        <Card className="border-card-border/50 bg-card/60 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-sm font-mono tracking-widest">AUTHENTICATION REQUIRED</CardTitle>
            <CardDescription className="text-[10px] font-mono uppercase">Level 4 Clearance Encrypted Link</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-muted" />
                  <input 
                    className="w-full bg-black/40 border border-card-border p-3 pl-10 text-xs font-mono focus:outline-none focus:border-primary transition-all text-primary placeholder:text-muted"
                    placeholder="OPERATOR_ID"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted" />
                  <input 
                    type="password"
                    className="w-full bg-black/40 border border-card-border p-3 pl-10 text-xs font-mono focus:outline-none focus:border-primary transition-all text-primary placeholder:text-muted"
                    placeholder="SECURITY_KEY"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 gap-2" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>INITIATE UPLINK</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-card-border/30 pt-6">
             <p className="text-[9px] font-mono text-muted uppercase">
               Don't have access? <Link href="/register" className="text-primary hover:underline">Request Credentials</Link>
             </p>
          </CardFooter>
        </Card>

        <div className="text-center">
           <div className="text-[9px] font-mono text-muted/50 uppercase tracking-tighter">
             WARNING: UNAUTHORIZED ACCESS IS LOGGED AND TRACED BY SYSTEM KERNEL.
           </div>
        </div>
      </div>
    </div>
  );
}
