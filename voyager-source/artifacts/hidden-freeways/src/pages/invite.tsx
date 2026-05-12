import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useGetInviteInfo, useRedeemInvite, getGetCurrentUserQueryKey, getGetInviteInfoQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, CheckCircle2, Terminal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Invite() {
  const params = useParams();
  const code = params.code || "";
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const { data: inviteInfo, isLoading: loadingInvite, error: inviteError } = useGetInviteInfo(code, {
    query: { enabled: !!code, queryKey: getGetInviteInfoQueryKey(code) }
  });
  
  const redeemMutation = useRedeemInvite();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !code) return;

    redeemMutation.mutate({ data: { code, username, password } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        setLocation("/");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/5 via-background to-background" />
      <div className="scanlines" />
      <div className="noise" />

      <div className="w-full max-w-md relative z-10 space-y-8 p-8 border border-border/50 bg-card/40 backdrop-blur-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-serif text-accent uppercase tracking-widest">
            Establish <span className="text-foreground">Uplink</span>
          </h1>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            Identity verification required.
          </p>
        </div>

        {loadingInvite ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full bg-muted/20" />
            <Skeleton className="h-10 w-full bg-muted/20" />
            <Skeleton className="h-10 w-full bg-muted/20" />
          </div>
        ) : inviteError || !inviteInfo ? (
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 rounded-none">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle className="font-mono text-sm uppercase tracking-wider">Invalid Code</AlertTitle>
            <AlertDescription className="font-mono text-xs">
              This cryptographic key is invalid, expired, or has already been consumed.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Alert className="border-primary/50 bg-primary/10 rounded-none">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertTitle className="font-mono text-sm text-primary uppercase tracking-wider">Key Accepted</AlertTitle>
              <AlertDescription className="font-mono text-xs text-muted-foreground mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="opacity-50">CODE:</span> {inviteInfo.code}</div>
                  {inviteInfo.invitedBy && <div><span className="opacity-50">ISSUER:</span> {inviteInfo.invitedBy}</div>}
                  {inviteInfo.note && <div className="col-span-2"><span className="opacity-50">NOTE:</span> {inviteInfo.note}</div>}
                </div>
              </AlertDescription>
            </Alert>

            {redeemMutation.error && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 rounded-none">
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription className="font-mono text-xs">
                  Initialization failed. Operative ID may already be in use.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="font-mono text-xs uppercase text-muted-foreground">Choose Operative ID</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-background/50 border-border font-mono rounded-none focus-visible:ring-accent/50"
                  required
                  placeholder="e.g. shadow_walker"
                  pattern="^[a-zA-Z0-9_]{3,20}$"
                  title="3-20 characters, alphanumeric and underscores only"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="font-mono text-xs uppercase text-muted-foreground">Set Passphrase</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-border font-mono rounded-none focus-visible:ring-accent/50"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-none font-serif uppercase tracking-widest hover:bg-accent/90 bg-accent text-accent-foreground transition-colors"
              disabled={redeemMutation.isPending}
            >
              <Terminal className="w-4 h-4 mr-2" />
              {redeemMutation.isPending ? "Processing..." : "Join Network"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
