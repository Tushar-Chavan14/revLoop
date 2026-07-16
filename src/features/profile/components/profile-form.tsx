"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useFormik } from "formik";
import { Bike, MapPin, PenLine, UserRound } from "lucide-react";
import { AvatarUpload } from "@/components/avatar-upload";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EXPERIENCE_LEVELS,
  profileSchema,
  type ProfileFormValues,
} from "@/features/profile/schema";

interface ProfileFormProps {
  mode: "create" | "edit";
  initialValues: ProfileFormValues;
  initialAvatarUrl?: string | null;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}

export function ProfileForm({ mode, initialValues, initialAvatarUrl, action }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialAvatarUrl ?? null);

  const formik = useFormik<ProfileFormValues>({
    initialValues,
    validationSchema: profileSchema,
    onSubmit: (values) => {
      setFormError(null);

      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.set(key, String(value));
        }
      });
      if (avatarFile) {
        formData.set("avatar", avatarFile);
      }

      startTransition(async () => {
        const result = await action(formData);
        if (result?.error) {
          setFormError(result.error);
        }
      });
    },
  });

  const fieldError = (field: keyof ProfileFormValues) =>
    formik.touched[field] && formik.errors[field] ? String(formik.errors[field]) : undefined;

  return (
    <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserRound className="text-primary size-4" />
            <CardTitle>Photo & basics</CardTitle>
          </div>
          <CardDescription>How other riders will recognize you.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <AvatarUpload
            name="avatar"
            previewUrl={avatarPreview}
            onFileSelect={(file, preview) => {
              setFormError(null);
              setAvatarFile(file);
              setAvatarPreview(preview);
            }}
            onError={setFormError}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="name" error={fieldError("name")}>
              <Input
                id="name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Field>
            <Field label="Username" htmlFor="username" error={fieldError("username")}>
              <Input
                id="username"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bike className="text-primary size-4" />
            <CardTitle>Riding details</CardTitle>
          </div>
          <CardDescription>What you ride and how long you&apos;ve been at it.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Bike brand" htmlFor="bikeBrand" error={fieldError("bikeBrand")}>
            <Input
              id="bikeBrand"
              name="bikeBrand"
              value={formik.values.bikeBrand}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Field>
          <Field label="Bike model" htmlFor="bikeModel" error={fieldError("bikeModel")}>
            <Input
              id="bikeModel"
              name="bikeModel"
              value={formik.values.bikeModel}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Field>
          <Field
            label="Experience level"
            htmlFor="experienceLevel"
            error={fieldError("experienceLevel")}
          >
            <Select
              value={formik.values.experienceLevel}
              onValueChange={(value) => {
                formik.setFieldTouched("experienceLevel", true, false);
                formik.setFieldValue("experienceLevel", value);
              }}
            >
              <SelectTrigger id="experienceLevel" className="w-full">
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Years riding" htmlFor="yearsRiding" error={fieldError("yearsRiding")}>
            <Input
              id="yearsRiding"
              name="yearsRiding"
              type="number"
              min={0}
              max={100}
              value={formik.values.yearsRiding}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="text-primary size-4" />
            <CardTitle>Where you ride</CardTitle>
          </div>
          <CardDescription>Used to surface rides near you.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="City" htmlFor="city" error={fieldError("city")}>
            <LocationAutocomplete
              id="city"
              name="city"
              types="place"
              countryCode="IN"
              placeholder="e.g. Pune"
              value={formik.values.city}
              onChange={(value) => formik.setFieldValue("city", value)}
              onBlur={() => formik.setFieldTouched("city", true)}
            />
          </Field>
          <Field label="Country" htmlFor="country" error={fieldError("country")}>
            <LocationAutocomplete
              id="country"
              name="country"
              types="country"
              placeholder="e.g. United States"
              value={formik.values.country}
              onChange={(value) => formik.setFieldValue("country", value)}
              onBlur={() => formik.setFieldTouched("country", true)}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PenLine className="text-primary size-4" />
            <CardTitle>About you</CardTitle>
          </div>
          <CardDescription>Optional, but it helps riders get to know you.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field label="Bio" htmlFor="bio" error={fieldError("bio")}>
            <Textarea
              id="bio"
              name="bio"
              rows={4}
              value={formik.values.bio ?? ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Field>
          <Field label="Instagram" htmlFor="instagramHandle" error={fieldError("instagramHandle")}>
            <Input
              id="instagramHandle"
              name="instagramHandle"
              value={formik.values.instagramHandle ?? ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Field>
        </CardContent>
      </Card>

      {formError && <p className="text-destructive text-sm">{formError}</p>}

      <Button type="submit" disabled={isPending} size="lg" className="self-start">
        {isPending ? "Saving..." : mode === "create" ? "Complete profile" : "Save changes"}
      </Button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
