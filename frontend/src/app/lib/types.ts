export interface ImportedRecipe {
  title: string
  description?: string
  ingredients: Array<{ name: string; amount?: string; unit?: string }>
  steps: Array<{ order: number; instruction: string }>
  cookingTime?: number
  servings?: number
  difficulty?: string
  cuisine?: string
  imageUrl?: string
  sourceUrl: string
  sourceType: 'tiktok' | 'youtube' | 'text' | 'manual'
}
