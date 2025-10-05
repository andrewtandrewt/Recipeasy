"use client";
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import RecipeImportForm from '../components/RecipeImportForm';
import { ImportedRecipe } from '../lib/types'
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle , CardDescription} from '../components/ui/card'
import { ArrowLeft, CheckCircle } from 'lucide-react'


export default function AddRecipe() {
  const router = useRouter()
  const [importedRecipe, setImportedRecipe] = useState<ImportedRecipe | null>(null)
  const [saving, setSaving] = useState(false)

    const handleImport = (recipe: ImportedRecipe) => {
    setImportedRecipe(recipe)
  }

  const handleSave = async () => {
    if (!importedRecipe) return

    setSaving(true)
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeData: importedRecipe })
      })

      if (response.ok) {
        const savedRecipe = await response.json()
        router.push(`/recipes/${savedRecipe.id}`)
      } else {
        console.error('Failed to save recipe')
      }
    } catch (error) {
      console.error('Error saving recipe:', error)
    } finally {
      setSaving(false)
    }
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Add a New Recipe</h1>
      <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Import Recipe</h1>
            <p className="text-muted-foreground">
              Import recipes from TikTok, YouTube, or any website. Our AI will extract the ingredients and steps for you.
            </p>
          </div>

          {!importedRecipe ? (
            <RecipeImportForm onImport={handleImport} />
          ) : (
            <div className="space-y-6">
              {/* Success Message */}
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Recipe imported successfully!</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recipe Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Recipe Preview</CardTitle>
                  <CardDescription>
                    Review the imported recipe before saving it to your collection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{importedRecipe.title}</h3>
                    {importedRecipe.description && (
                      <p className="text-muted-foreground">{importedRecipe.description}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Ingredients */}
                    <div>
                      <h4 className="font-semibold mb-3">Ingredients</h4>
                      <ul className="space-y-1">
                        {importedRecipe.ingredients.map((ingredient, index) => (
                          <li key={index} className="text-sm">
                            {ingredient.amount && `${ingredient.amount} `}
                            {ingredient.unit && `${ingredient.unit} `}
                            {ingredient.name}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Steps */}
                    <div>
                      <h4 className="font-semibold mb-3">Instructions</h4>
                      <ol className="space-y-2">
                        {importedRecipe.steps.map((step, index) => (
                          <li key={index} className="text-sm">
                            <span className="font-medium">{step.order}.</span> {step.instruction}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Recipe Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {importedRecipe.cookingTime && (
                      <span>Cooking time: {importedRecipe.cookingTime} minutes</span>
                    )}
                    {importedRecipe.servings && (
                      <span>Servings: {importedRecipe.servings}</span>
                    )}
                    {importedRecipe.difficulty && (
                      <span>Difficulty: {importedRecipe.difficulty}</span>
                    )}
                    {importedRecipe.cuisine && (
                      <span>Cuisine: {importedRecipe.cuisine}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button onClick={handleSave} disabled={saving} className="flex-1">
                      {saving ? 'Saving...' : 'Save Recipe'}
                    </Button>
                    <Button 
                      className="border border-gray-300 bg-white text-gray-800 hover:bg-gray-100"
                      onClick={() => setImportedRecipe(null)}
                    >
                      Import Another
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
    </div>
  );
}
