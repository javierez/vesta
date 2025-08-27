"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import type { KPIConfigurationProps } from "../../types/website-sections";

export function KPIConfiguration({ form }: KPIConfigurationProps) {
  return (
    <div>
      {/* Show KPI Toggle */}
      <FormField
        control={form.control}
        name="aboutProps.showKPI"
        render={({ field }) => (
          <FormItem className="mb-4 flex items-center space-x-2">
            <FormControl>
              <input
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                className="rounded border-gray-300"
              />
            </FormControl>
            <FormLabel className="text-sm">Mostrar KPIs</FormLabel>
          </FormItem>
        )}
      />

      {/* KPI Fields - PRESERVE conditional display based on showKPI toggle */}
      {form.watch("aboutProps.showKPI") && (
        <div className="grid grid-cols-2 gap-4">
          {/* KPI 1 */}
          <FormField
            control={form.control}
            name="aboutProps.kpi1Name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>KPI 1 - Nombre</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Años de Experiencia" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="aboutProps.kpi1Data"
            render={({ field }) => (
              <FormItem>
                <FormLabel>KPI 1 - Valor</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="15+" />
                </FormControl>
              </FormItem>
            )}
          />

          {/* KPI 2 */}
          <FormField
            control={form.control}
            name="aboutProps.kpi2Name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>KPI 2 - Nombre</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Propiedades Vendidas" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="aboutProps.kpi2Data"
            render={({ field }) => (
              <FormItem>
                <FormLabel>KPI 2 - Valor</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="500+" />
                </FormControl>
              </FormItem>
            )}
          />

          {/* KPI 3 */}
          <FormField
            control={form.control}
            name="aboutProps.kpi3Name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>KPI 3 - Nombre</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Agentes Profesionales" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="aboutProps.kpi3Data"
            render={({ field }) => (
              <FormItem>
                <FormLabel>KPI 3 - Valor</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="50+" />
                </FormControl>
              </FormItem>
            )}
          />

          {/* KPI 4 */}
          <FormField
            control={form.control}
            name="aboutProps.kpi4Name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>KPI 4 - Nombre</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Clientes Satisfechos" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="aboutProps.kpi4Data"
            render={({ field }) => (
              <FormItem>
                <FormLabel>KPI 4 - Valor</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="98%" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}
