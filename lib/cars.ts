import carsData from "@/data/cars.json";

export interface Car {
  id: string;
  make: string;
  model: string;
  variant: string;
  price_lakh: number;
  body_type: "hatchback" | "sedan" | "suv" | "mpv" | "coupe";
  fuel_type: "petrol" | "diesel" | "electric" | "hybrid" | "cng";
  transmission: "manual" | "automatic" | "amt";
  mileage_kmpl: number;
  engine_cc: number;
  seating: number;
  boot_space_l: number;
  ground_clearance_mm: number;
  safety_stars: number;
  use_case_tags: string[];
  pros: string[];
  cons: string[];
  tagline: string;
  image_placeholder: string;
}

export interface RecommendCarsInput {
  car_ids: string[];
  reasoning: string;
  comparisons: Array<{ car_id: string; why_this_one: string }>;
}

export const cars: Car[] = carsData as Car[];

export function getCarById(id: string): Car | undefined {
  return cars.find((c) => c.id === id);
}

export function getCarsById(ids: string[]): Car[] {
  return ids.map((id) => getCarById(id)).filter(Boolean) as Car[];
}
