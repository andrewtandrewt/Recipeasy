'use client'

import { useState, useEffect, useMemo } from 'react'
import { Navigation } from '../components/navigation'
import { RecipeCard } from '../components/recipe-card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent } from '../components/ui/card'
import { Search, Plus } from 'lucide-react'
import Link from 'next/link'

interface Recipe {
  id: string
  title: string
  description?: string
  imageUrl?: string
  cookingTime?: number
  servings?: number
  difficulty?: string
  cuisine?: string
  sourceUrl?: string
  sourceType?: string
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({ cuisine: '', difficulty: '' })

  useEffect(() => {
    const loadRecipes = async () => {
      setLoading(true)
      try {
        const response = await fetch('http://localhost:3002/api/recipes')
        if (response.ok) {
          const data = await response.json()
          setRecipes(Array.isArray(data) ? data : [])
        } else {
          console.error('Failed to fetch recipes')
        }
      } catch (err) {
        console.error('Error fetching recipes:', err)
      } finally {
        setLoading(false)
      }
    }

    loadRecipes()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const filteredRecipes = useMemo(() => {
    const search = searchQuery.trim().toLowerCase()

    return recipes.filter((recipe) => {
      const matchesSearch =
        !search ||
        recipe.title.toLowerCase().includes(search) ||
        (recipe.description?.toLowerCase().includes(search) ?? false)

      const matchesCuisine =
        !filters.cuisine || recipe.cuisine?.toLowerCase() === filters.cuisine.toLowerCase()

      const matchesDifficulty =
        !filters.difficulty || recipe.difficulty?.toLowerCase() === filters.difficulty.toLowerCase()

      return matchesSearch && matchesCuisine && matchesDifficulty
    })
  }, [recipes, searchQuery, filters])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">All Recipes</h1>
            <p className="text-muted-foreground">
              Discover amazing recipes from around the world
            </p>
          </div>
          <Link href="/add-recipe">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Recipe
            </Button>
          </Link>
        </div>

        {/* Search & Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search recipes, ingredients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">Search</Button>
              </div>

              <div className="flex flex-wrap gap-4">
                <select
                  value={filters.cuisine}
                  onChange={(e) => setFilters(prev => ({ ...prev, cuisine: e.target.value }))}
                  className="px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">All Cuisines</option>
                  <option value="Italian">Italian</option>
                  <option value="Mexican">Mexican</option>
                  <option value="Asian">Asian</option>
                  <option value="American">American</option>
                  <option value="French">French</option>
                  <option value="Indian">Indian</option>
                </select>

                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFilters({ cuisine: '', difficulty: '' })}
                >
                  Clear Filters
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Recipes Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Card key={idx} className="animate-pulse">
                <div className="aspect-[4/3] bg-muted rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRecipes.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onSave={() => {}}
                  onUnsave={() => {}}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-4">No recipes found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or filters
            </p>
            <Link href="/add-recipe">
              <Button>Import Your First Recipe</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
