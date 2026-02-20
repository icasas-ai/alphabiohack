"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppToast } from "@/hooks/use-app-toast";
import { Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  avatar?: string;
  telefono?: string;
  informacionPublica?: string;
  especialidad?: string;
  summary?: string;
  weekdaysHours?: string;
  saturdayHours?: string;
  sundayHours?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
  website?: string;
}

export function ProfileForm() {
  const t = useTranslations("Profile");
  const { prismaUser, loading: userLoading, refreshPrismaUser } = useUser();
  const toast = useAppToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    id: "",
    email: "",
    firstname: "",
    lastname: "",
    avatar: "",
    telefono: "",
    informacionPublica: "",
    especialidad: "",
    summary: "",
    weekdaysHours: "9:00 AM - 6:00 PM",
    saturdayHours: "9:00 AM - 2:00 PM",
    sundayHours: "Closed",
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    tiktok: "",
    youtube: "",
    website: "",
  });

  useEffect(() => {
    if (prismaUser) {
      console.log("ProfileForm: Loading user data", prismaUser);
      setFormData({
        id: prismaUser.id || "",
        email: prismaUser.email || "",
        firstname: prismaUser.firstname || "",
        lastname: prismaUser.lastname || "",
        telefono: (prismaUser as { telefono?: string | null }).telefono ?? "",
        informacionPublica: (prismaUser as { informacionPublica?: string | null }).informacionPublica ?? "",
        avatar: prismaUser.avatar || "",
        especialidad: (prismaUser as { especialidad?: string | null }).especialidad ?? "",
        summary: (prismaUser as { summary?: string | null }).summary ?? "",
        weekdaysHours: (prismaUser as { weekdaysHours?: string | null }).weekdaysHours ?? "9:00 AM - 6:00 PM",
        saturdayHours: (prismaUser as { saturdayHours?: string | null }).saturdayHours ?? "9:00 AM - 2:00 PM",
        sundayHours: (prismaUser as { sundayHours?: string | null }).sundayHours ?? "Closed",
        facebook: (prismaUser as { facebook?: string | null }).facebook ?? "",
        instagram: (prismaUser as { instagram?: string | null }).instagram ?? "",
        linkedin: (prismaUser as { linkedin?: string | null }).linkedin ?? "",
        twitter: (prismaUser as { twitter?: string | null }).twitter ?? "",
        tiktok: (prismaUser as { tiktok?: string | null }).tiktok ?? "",
        youtube: (prismaUser as { youtube?: string | null }).youtube ?? "",
        website: (prismaUser as { website?: string | null }).website ?? "",
      });
    } else {
      console.log("ProfileForm: No prismaUser available");
    }
  }, [prismaUser]);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (name === "avatar" && files && files.length > 0) {
      const file = files[0];
      // Validar que sea una imagen
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor selecciona un archivo de imagen válido");
        return;
      }
      // Validar tamaño máximo (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("La imagen debe ser menor a 5MB");
        return;
      }

      try {
        const base64String = await convertFileToBase64(file);
        setFormData((prev) => ({
          ...prev,
          avatar: base64String,
        }));
        toast.success("Imagen cargada correctamente");
      } catch (error) {
        toast.error("Error al procesar la imagen");
        console.error("Error converting file to base64:", error);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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
          informacionPublica: formData.informacionPublica,
          telefono: formData.telefono,
          especialidad: formData.especialidad,
          summary: formData.summary,
          weekdaysHours: formData.weekdaysHours,
          saturdayHours: formData.saturdayHours,
          sundayHours: formData.sundayHours,
          facebook: formData.facebook,
          instagram: formData.instagram,
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          tiktok: formData.tiktok,
          youtube: formData.youtube,
          website: formData.website,
        }),
      });

      if (response.ok) {
        toast.success("Profile updated successfully");
        // Refrescar los datos del usuario en el contexto
        await refreshPrismaUser();
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

  if (!prismaUser) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No user data available</p>
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
        <div className="flex items-center gap-4">
          <Input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="cursor-pointer"
          />
          <Upload className="h-4 w-4 text-muted-foreground" />
        </div>
        {formData.avatar && formData.avatar.startsWith("data:image") && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Vista previa:</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={formData.avatar}
              alt="Avatar preview"
              className="h-32 w-32 rounded-lg object-cover border"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="telefono" className="text-sm font-medium">
          {t("phone", { default: "Teléfono" })}
        </label>
        <Input
          id="telefono"
          name="telefono"
          type="tel"
          value={formData.telefono || ""}
          onChange={handleChange}
          placeholder={t("enterPhone", { default: "Ingresa tu número de teléfono" })}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="informacionPublica" className="text-sm font-medium">
          {t("address", { default: "Dirección" })}
        </label>
        <Input
          id="informacionPublica"
          name="informacionPublica"
          type="text"
          value={formData.informacionPublica || ""}
          onChange={handleChange}
          placeholder={t("enterAddress", { default: "Ingresa tu dirección" })}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="especialidad" className="text-sm font-medium">
          Especialidad
        </label>
        <Input
          id="especialidad"
          name="especialidad"
          type="text"
          value={formData.especialidad || ""}
          onChange={handleChange}
          placeholder="Ingresa tu especialidad"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="summary" className="text-sm font-medium">
          Summary / Bio
        </label>
        <textarea
          id="summary"
          name="summary"
          value={formData.summary || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
          placeholder="Breve descripción sobre ti"
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          rows={4}
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Business Hours</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="weekdaysHours" className="text-sm font-medium">
              Monday to Friday
            </label>
            <Input
              id="weekdaysHours"
              name="weekdaysHours"
              type="text"
              value={formData.weekdaysHours || ""}
              onChange={handleChange}
              placeholder="9:00 AM - 6:00 PM"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="saturdayHours" className="text-sm font-medium">
              Saturday
            </label>
            <Input
              id="saturdayHours"
              name="saturdayHours"
              type="text"
              value={formData.saturdayHours || ""}
              onChange={handleChange}
              placeholder="9:00 AM - 2:00 PM"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="sundayHours" className="text-sm font-medium">
              Sunday
            </label>
            <Input
              id="sundayHours"
              name="sundayHours"
              type="text"
              value={formData.sundayHours || ""}
              onChange={handleChange}
              placeholder="Closed"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Social Media Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="facebook" className="text-sm font-medium">
              Facebook
            </label>
            <Input
              id="facebook"
              name="facebook"
              type="url"
              value={formData.facebook || ""}
              onChange={handleChange}
              placeholder="https://facebook.com/..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="instagram" className="text-sm font-medium">
              Instagram
            </label>
            <Input
              id="instagram"
              name="instagram"
              type="url"
              value={formData.instagram || ""}
              onChange={handleChange}
              placeholder="https://instagram.com/..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="linkedin" className="text-sm font-medium">
              LinkedIn
            </label>
            <Input
              id="linkedin"
              name="linkedin"
              type="url"
              value={formData.linkedin || ""}
              onChange={handleChange}
              placeholder="https://linkedin.com/..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="twitter" className="text-sm font-medium">
              Twitter / X
            </label>
            <Input
              id="twitter"
              name="twitter"
              type="url"
              value={formData.twitter || ""}
              onChange={handleChange}
              placeholder="https://twitter.com/..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tiktok" className="text-sm font-medium">
              TikTok
            </label>
            <Input
              id="tiktok"
              name="tiktok"
              type="url"
              value={formData.tiktok || ""}
              onChange={handleChange}
              placeholder="https://tiktok.com/..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="youtube" className="text-sm font-medium">
              YouTube
            </label>
            <Input
              id="youtube"
              name="youtube"
              type="url"
              value={formData.youtube || ""}
              onChange={handleChange}
              placeholder="https://youtube.com/..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="website" className="text-sm font-medium">
              Website
            </label>
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website || ""}
              onChange={handleChange}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
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
