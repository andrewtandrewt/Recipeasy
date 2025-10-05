"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Heart, Clock, Users, ChefHat } from 'lucide-react'
import { formatTime, formatServings } from '../lib/utils'

interface RecipeCardProps {
  recipe: {
    id: string
    title: string
    description?: string
    imageUrl?: string
    cookingTime?: number
    servings?: number
    difficulty?: string
    cuisine?: string
    tags?: Array<
      | string
      | { name: string }
      | { tag?: { name: string } }
    >
  }
  isSaved?: boolean
  onSave?: (recipeId: string) => void
  onUnsave?: (recipeId: string) => void
}

export function RecipeCard({ recipe, isSaved = false, onSave, onUnsave }: RecipeCardProps) {
  const handleSaveClick = () => {
    if (isSaved && onUnsave) {
      onUnsave(recipe.id)
    } else if (!isSaved && onSave) {
      onSave(recipe.id)
    }
  }

  return (
    <Card className="group overflow-hidden transition-all duration-200 hover:shadow-lg">
      <Link href={`/browse-recipes/${recipe.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <ChefHat className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
      </Link>
      
      <CardHeader className="pb-2">
        <Link href={`/browse-recipes/${recipe.id}`}>
          <h3 className="line-clamp-2 text-lg font-semibold hover:text-primary transition-colors">
            {recipe.title}
          </h3>
        </Link>
        {recipe.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {recipe.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-3">
          {recipe.cookingTime && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatTime(recipe.cookingTime)}
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {formatServings(recipe.servings)}
            </div>
          )}
          {recipe.difficulty && (
            <span className="text-xs px-2 py-1 bg-secondary rounded-full">
              {recipe.difficulty}
            </span>
          )}
        </div>

        {recipe.cuisine && (
          <p className="text-xs text-muted-foreground mb-2">
            {recipe.cuisine} cuisine
          </p>
        )}

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag, index) => {
              const tagName = typeof tag === 'string'
                ? tag
                : tag?.tag?.name ?? (tag as { name?: string }).name

              if (!tagName) return null

              return (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                >
                  {tagName}
                </span>
              )
            })}
            {recipe.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{recipe.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          onClick={handleSaveClick}
          className="w-full justify-center gap-2 "
        >
          <Heart 
            className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} 
          />
          {isSaved ? 'Saved' : 'Save Recipe'}
        </Button>
      </CardFooter>
    </Card>
  )
}
