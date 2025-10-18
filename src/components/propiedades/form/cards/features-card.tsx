
import React from "react";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/lib/utils";
import { ChevronDown } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { ModernSaveIndicator } from "../common/modern-save-indicator";
import type { PropertyListing } from "~/types/property-listing";
import type { SaveState } from "~/types/save-state";

interface FeaturesCardProps {
  listing: PropertyListing;
  propertyType: string;
  hasElevator: boolean;
  isFurnished: boolean;
  furnitureQuality: string;
  isHeating: boolean;
  heatingType: string;
  isHotWater: boolean;
  hotWaterType: string;
  isAirConditioning: boolean;
  airConditioningType: string;
  hasGarage: boolean;
  garageType: string;
  garageSpaces: number;
  garageInBuilding: boolean;
  garageNumber: string;
  hasStorageRoom: boolean;
  storageRoomSize: number;
  storageRoomNumber: string;
  optionalGaragePrice: number;
  optionalStorageRoomPrice: number;
  oven: boolean;
  microwave: boolean;
  washingMachine: boolean;
  fridge: boolean;
  tv: boolean;
  stoneware: boolean;
  collapsedSections: Record<string, boolean>;
  saveState: SaveState;
  onToggleSection: (section: string) => void;
  onSave: () => Promise<void>;
  onUpdateModule: (hasChanges: boolean) => void;
  setHasElevator: (value: boolean) => void;
  setIsFurnished: (value: boolean) => void;
  setFurnitureQuality: (value: string) => void;
  setIsHeating: (value: boolean) => void;
  setHeatingType: (value: string) => void;
  setIsHotWater: (value: boolean) => void;
  setHotWaterType: (value: string) => void;
  setIsAirConditioning: (value: boolean) => void;
  setAirConditioningType: (value: string) => void;
  setHasGarage: (value: boolean) => void;
  setGarageType: (value: string) => void;
  setGarageSpaces: (value: number) => void;
  setGarageInBuilding: (value: boolean) => void;
  setGarageNumber: (value: string) => void;
  setHasStorageRoom: (value: boolean) => void;
  setStorageRoomSize: (value: number) => void;
  setStorageRoomNumber: (value: string) => void;
  setOptionalGaragePrice: (value: number) => void;
  setOptionalStorageRoomPrice: (value: number) => void;
  setOven: (value: boolean) => void;
  setMicrowave: (value: boolean) => void;
  setWashingMachine: (value: boolean) => void;
  setFridge: (value: boolean) => void;
  setTv: (value: boolean) => void;
  setStoneware: (value: boolean) => void;
  getCardStyles: (moduleName: "features") => string;
}

