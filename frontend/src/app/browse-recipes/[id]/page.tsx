'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Navigation } from '../../components/navigation'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Clock, Users, ChefHat, ArrowLeft } from 'lucide-react'
import { formatTime, formatServings, isValidUrl } from '../../lib/utils'

interface Ingredient {
  name: string
  amount?: string
  unit?: string
}

interface Step {
  order: number
  instruction: string
}

interface Recipe {
  id: string
  title: string
  description?: string
  ingredients: Ingredient[]
  steps: Step[]
  cookingTime?: number
  servings?: number
  difficulty?: string
  cuisine?: string
  imageUrl?: string
  sourceUrl?: string
  sourceType?: string
}

export default function RecipeDetail() {
  const params = useParams()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const recipeId = Array.isArray(params.id) ? params.id[0] : params.id
    if (!recipeId) {
      setLoading(false)
      return
    }

    const fetchRecipe = async () => {
      try {
        const response = await fetch(`http://localhost:3002/api/recipes/${recipeId}`)
        if (response.ok) {
          const data = await response.json()
          setRecipe(data)
        } else {
          console.error('Failed to load recipe detail')
        }
      } catch (error) {
        console.error('Error fetching recipe:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-muted rounded mb-6"></div>
            <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Recipe not found</h1>
          <Link href="/browse-recipes">
            <Button>Back to Recipes</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <Link
          href="/browse-recipes"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Recipes
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <header className="space-y-4">
              <h1 className="text-3xl font-bold">{recipe.title}</h1>
              {recipe.description && (
                <p className="text-lg text-muted-foreground">{recipe.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {recipe.cookingTime && (
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatTime(recipe.cookingTime)}
                  </span>
                )}
                {recipe.servings && (
                  <span className="inline-flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {formatServings(recipe.servings)}
                  </span>
                )}
                {recipe.difficulty && (
                  <span className="inline-flex items-center gap-2">
                    <ChefHat className="h-4 w-4" />
                    {recipe.difficulty}
                  </span>
                )}
                {recipe.cuisine && (
                  <span className="inline-flex items-center gap-2">
                    <ChefHat className="h-4 w-4" />
                    {recipe.cuisine}
                  </span>
                )}
              </div>
            </header>

            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>
                        {ingredient.amount && `${ingredient.amount} `}
                        {ingredient.unit && `${ingredient.unit} `}
                        {ingredient.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {recipe.steps
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((step, index) => (
                      <li key={index} className="flex gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {step.order}
                        </div>
                        <p className="text-sm text-muted-foreground">{step.instruction}</p>
                      </li>
                    ))}
                </ol>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recipe Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {recipe.cookingTime && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span>{formatTime(recipe.cookingTime)}</span>
                  </div>
                )}
                {recipe.servings && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>{formatServings(recipe.servings)}</span>
                  </div>
                )}
                {recipe.difficulty && (
                  <div className="flex items-center gap-3">
                    <ChefHat className="h-5 w-5 text-muted-foreground" />
                    <span className="capitalize">{recipe.difficulty}</span>
                  </div>
                )}
                {recipe.cuisine && (
                  <div className="flex items-center gap-3">
                    <ChefHat className="h-5 w-5 text-muted-foreground" />
                    <span>{recipe.cuisine}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Source</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {recipe.sourceUrl && isValidUrl(recipe.sourceUrl) ? (
                  <a
                    href={recipe.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View original recipe
                  </a>
                ) : (
                  <p className="text-muted-foreground">No source link provided</p>
                )}

                {recipe.sourceType && (
                  <p className="text-muted-foreground">
                    Source type: <span className="capitalize">{recipe.sourceType}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
