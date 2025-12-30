"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppToast } from "@/hooks/use-app-toast";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  avatar?: string;
}

export function ProfileForm() {
  const t = useTranslations("Profile");
  const { prismaUser, loading: userLoading } = useUser();
  const toast = useAppToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    id: "",
    email: "",
    firstname: "",
    lastname: "",
    avatar: "",
  });

  useEffect(() => {
    if (prismaUser) {
      setFormData({
        id: prismaUser.id || "",
        email: prismaUser.email || "",
        firstname: prismaUser.firstname || "",
        lastname: prismaUser.lastname || "",
        avatar: prismaUser.avatar || "",
      });
    }
  }, [prismaUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prismaUser) {
      toast.error("User not found");
      return;
    }

    try {
      setSaving(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Session expired. Please login again.");
        return;
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          firstname: formData.firstname,
          lastname: formData.lastname,
          avatar: formData.avatar,
        }),
      });

      if (response.ok) {
        toast.success("Profile updated successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="firstname" className="text-sm font-medium">
            {t("firstName")}
          </label>
          <Input
            id="firstname"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            placeholder={t("enterFirstName")}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="lastname" className="text-sm font-medium">
            {t("lastName")}
          </label>
          <Input
            id="lastname"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            placeholder={t("enterLastName")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          {t("email")}
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          {t("emailCannotBeChanged")}
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="avatar" className="text-sm font-medium">
          {t("avatar")}
        </label>
        <Input
          id="avatar"
          name="avatar"
          type="url"
          value={formData.avatar || ""}
          onChange={handleChange}
          placeholder={t("enterAvatarUrl")}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("saveChanges")}
        </Button>
      </div>
    </form>
  );
}