export function FeaturesCard({
  listing: _listing,
  propertyType,
  hasElevator,
  isFurnished,
  furnitureQuality,
  isHeating,
  heatingType,
  isHotWater,
  hotWaterType,
  isAirConditioning,
  airConditioningType,
  hasGarage,
  garageType,
  garageSpaces,
  garageInBuilding,
  garageNumber,
  hasStorageRoom,
  storageRoomSize,
  storageRoomNumber,
  optionalGaragePrice,
  optionalStorageRoomPrice,
  oven,
  microwave,
  washingMachine,
  fridge,
  tv,
  stoneware,
  collapsedSections,
  saveState,
  onToggleSection,
  onSave,
  onUpdateModule,
  setHasElevator,
  setIsFurnished,
  setFurnitureQuality,
  setIsHeating,
  setHeatingType,
  setIsHotWater,
  setHotWaterType,
  setIsAirConditioning,
  setAirConditioningType,
  setHasGarage,
  setGarageType,
  setGarageSpaces,
  setGarageInBuilding,
  setGarageNumber,
  setHasStorageRoom,
  setStorageRoomSize,
  setStorageRoomNumber,
  setOptionalGaragePrice,
  setOptionalStorageRoomPrice,
  setOven,
  setMicrowave,
  setWashingMachine,
  setFridge,
  setTv,
  setStoneware,
  getCardStyles,
}: FeaturesCardProps) {
  const heatingOptions = [
    { value: "Gas natural", label: "Gas natural" },
    { value: "Eléctrico", label: "Eléctrico" },
    { value: "Gasóleo", label: "Gasóleo" },
    { value: "Butano", label: "Butano" },
    { value: "Propano", label: "Propano" },
    { value: "Solar", label: "Solar" },
  ];

  return (
    <Card
      className={cn(
        "relative p-4 transition-all duration-500 ease-out",
        getCardStyles("features"),
      )}
    >
      <ModernSaveIndicator
        state={saveState}
        onSave={onSave}
      />
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onToggleSection("features")}
          className="group flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
              EQUIPAMIENTO Y SUMINISTROS
            </h3>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              collapsedSections.features && "rotate-180",
            )}
          />
        </button>
      </div>
      <div
        className={cn(
          "space-y-3 overflow-hidden transition-all duration-200",
          collapsedSections.features ? "max-h-0" : "max-h-[5000px]",
        )}
      >
        {propertyType === "solar" && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.44-.896-6-2.364M3 15.364C4.56 14.896 6.66 14 9 14s4.44.896 6 2.364" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              No aplicable para solares
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Los equipamientos y servicios no se aplican a este tipo de propiedad
            </p>
          </div>
        )}
        {propertyType !== "solar" && (
          <>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasElevator"
                checked={hasElevator}
                onCheckedChange={(checked) => {
                  setHasElevator(checked as boolean);
                  onUpdateModule(true);
                }}
              />
              <Label htmlFor="hasElevator" className="text-sm">
                Ascensor
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasGarage"
                checked={hasGarage}
                onCheckedChange={(checked) => {
                  setHasGarage(checked as boolean);
                  if (!checked) {
                    setGarageType("");
                    setGarageSpaces(1);
                    setGarageInBuilding(false);
                    setGarageNumber("");
                  }
                  onUpdateModule(true);
                }}
              />
              <Label htmlFor="hasGarage" className="text-sm">
                Garaje
              </Label>
            </div>
            {hasGarage && (
              <div className="ml-6 mt-1 space-y-2 border-l-2 pl-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="garageType" className="text-xs">
                      Tipo
                    </Label>
                    <Select value={garageType} onValueChange={setGarageType}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="abierto">Abierto</SelectItem>
                        <SelectItem value="cerrado">Cerrado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="garageSpaces" className="text-xs">
                      Plazas
                    </Label>
                    <Input
                      id="garageSpaces"
                      type="number"
                      value={garageSpaces}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        setGarageSpaces(value);
                        onUpdateModule(true);
                      }}
                      className="h-7 text-xs"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="flex items-center space-x-1">
                    <Checkbox
                      id="garageInBuilding"
                      checked={garageInBuilding}
                      onCheckedChange={(checked) => {
                        setGarageInBuilding(checked as boolean);
                        onUpdateModule(true);
                      }}
                      className="h-3 w-3"
                    />
                    <Label htmlFor="garageInBuilding" className="text-xs">
                      En edificio
                    </Label>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="garageNumber" className="text-xs">
                      Nº plaza
                    </Label>
                    <Input
                      id="garageNumber"
                      value={garageNumber}
                      onChange={(e) => {
                        setGarageNumber(e.target.value);
                        onUpdateModule(true);
                      }}
                      className="h-7 text-xs"
                      placeholder="A-123"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="optionalGaragePrice" className="text-xs">
                    Precio
                  </Label>
                  <Input
                    id="optionalGaragePrice"
                    type="number"
                    value={Math.round(optionalGaragePrice)}
                    onChange={(e) => {
                      const value = Math.round(Number(e.target.value)) || 0;
                      setOptionalGaragePrice(value);
                      onUpdateModule(true);
                    }}
                    className="h-7 text-xs"
                    min="0"
                    step="1"
                    placeholder="0"
                  />
                </div>
              </div>
            )}
            
            {/* Storage Room - only for non-garaje properties */}
            {propertyType !== "garaje" && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasStorageRoom"
                    checked={hasStorageRoom}
                    onCheckedChange={(checked) => {
                      setHasStorageRoom(checked as boolean);
                      if (!checked) {
                        setStorageRoomSize(0);
                        setStorageRoomNumber("");
                      }
                      onUpdateModule(true);
                    }}
                  />
                  <Label htmlFor="hasStorageRoom" className="text-sm">
                    Trastero
                  </Label>
                </div>
                {hasStorageRoom && (
                  <div className="ml-6 mt-1 space-y-2 border-l-2 pl-3">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor="storageRoomSize" className="text-xs">
                          Tamaño (m²)
                        </Label>
                        <Input
                          id="storageRoomSize"
                          type="number"
                          value={storageRoomSize}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            setStorageRoomSize(value);
                            onUpdateModule(true);
                          }}
                          className="h-7 text-xs"
                          min="0"
                          step="1"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="storageRoomNumber" className="text-xs">
                          Nº trastero
                        </Label>
                        <Input
                          id="storageRoomNumber"
                          value={storageRoomNumber}
                          onChange={(e) => {
                            setStorageRoomNumber(e.target.value);
                            onUpdateModule(true);
                          }}
                          className="h-7 text-xs"
                          placeholder="T-45"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="optionalStorageRoomPrice" className="text-xs">
                        Precio
                      </Label>
                      <Input
                        id="optionalStorageRoomPrice"
                        type="number"
                        value={Math.round(optionalStorageRoomPrice)}
                        onChange={(e) => {
                          const value = Math.round(Number(e.target.value)) || 0;
                          setOptionalStorageRoomPrice(value);
                          onUpdateModule(true);
                        }}
                        className="h-7 text-xs"
                        min="0"
                        step="1"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Heating, Hot Water, AC, Furniture - only for non-garaje properties */}
            {propertyType !== "garaje" && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasHeating"
                    checked={isHeating}
                    onCheckedChange={(checked) => {
                      setIsHeating(!!checked);
                      onUpdateModule(true);
                    }}
                  />
                  <Label htmlFor="hasHeating" className="text-sm">
                    Calefacción
                  </Label>
                </div>
                {isHeating && (
                  <div className="ml-6 mt-2">
                    <Select
                      value={heatingType}
                      onValueChange={(value) => {
                        setHeatingType(value);
                        onUpdateModule(true);
                      }}
                    >
                      <SelectTrigger className="mt-1 h-6 px-2 py-0 text-xs text-gray-500">
                        <SelectValue placeholder="Seleccionar tipo de calefacción" />
                      </SelectTrigger>
                      <SelectContent>
                        {heatingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasHotWater"
                    checked={isHotWater}
                    onCheckedChange={(checked) => {
                      setIsHotWater(!!checked);
                      if (!checked) {
                        setHotWaterType("");
                      }
                      onUpdateModule(true);
                    }}
                  />
                  <Label htmlFor="hasHotWater" className="text-sm">
                    Agua caliente
                  </Label>
                </div>
                {isHotWater && (
                  <div className="ml-6 mt-2">
                    <Select
                      value={hotWaterType}
                      onValueChange={(value) => {
                        setHotWaterType(value);
                        onUpdateModule(true);
                      }}
                    >
                      <SelectTrigger className="mt-1 h-6 px-2 py-0 text-xs text-gray-500">
                        <SelectValue placeholder="Seleccionar tipo de agua caliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {heatingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasAirConditioning"
                    checked={isAirConditioning}
                    onCheckedChange={(checked) => {
                      setIsAirConditioning(checked as boolean);
                      if (!checked) {
                        setAirConditioningType("");
                      }
                      onUpdateModule(true);
                    }}
                  />
                  <Label htmlFor="hasAirConditioning" className="text-sm">
                    Aire acondicionado
                  </Label>
                </div>
                {isAirConditioning && (
                  <div className="ml-6 mt-1">
                    <Select
                      value={airConditioningType}
                      onValueChange={(value) => {
                        setAirConditioningType(value);
                        onUpdateModule(true);
                      }}
                    >
                      <SelectTrigger className="mt-1 h-6 px-2 py-0 text-xs text-gray-500">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="central">Central</SelectItem>
                        <SelectItem value="split">Split</SelectItem>
                        <SelectItem value="portatil">Portátil</SelectItem>
                        <SelectItem value="conductos">Conductos</SelectItem>
                        <SelectItem value="cassette">Cassette</SelectItem>
                        <SelectItem value="ventana">Ventana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isFurnished"
                      checked={isFurnished}
                      onCheckedChange={(checked) => {
                        setIsFurnished(checked as boolean);
                        onUpdateModule(true);
                      }}
                    />
                    <Label htmlFor="isFurnished" className="text-sm">
                      Amueblado
                    </Label>
                  </div>
                  {isFurnished && (
                    <div className="ml-4">
                      <RadioGroup
                        value={furnitureQuality}
                        onValueChange={(value) => {
                          setFurnitureQuality(value);
                          onUpdateModule(true);
                        }}
                        className="flex flex-wrap gap-2"
                      >
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem
                            value="basic"
                            id="basic"
                            className="h-3 w-3 text-muted-foreground"
                          />
                          <Label
                            htmlFor="basic"
                            className="text-xs text-muted-foreground"
                          >
                            Básico
                          </Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem
                            value="standard"
                            id="standard"
                            className="h-3 w-3 text-muted-foreground"
                          />
                          <Label
                            htmlFor="standard"
                            className="text-xs text-muted-foreground"
                          >
                            Estándar
                          </Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem
                            value="high"
                            id="high"
                            className="h-3 w-3 text-muted-foreground"
                          />
                          <Label
                            htmlFor="high"
                            className="text-xs text-muted-foreground"
                          >
                            Alta
                          </Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem
                            value="luxury"
                            id="luxury"
                            className="h-3 w-3 text-muted-foreground"
                          />
                          <Label
                            htmlFor="luxury"
                            className="text-xs text-muted-foreground"
                          >
                            Lujo
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </div>

                {/* Appliances - only show when furnished */}
                {isFurnished && (
                  <div className="space-y-2 border-t border-border pt-3">
                    <h4 className="text-xs font-medium text-muted-foreground">
                      Electrodomésticos incluidos
                    </h4>
                    <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                      <div className="flex items-center space-x-1">
                        <Checkbox
                          id="oven"
                          checked={oven}
                          onCheckedChange={(checked) => {
                            setOven(checked as boolean);
                            onUpdateModule(true);
                          }}
                          className="no-checkmark h-3 w-3"
                        />
                        <Label htmlFor="oven" className="text-xs">
                          Horno
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Checkbox
                          id="microwave"
                          checked={microwave}
                          onCheckedChange={(checked) => {
                            setMicrowave(checked as boolean);
                            onUpdateModule(true);
                          }}
                          className="no-checkmark h-3 w-3"
                        />
                        <Label htmlFor="microwave" className="text-xs">
                          Microondas
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Checkbox
                          id="washingMachine"
                          checked={washingMachine}
                          onCheckedChange={(checked) => {
                            setWashingMachine(checked as boolean);
                            onUpdateModule(true);
                          }}
                          className="no-checkmark h-3 w-3"
                        />
                        <Label htmlFor="washingMachine" className="text-xs">
                          Lavadora
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Checkbox
                          id="fridge"
                          checked={fridge}
                          onCheckedChange={(checked) => {
                            setFridge(checked as boolean);
                            onUpdateModule(true);
                          }}
                          className="no-checkmark h-3 w-3"
                        />
                        <Label htmlFor="fridge" className="text-xs">
                          Frigorífico
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Checkbox
                          id="tv"
                          checked={tv}
                          onCheckedChange={(checked) => {
                            setTv(checked as boolean);
                            onUpdateModule(true);
                          }}
                          className="no-checkmark h-3 w-3"
                        />
                        <Label htmlFor="tv" className="text-xs">
                          Televisión
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Checkbox
                          id="stoneware"
                          checked={stoneware}
                          onCheckedChange={(checked) => {
                            setStoneware(checked as boolean);
                            onUpdateModule(true);
                          }}
                          className="no-checkmark h-3 w-3"
                        />
                        <Label htmlFor="stoneware" className="text-xs">
                          Lavavajillas
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Card>
  );
}