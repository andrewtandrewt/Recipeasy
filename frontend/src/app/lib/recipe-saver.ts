  
  import axios from 'axios'
  import { ImportedRecipe } from './types'
  
  export class RecipeSaver {
  static async saveRecipeToBackend(recipe: ImportedRecipe): Promise<{ id: string } | null> {
    try {
      const response = await axios.post('http://localhost:3002/api/recipes', {
        recipeData: recipe,
        userId: "public" // no authentication
      });

      if (response.status === 201) {
        return response.data; // returns { id: "..." }
      } else {
        console.error('Failed to save recipe:', response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      return null;
    }
  }

  static async getAllRecipes(): Promise<ImportedRecipe[]> {
    try {
      const response = await axios.get('http://localhost:3002/api/recipes');
      return response.data;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return [];
    }
  }
}