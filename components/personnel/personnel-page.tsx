"use client";

import { AlertCircle, KeyRound, Mail, Pencil, Plus, Trash2, UserCog, Users } from "lucide-react";
import { useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { Skeleton } from "@/components/ui/skeleton";
import { hasSupabaseAuth } from "@/lib/auth/config";
import { cn } from "@/lib/utils";
import {
  isValidEmailInput,
  isValidPhoneInput,
  normalizeEmailInput,
  normalizePhoneInput,
  normalizeWhitespace,
} from "@/lib/validation/form-fields";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

type PersonnelRow = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  telefono: string | null;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
};

type PersonnelFormState = {
  firstname: string;
  lastname: string;
  email: string;
  telefono: string;
};

const EMPTY_FORM: PersonnelFormState = {
  firstname: "",
  lastname: "",
  email: "",
  telefono: "",
};

export function PersonnelPage() {
  const t = useTranslations("Personnel");
  const tCommon = useTranslations("Common");
  const [personnel, setPersonnel] = useState<PersonnelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PersonnelRow | null>(null);
  const [form, setForm] = useState<PersonnelFormState>(EMPTY_FORM);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const loadPersonnel = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/personnel", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || t("loadError"));
      }

      setPersonnel(data.personnel || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersonnel();
  }, []);

  const openCreateDialog = () => {
    setDialogMode("create");
    setSelectedPersonnelId(null);
    setForm(EMPTY_FORM);
    setHasAttemptedSubmit(false);
    setDialogOpen(true);
  };

  const openEditDialog = (item: PersonnelRow) => {
    setDialogMode("edit");
    setSelectedPersonnelId(item.id);
    setForm({
      firstname: item.firstname,
      lastname: item.lastname,
      email: item.email,
      telefono: item.telefono ?? "",
    });
    setHasAttemptedSubmit(false);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setHasAttemptedSubmit(true);
      setSaving(true);
      const payload = {
        firstname: normalizeWhitespace(form.firstname),
        lastname: normalizeWhitespace(form.lastname),
        email: normalizeEmailInput(form.email),
        telefono: normalizePhoneInput(form.telefono),
      };

      if (!payload.firstname || !payload.lastname || !isValidEmailInput(payload.email)) {
        throw new Error(t("saveError"));
      }

      if (payload.telefono && !isValidPhoneInput(payload.telefono)) {
        throw new Error(t("saveError"));
      }

      const response = await fetch(
        dialogMode === "create" ? "/api/personnel" : `/api/personnel/${selectedPersonnelId}`,
        {
          method: dialogMode === "create" ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || t("saveError"));
      }

      setHasAttemptedSubmit(false);
      toast.success(dialogMode === "create" ? t("created") : t("updated"));
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      setSelectedPersonnelId(null);
      await loadPersonnel();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/personnel/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || t("deleteError"));
      }
      toast.success(t("deleted"));
      setDeleteTarget(null);
      await loadPersonnel();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("deleteError"));
    } finally {
      setSaving(false);
    }
  };

  const handleResendPassword = async (item: PersonnelRow) => {
    try {
      const response = await fetch(`/api/personnel/${item.id}/reset-password`, {
        method: "POST",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || t("resendError"));
      }

      toast.success(t("resendSuccess"));
      await loadPersonnel();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("resendError"));
    }
  };

  const personnelCount = personnel.length;
  const resetCount = personnel.filter((item) => item.mustChangePassword).length;
  const formErrors = {
    firstname: hasAttemptedSubmit && !normalizeWhitespace(form.firstname),
    lastname: hasAttemptedSubmit && !normalizeWhitespace(form.lastname),
    email:
      hasAttemptedSubmit &&
      (!normalizeEmailInput(form.email) || !isValidEmailInput(normalizeEmailInput(form.email))),
    telefono:
      hasAttemptedSubmit &&
      Boolean(normalizePhoneInput(form.telefono)) &&
      !isValidPhoneInput(normalizePhoneInput(form.telefono)),
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {hasSupabaseAuth ? (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <div className="space-y-1">
            <p className="font-medium">{t("localAuthRequiredTitle")}</p>
            <AlertDescription>{t("localAuthRequiredDescription")}</AlertDescription>
          </div>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.totalPersonnel")}</p>
              <p className="text-2xl font-semibold">{personnelCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.pendingReset")}</p>
              <p className="text-2xl font-semibold">{resetCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.quickAction")}</p>
              <p className="text-base font-medium">{t("stats.quickActionDescription")}</p>
            </div>
            <Button onClick={openCreateDialog} disabled={hasSupabaseAuth}>
              <Plus className="mr-2 h-4 w-4" />
              {t("addPersonnel")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t("listTitle")}</CardTitle>
            <CardDescription>{t("listDescription")}</CardDescription>
          </div>
          <Button onClick={openCreateDialog} disabled={hasSupabaseAuth}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addPersonnel")}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : personnel.length === 0 ? (
            <Alert variant="info">
              <UserCog className="h-4 w-4" />
              <div className="space-y-1">
                <p className="font-medium">{t("emptyTitle")}</p>
                <AlertDescription>{t("emptyDescription")}</AlertDescription>
              </div>
            </Alert>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">{t("columns.name")}</th>
                    <th className="px-4 py-3 font-medium">{t("columns.email")}</th>
                    <th className="px-4 py-3 font-medium">{t("columns.phone")}</th>
                    <th className="px-4 py-3 font-medium">{t("columns.status")}</th>
                    <th className="px-4 py-3 font-medium">{t("columns.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {personnel.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-3 font-medium">
                        {item.firstname} {item.lastname}
                      </td>
                      <td className="px-4 py-3">{item.email}</td>
                      <td className="px-4 py-3">{item.telefono || "—"}</td>
                      <td className="px-4 py-3">
                        {item.mustChangePassword ? (
                          <Badge variant="warning">{t("status.mustReset")}</Badge>
                        ) : (
                          <Badge variant="success">{t("status.active")}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(item)}>
                            <Pencil className="mr-2 h-3.5 w-3.5" />
                            {tCommon("edit")}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleResendPassword(item)}>
                            <Mail className="mr-2 h-3.5 w-3.5" />
                            {t("resendInvite")}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setDeleteTarget(item)}>
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            {tCommon("delete")}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? t("createTitle") : t("editTitle")}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create" ? t("createDescription") : t("editDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstname">{t("fields.firstname")}</Label>
              <Input
                id="firstname"
                value={form.firstname}
                onChange={(event) =>
                  setForm((current) => ({ ...current, firstname: event.target.value }))
                }
                autoComplete="given-name"
                autoCapitalize="words"
                maxLength={80}
                aria-invalid={formErrors.firstname}
                className={cn(formErrors.firstname && "border-red-500 ring-1 ring-red-500/20")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastname">{t("fields.lastname")}</Label>
              <Input
                id="lastname"
                value={form.lastname}
                onChange={(event) =>
                  setForm((current) => ({ ...current, lastname: event.target.value }))
                }
                autoComplete="family-name"
                autoCapitalize="words"
                maxLength={80}
                aria-invalid={formErrors.lastname}
                className={cn(formErrors.lastname && "border-red-500 ring-1 ring-red-500/20")}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">{t("fields.email")}</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                autoComplete="email"
                autoCapitalize="none"
                inputMode="email"
                spellCheck={false}
                aria-invalid={formErrors.email}
                className={cn(formErrors.email && "border-red-500 ring-1 ring-red-500/20")}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="telefono">{t("fields.phone")}</Label>
              <PhoneInput
                id="telefono"
                value={form.telefono}
                onChange={(value) =>
                  setForm((current) => ({ ...current, telefono: normalizePhoneInput(value || "") }))
                }
                autoComplete="tel"
                defaultCountry="US"
                aria-invalid={formErrors.telefono}
                className={cn(formErrors.telefono && "[&_input]:border-red-500 [&_input]:ring-1 [&_input]:ring-red-500/20")}
              />
            </div>
          </div>
          {dialogMode === "create" ? (
            <Alert variant="info">
              <Mail className="h-4 w-4" />
              <div className="space-y-1">
                <p className="font-medium">{t("inviteTitle")}</p>
                <AlertDescription>{t("inviteDescription")}</AlertDescription>
              </div>
            </Alert>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? t("saving") : dialogMode === "create" ? t("createAction") : t("saveAction")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDescription", {
                name: deleteTarget ? `${deleteTarget.firstname} ${deleteTarget.lastname}` : "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
