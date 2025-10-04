"use client";
import RecipeImportForm from '../components/RecipeImportForm';

export default function AddRecipe() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Add a New Recipe</h1>
      <RecipeImportForm />
    </div>
  );
}
