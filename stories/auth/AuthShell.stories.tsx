import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";

import { AuthCardShell } from "@/components/auth/auth-card-shell";
import { AuthHeroPanel } from "@/components/auth/auth-hero-panel";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarDays,
  KeyRound,
  LayoutDashboard,
  Mail,
  MailCheck,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const meta = {
  title: "Auth/Shell",
  component: AuthSplitLayout,
  subcomponents: {
    AuthHeroPanel,
    AuthCardShell,
  },
  parameters: {
    layout: "fullscreen",
  },
  args: {
    hero: null,
    form: null,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AuthSplitLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

function AuthStoryFrame({ children }: { children: ReactNode }) {
  return (
    <div className="app-page-gradient min-h-screen bg-secondary px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {children}
      </div>
    </div>
  );
}

export const LoginLayout: Story = {
  render: () => (
    <AuthStoryFrame>
      <AuthSplitLayout
        hero={
          <AuthHeroPanel
            eyebrow="Protected access"
            title="Step back into your booking workspace"
            description="Review schedules, manage participants, and move through the day with less friction."
            features={[
              { icon: CalendarDays, label: "Appointments" },
              { icon: LayoutDashboard, label: "Dashboard" },
              { icon: UserRound, label: "Profile" },
            ]}
          />
        }
        form={
          <AuthCardShell
            title="Sign In"
            description="Enter your email below to login to your account"
          >
            <form>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2.5">
                  <Label htmlFor="storybook-login-email" className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="storybook-login-email"
                    type="email"
                    placeholder="m@example.com"
                    className="h-12 rounded-xl border-border/75 bg-background/78 px-4 text-sm shadow-none"
                  />
                </div>
                <div className="grid gap-2.5">
                  <Label htmlFor="storybook-login-password" className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Password
                  </Label>
                  <Input
                    id="storybook-login-password"
                    type="password"
                    placeholder="••••••••"
                    className="h-12 rounded-xl border-border/75 bg-background/78 px-4 text-sm shadow-none"
                  />
                </div>
                <Button
                  type="button"
                  className="h-12 w-full rounded-xl border border-black/10 text-base font-medium text-white"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #0d4673 0%, #1172B8 100%)",
                  }}
                >
                  Sign In
                </Button>
              </div>
            </form>
          </AuthCardShell>
        }
      />
    </AuthStoryFrame>
  ),
};

export const ForgotPasswordLocal: Story = {
  render: () => (
    <AuthStoryFrame>
      <AuthSplitLayout
        hero={
          <AuthHeroPanel
            eyebrow="Protected access"
            title="Reset Password"
            description="Enter your email address and we'll send you a temporary password for local development."
            eyebrowIcon={ShieldCheck}
            features={[
              { icon: Mail, label: "Email" },
              { icon: KeyRound, label: "Reset Password" },
              { icon: ShieldCheck, label: "Protected access" },
            ]}
          />
        }
        form={
          <AuthCardShell
            title="Check Your Email"
            description="Temporary password sent"
          >
            <div className="space-y-6">
              <div className="flex items-start gap-3 rounded-2xl border border-primary/16 bg-primary/6 px-4 py-4 text-sm">
                <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Temporary password sent</p>
                  <p className="text-muted-foreground">
                    If the account exists, you will receive an email with a temporary password.
                  </p>
                  <p className="text-muted-foreground">
                    In local development, check your local mailbox or Mailpit inbox for the message.
                  </p>
                </div>
              </div>

              <Button variant="outline" className="h-12 w-full rounded-xl border-border/75 bg-background/72 text-base font-medium">
                Back to Sign In
              </Button>
            </div>
          </AuthCardShell>
        }
      />
    </AuthStoryFrame>
  ),
};
