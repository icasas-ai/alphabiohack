"use client";

import { AlertCircle, Building2, MapPin, Plus } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocationOperations, useLocations } from "@/hooks";
import { useEffect, useMemo, useState } from "react";

import { AsyncWrapper } from "@/components/ui/async-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationForm } from "./location-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

export function LocationsPage() {
  const t = useTranslations("Locations");
  const tc = useTranslations("Common");
  const { locations, refetch, loading: locationsLoading, error: locationsError } = useLocations();
  const { createLocation, updateLocation, deleteLocation, loading, error } = useLocationOperations();

  const [activeTab, setActiveTab] = useState<"review" | "create">("review");
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locationIdToDelete, setLocationIdToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!locations.length) {
      setSelectedLocationId(null);
      return;
    }

    setSelectedLocationId((current) => {
      if (current && locations.some((location) => location.id === current)) {
        return current;
      }

      return locations[0].id;
    });
  }, [locations]);

  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === selectedLocationId) || null,
    [locations, selectedLocationId],
  );

  const timeZoneReadyCount = locations.filter((location) => location.timezone).length;
  const logoReadyCount = locations.filter((location) => location.logo).length;

  const handleCreateLocation = async (formData: {
    title: string;
    address: string;
    description: string;
    timezone: string;
    logo: string;
    lat?: number;
    lon?: number;
  }) => {
    const result = await createLocation(formData);
    if (!result) return;

    await refetch();
    setActiveTab("review");
    setSelectedLocationId(result.id);
  };

  const handleUpdateLocation = async (
    id: string,
    formData: {
      title: string;
      address: string;
      description: string;
      timezone: string;
      logo: string;
      lat?: number;
      lon?: number;
    },
  ) => {
    const result = await updateLocation(id, formData);
    if (!result) return;

    await refetch();
    setSelectedLocationId(id);
  };

  const handleDeleteLocation = (id: string) => {
    setLocationIdToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!locationIdToDelete) return;

    const success = await deleteLocation(locationIdToDelete);
    if (success) {
      await refetch();
    }

    setDeleteDialogOpen(false);
    setLocationIdToDelete(null);
  };

  const handleRetry = () => {
    refetch();
  };

  return (
    <AsyncWrapper
      loading={locationsLoading}
      error={locationsError}
      data={locations}
      skeletonProps={{
        title: t("title"),
        description: t("description"),
        variant: "default",
      }}
      errorProps={{
        title: t("errorTitle"),
        description: t("errorLoadingLocations"),
        onRetry: handleRetry,
        variant: "card",
      }}
    >
      <div className="motion-stagger space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("description")}</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline">
                <Building2 className="mr-2 h-3.5 w-3.5" />
                {t("totalLocations", { count: locations.length })}
              </Badge>
              <Badge variant="outline">
                <MapPin className="mr-2 h-3.5 w-3.5" />
                {t("timeZoneReadyCount", { count: timeZoneReadyCount })}
              </Badge>
              <Badge variant="outline">{t("logoReadyCount", { count: logoReadyCount })}</Badge>
            </div>

            <Button onClick={() => setActiveTab("create")} disabled={loading}>
              <Plus className="mr-2 h-4 w-4" />
              {t("addNewClinic")}
            </Button>
          </CardContent>
        </Card>

        {error ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex items-center gap-3 pt-6 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{t("manageLocations")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "review" | "create")}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="review">{t("reviewTab")}</TabsTrigger>
                <TabsTrigger value="create">{t("createTab")}</TabsTrigger>
              </TabsList>

              <TabsContent value="review" className="space-y-5">
                <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
                  {t("reviewHelp")}
                </div>

                {!locations.length ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
                      <Building2 className="h-12 w-12 text-primary" />
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{t("noLocations")}</h3>
                        <p className="max-w-md text-sm text-muted-foreground">
                          {t("noLocationsDescription")}
                        </p>
                      </div>
                      <Button onClick={() => setActiveTab("create")}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t("addFirstLocation")}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <div className="rounded-xl border">
                      <div className="border-b px-4 py-3">
                        <h3 className="text-sm font-semibold text-foreground">{t("reviewListTitle")}</h3>
                        <p className="text-sm text-muted-foreground">{t("reviewListDescription")}</p>
                      </div>
                      <div className="space-y-2 p-3">
                        {locations.map((location) => {
                          const isSelected = location.id === selectedLocationId;
                          const hasCoordinates =
                            location.lat !== undefined && location.lon !== undefined;

                          return (
                            <button
                              key={location.id}
                              type="button"
                              onClick={() => setSelectedLocationId(location.id)}
                              className={`w-full rounded-lg border p-3 text-left transition ${
                                isSelected
                                  ? "border-primary bg-primary/5 shadow-sm"
                                  : "border-border/70 hover:border-primary/40 hover:bg-muted/30"
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-medium text-foreground">{location.title}</p>
                                    <p className="text-sm text-muted-foreground">{location.address}</p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs">
                                  <Badge variant="outline">
                                    {location.timezone || t("timezonePending")}
                                  </Badge>
                                  <Badge variant="outline">
                                    {hasCoordinates ? t("coordinatesReady") : t("coordinatesOptionalMissing")}
                                  </Badge>
                                  <Badge variant="outline">
                                    {location.logo ? t("logoReady") : t("logoMissing")}
                                  </Badge>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selectedLocation ? (
                      <LocationForm
                        location={selectedLocation}
                        isNew={false}
                        onSubmit={(formData) => handleUpdateLocation(selectedLocation.id, formData)}
                        onDelete={async () => handleDeleteLocation(selectedLocation.id)}
                        loading={loading}
                      />
                    ) : (
                      <Card className="border-dashed">
                        <CardContent className="flex min-h-80 flex-col items-center justify-center gap-3 text-center">
                          <Building2 className="h-10 w-10 text-primary" />
                          <div className="space-y-1">
                            <h3 className="font-semibold text-foreground">{t("noLocationSelected")}</h3>
                            <p className="text-sm text-muted-foreground">
                              {t("noLocationSelectedDescription")}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="create" className="space-y-5">
                <div className="space-y-3">
                  <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
                    {t("createHelp")}
                  </div>
                  <Badge variant="outline">
                    {t("createSummary", { count: locations.length })}
                  </Badge>
                </div>

                <LocationForm
                  isNew={true}
                  onSubmit={handleCreateLocation}
                  onCancel={() => setActiveTab("review")}
                  loading={loading}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDeleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" disabled={loading}>
              {tc("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction className="cursor-pointer" onClick={confirmDelete} disabled={loading}>
              {tc("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AsyncWrapper>
  );
}
