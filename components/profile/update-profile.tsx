"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchProfile,
  updateProfile,
  updateProfilePicture,
  UpdateProfileData,
} from "@/service/profile.service";
import { countries, states, cities } from "@/utils/locations";
import Image from "next/image";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(1, "Username is required"),
  mobile_number: z
    .string()
    .min(10, "Phone number should be of minimum 10 digits")
    .max(15, "Phone number should be of maximum 15 digits"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  address_line_1: z.string().min(1, "Address is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function UpdateProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [initialData, setInitialData] = useState<FormValues | null>(null);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [profilePicture, setProfilePicture] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "all",
    defaultValues: {
      name: "",
      email: "",
      username: "",
      mobile_number: "",
      country: "",
      state: "",
      city: "",
      address_line_1: "",
    },
  });

  const country = watch("country");
  const state = watch("state");

  useEffect(() => {
    if (country) {
      setSelectedCountry(country);
      setSelectedState("");
    }
  }, [country]);

  useEffect(() => {
    if (state) {
      setSelectedState(state);
    }
  }, [state]);

  // Fetch initial profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetchProfile();
        if (response.status && response.data) {
          setInitialData(response.data);
          setValue("name", response.data.name);
          setValue("email", response.data.email);
          setValue("username", response.data.username);
          setValue("mobile_number", response.data.mobile_number);
          setValue("country", response.data.country);
          setValue("state", response.data.state);
          setValue("city", response.data.city);
          setValue("address_line_1", response.data.address_line_1);
          setProfilePicture(response.data.profile_picture_url);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load profile data");
      }
    };

    loadProfile();
  }, [setValue]);

  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const response = await updateProfilePicture(file);
      if (response.status) {
        setProfilePicture(response.data.profile_picture_url);
        toast.success("Profile picture updated successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: any) => {
    try {
      setIsLoading(true);
      const response = await updateProfile(values);
      if (response.status) {
        toast.success(response.message);
        setInitialData(values);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-lg shadow-lg dark:shadow-white/10 p-6">
        {/* Profile Picture Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
                <Image
                  src={profilePicture || "/default-avatar.png"}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
              <label
                htmlFor="profile-picture"
                className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </label>
              <input
                id="profile-picture"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureChange}
                disabled={isUploading}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{initialData?.name}</h2>
              <p className="text-gray-600">{initialData?.email}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                placeholder="Enter your full name"
                {...register("name")}
                className={cn("", {
                  "border-destructive": errors.name,
                })}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className={cn("", {
                  "border-destructive": errors.email,
                })}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label>Username</Label>
              <Input
                placeholder="Choose a username"
                {...register("username")}
                className={cn("", {
                  "border-destructive": errors.username,
                })}
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-sm text-destructive mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <Label>WhatsApp Number</Label>
              <Input
                placeholder="Enter your WhatsApp number"
                {...register("mobile_number")}
                className={cn("", {
                  "border-destructive": errors.mobile_number,
                })}
                disabled={isLoading}
              />
              {errors.mobile_number && (
                <p className="text-sm text-destructive mt-1">
                  {errors.mobile_number.message}
                </p>
              )}
            </div>

            <div>
              <Label>Country</Label>
              <select
                {...register("country")}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  {
                    "border-destructive": errors.country,
                  }
                )}
                disabled={isLoading}
              >
                <option value="">Select country</option>
                {countries.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="text-sm text-destructive mt-1">
                  {errors.country.message}
                </p>
              )}
            </div>

            <div>
              <Label>State</Label>
              <select
                {...register("state")}
                disabled={!selectedCountry || isLoading}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  {
                    "border-destructive": errors.state,
                  }
                )}
              >
                <option value="">Select state</option>
                {selectedCountry &&
                  states[selectedCountry]?.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
              </select>
              {errors.state && (
                <p className="text-sm text-destructive mt-1">
                  {errors.state.message}
                </p>
              )}
            </div>

            <div>
              <Label>City</Label>
              <select
                {...register("city")}
                disabled={!selectedState || isLoading}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  {
                    "border-destructive": errors.city,
                  }
                )}
              >
                <option value="">Select city</option>
                {selectedState &&
                  cities[selectedState]?.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
              </select>
              {errors.city && (
                <p className="text-sm text-destructive mt-1">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label>Address Line 1</Label>
              <Input
                placeholder="Enter your address"
                {...register("address_line_1")}
                className={cn("", {
                  "border-destructive": errors.address_line_1,
                })}
                disabled={isLoading}
              />
              {errors.address_line_1 && (
                <p className="text-sm text-destructive mt-1">
                  {errors.address_line_1.message}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Profile"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
