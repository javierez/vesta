"use client";

import { useState } from "react";
import { useSession } from "~/lib/auth-client";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Form } from "~/components/ui/form";
import { Loader2 } from "lucide-react";

// Custom hooks
import { useWebsiteForm } from "./hooks/use-website-form";
import { useWebsiteSave } from "./hooks/use-website-save";

// Core components
import { WebsiteSidebar } from "./website-sidebar";
import { WebsiteSaveButton } from "./website-save-button";

// Section components
import { SEOSection } from "./website-sections/seo-section";
import { BrandingSection } from "./website-sections/branding-section";
import { HeroSection } from "./website-sections/hero-section";
import { FeaturedSection } from "./website-sections/featured-section";
import { AboutSection } from "./website-sections/about-section";
import { PropertiesSection } from "./website-sections/properties-section";
import { TestimonialsSection } from "./website-sections/testimonials-section";
import { ContactSection } from "./website-sections/contact-section";
import { FooterSection } from "./website-sections/footer-section";
import { SocialSection } from "./website-sections/social-section";
import { HeadSection } from "./website-sections/head-section";
import { MetaSection } from "./website-sections/meta-section";
import { WatermarkSection } from "./website-sections/watermark-section";

export function WebsiteConfiguration() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState("seo");

  // Use custom hooks for form and save operations
  const {
    form,
    loading,
    error: formError,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    accountId,
  } = useWebsiteForm(session?.user?.id);

  const {
    isPending,
    error: saveError,
    saveAll,
  } = useWebsiteSave(form, accountId, () => setHasUnsavedChanges(false));

  // Combined error state
  const error = formError ?? saveError;

  // Handle save action
  const handleSave = async () => {
    await saveAll(activeSection);
  };

  // Handle unsaved changes from sections
  const handleUnsavedChanges = (hasChanges: boolean) => {
    setHasUnsavedChanges(hasChanges);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-[700px] items-center justify-center rounded-2xl bg-white shadow-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando configuración...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (formError && !accountId) {
    return (
      <Alert variant="destructive" className="mx-4 my-4">
        <AlertDescription>Error al cargar la configuración</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative flex h-auto flex-col overflow-hidden rounded-2xl bg-white shadow-sm lg:h-[700px] lg:flex-row">
      {/* Sidebar Navigation */}
      <WebsiteSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Save Button - Desktop only */}
      <div className="absolute bottom-4 right-4 z-10 hidden lg:block">
        <WebsiteSaveButton
          onSave={handleSave}
          isPending={isPending}
          hasUnsavedChanges={hasUnsavedChanges}
          error={error}
        />
      </div>

      {/* Main Content */}
      <div className="relative flex-1 overflow-y-auto">
        <Form {...form}>
          <form className="p-4 pb-16 lg:p-8 lg:pb-8">
            {/* Section Components */}
            <SEOSection
              form={form}
              isActive={activeSection === "seo"}
              onUnsavedChanges={handleUnsavedChanges}
            />

            <BrandingSection
              form={form}
              isActive={activeSection === "branding"}
              onUnsavedChanges={handleUnsavedChanges}
            />

            <WatermarkSection
              form={form}
              isActive={activeSection === "watermark"}
              onUnsavedChanges={handleUnsavedChanges}
            />

            <SocialSection
              form={form}
              isActive={activeSection === "social"}
              onUnsavedChanges={handleUnsavedChanges}
            />

            <HeroSection
              form={form}
              isActive={activeSection === "hero"}
              onUnsavedChanges={handleUnsavedChanges}
            />

            <FeaturedSection
              form={form}
              isActive={activeSection === "featured"}
              onUnsavedChanges={handleUnsavedChanges}
            />

            <AboutSection
              form={form}
              isActive={activeSection === "about"}
              onUnsavedChanges={handleUnsavedChanges}
            />

            <PropertiesSection
              form={form}
              isActive={activeSection === "properties"}
              onUnsavedChanges={handleUnsavedChanges}
            />

            <TestimonialsSection
              form={form}
              isActive={activeSection === "testimonials"}
              onUnsavedChanges={handleUnsavedChanges}
              accountId={accountId}
            />

            <ContactSection
              form={form}
              isActive={activeSection === "contact"}
              onUnsavedChanges={handleUnsavedChanges}
              accountId={accountId}
            />

            <FooterSection
              form={form}
              isActive={activeSection === "footer"}
              onUnsavedChanges={handleUnsavedChanges}
            />

            <HeadSection
              form={form}
              isActive={activeSection === "head"}
              onUnsavedChanges={handleUnsavedChanges}
            />

            <MetaSection
              form={form}
              isActive={activeSection === "meta"}
              onUnsavedChanges={handleUnsavedChanges}
            />

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Save Button for Mobile - at bottom of form */}
            <div className="mt-8 flex justify-end lg:hidden">
              <WebsiteSaveButton
                onSave={handleSave}
                isPending={isPending}
                hasUnsavedChanges={hasUnsavedChanges}
                error={error}
                className="relative"
              />
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
