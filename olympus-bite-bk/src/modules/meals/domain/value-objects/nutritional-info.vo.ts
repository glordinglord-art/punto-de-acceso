export class NutritionalInfo {
  calories: number;
  protein: number; // gramos
  carbs: number; // gramos
  fat: number; // gramos
  fiber: number; // gramos
  sugar: number; // gramos

  constructor(props: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
  }) {
    this.calories = props.calories;
    this.protein = props.protein;
    this.carbs = props.carbs;
    this.fat = props.fat;
    this.fiber = props.fiber ?? 0;
    this.sugar = props.sugar ?? 0;
  }

  getTotalMacros(): number {
    return this.protein + this.carbs + this.fat;
  }

  getProteinPercentage(): number {
    const total = this.getTotalMacros();
    return total > 0 ? (this.protein / total) * 100 : 0;
  }

  getCarbsPercentage(): number {
    const total = this.getTotalMacros();
    return total > 0 ? (this.carbs / total) * 100 : 0;
  }

  getFatPercentage(): number {
    const total = this.getTotalMacros();
    return total > 0 ? (this.fat / total) * 100 : 0;
  }
}
