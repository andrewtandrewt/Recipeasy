'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '../components/navigation'
import { RecipeCard } from '../components/recipe-card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent } from '../components/ui/card'
import { Search, Filter, Plus } from 'lucide-react'
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
  tags: Array<{ tag: { name: string } }>
  categories: Array<{ category: { name: string } }>
  savedBy: Array<{ id: string }>
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    cuisine: '',
    difficulty: '',
    tags: ''
  })
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchRecipes()
  }, [page, searchQuery, filters])

  const fetchRecipes = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(searchQuery && { search: searchQuery }),
        ...(filters.cuisine && { cuisine: filters.cuisine }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        ...(filters.tags && { tags: filters.tags })
      })

      const response = await fetch(`/api/recipes?${params}`)
      if (response.ok) {
        const data = await response.json()
        if (page === 1) {
          setRecipes(data.recipes)
        } else {
          setRecipes(prev => [...prev, ...data.recipes])
        }
        setHasMore(data.pagination.page < data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchRecipes()
  }

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
  }

  const handleSave = async (recipeId: string) => {
    try {
      await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId })
      })
      
      setRecipes(prev => prev.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, savedBy: [...recipe.savedBy, { id: 'temp' }] }
          : recipe
      ))
    } catch (error) {
      console.error('Error saving recipe:', error)
    }
  }

  const handleUnsave = async (recipeId: string) => {
    try {
      await fetch('/api/saved', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId })
      })
      
      setRecipes(prev => prev.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, savedBy: recipe.savedBy.filter(saved => saved.id !== 'temp') }
          : recipe
      ))
    } catch (error) {
      console.error('Error unsaving recipe:', error)
    }
  }

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

        {/* Search and Filters */}
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
                  variant="outline"
                  onClick={() => setFilters({ cuisine: '', difficulty: '', tags: '' })}
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
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="aspect-[4/3] bg-muted rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isSaved={recipe.savedBy.length > 0}
                  onSave={handleSave}
                  onUnsave={handleUnsave}
                />
              ))}
            </div>

            {hasMore && (
              <div className="text-center">
                <Button onClick={handleLoadMore} variant="outline">
                  Load More Recipes
                </Button>
              </div>
            )}
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
