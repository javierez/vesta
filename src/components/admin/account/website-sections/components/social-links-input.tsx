"use client";

import { useState } from "react";
import { Facebook, Instagram, Linkedin, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import type { SocialLinksInputProps } from "../../types/website-sections";

export function SocialLinksInput({ form }: SocialLinksInputProps) {
  // PRESERVE dynamic show/hide logic for each social platform
  const [showSocialInputs, setShowSocialInputs] = useState({
    facebook: false,
    instagram: false,
    linkedin: false,
    twitter: false,
    youtube: false,
  });

  return (
    <div className="space-y-4">
      {/* Social Platform Icons - PRESERVE existing show/hide functionality */}
      <div className="flex items-center gap-4">
        {/* Facebook */}
        <div>
          {form.watch("socialLinks.facebook") ? (
            <div className="relative inline-block group">
              <div className="flex items-center justify-center w-12 h-12 border rounded-lg bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors">
                <Facebook className="h-5 w-5 text-gray-600" />
              </div>
              <button
                type="button"
                onClick={() => setShowSocialInputs(prev => ({ ...prev, facebook: true }))}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg"
              >
                <RefreshCw className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSocialInputs(prev => ({ ...prev, facebook: true }))}
              className="flex items-center justify-center w-12 h-12 p-0"
            >
              <Facebook className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Instagram */}
        <div>
          {form.watch("socialLinks.instagram") ? (
            <div className="relative inline-block group">
              <div className="flex items-center justify-center w-12 h-12 border rounded-lg bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors">
                <Instagram className="h-5 w-5 text-gray-600" />
              </div>
              <button
                type="button"
                onClick={() => setShowSocialInputs(prev => ({ ...prev, instagram: true }))}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg"
              >
                <RefreshCw className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSocialInputs(prev => ({ ...prev, instagram: true }))}
              className="flex items-center justify-center w-12 h-12 p-0"
            >
              <Instagram className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* LinkedIn */}
        <div>
          {form.watch("socialLinks.linkedin") ? (
            <div className="relative inline-block group">
              <div className="flex items-center justify-center w-12 h-12 border rounded-lg bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors">
                <Linkedin className="h-5 w-5 text-gray-600" />
              </div>
              <button
                type="button"
                onClick={() => setShowSocialInputs(prev => ({ ...prev, linkedin: true }))}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg"
              >
                <RefreshCw className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSocialInputs(prev => ({ ...prev, linkedin: true }))}
              className="flex items-center justify-center w-12 h-12 p-0"
            >
              <Linkedin className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Dynamic Input Fields - PRESERVE individual platform visibility toggles */}
      {(showSocialInputs.facebook || showSocialInputs.instagram || showSocialInputs.linkedin) && (
        <div className="space-y-4 pt-2">
          {/* Facebook Input */}
          {showSocialInputs.facebook && (
            <FormField
              control={form.control}
              name="socialLinks.facebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://facebook.com/miempresa" />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSocialInputs(prev => ({ ...prev, facebook: false }))}
                    className="mt-2"
                  >
                    Ocultar
                  </Button>
                </FormItem>
              )}
            />
          )}

          {/* Instagram Input */}
          {showSocialInputs.instagram && (
            <FormField
              control={form.control}
              name="socialLinks.instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://instagram.com/miempresa" />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSocialInputs(prev => ({ ...prev, instagram: false }))}
                    className="mt-2"
                  >
                    Ocultar
                  </Button>
                </FormItem>
              )}
            />
          )}

          {/* LinkedIn Input */}
          {showSocialInputs.linkedin && (
            <FormField
              control={form.control}
              name="socialLinks.linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://linkedin.com/company/miempresa" />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSocialInputs(prev => ({ ...prev, linkedin: false }))}
                    className="mt-2"
                  >
                    Ocultar
                  </Button>
                </FormItem>
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}