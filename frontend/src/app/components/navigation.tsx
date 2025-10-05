'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Search, Plus, User, LogOut, LogIn } from 'lucide-react'
import { useState } from 'react'

export function Navigation() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">R</span>
            </div>
            <span className="font-bold text-xl">RecipeApp</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search recipes, ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link href="/recipes">
              <Button>
                Browse Recipes
              </Button>
            </Link>

            {session ? (
              <>
                <Link href="/recipes/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Recipe
                  </Button>
                </Link>
                
                <Link href="/saved">
                  <Button>
                    Saved
                  </Button>
                </Link>

                <div className="flex items-center space-x-2">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <User className="h-8 w-8 rounded-full bg-muted p-1" />
                  )}
                  <Button
                    onClick={() => signOut()}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <Button
                onClick={() => signIn()}
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
