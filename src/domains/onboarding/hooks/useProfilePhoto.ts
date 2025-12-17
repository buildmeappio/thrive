"use client";
import { useState, useEffect } from "react";
import { getProfilePhotoUrlAction } from "@/server/actions/getProfilePhotoUrl";

interface UseProfilePhotoOptions {
  profilePhotoId?: string | null;
}

/**
 * Hook for managing profile photo state and loading
 */
export function useProfilePhoto({ profilePhotoId }: UseProfilePhotoOptions) {
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);

  // Load profile photo URL when profilePhotoId changes
  useEffect(() => {
    const loadProfilePhoto = async () => {
      if (profilePhotoId && profilePhotoId.trim() !== "") {
        try {
          const photoUrl = await getProfilePhotoUrlAction(profilePhotoId);
          if (photoUrl) {
            setProfilePhotoUrl(photoUrl);
          } else {
            setProfilePhotoUrl(null);
          }
        } catch (error) {
          console.error("Failed to fetch profile photo URL:", error);
          setProfilePhotoUrl(null);
        }
      } else {
        // Only clear if we don't have a local photo file either
        if (!profilePhoto) {
          setProfilePhotoUrl(null);
        }
      }
    };

    void loadProfilePhoto();
  }, [profilePhotoId, profilePhoto]);

  const handlePhotoChange = (file: File | null) => {
    setProfilePhoto(file);
  };

  const clearProfilePhoto = () => {
    setProfilePhoto(null);
  };

  return {
    profilePhoto,
    profilePhotoUrl,
    setProfilePhotoUrl,
    handlePhotoChange,
    clearProfilePhoto,
  };
}
