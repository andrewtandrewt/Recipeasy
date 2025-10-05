
'use client'

import Link from 'next/link'
import { Navigation } from './components/navigation'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { ArrowRight, BookOpen, Clock, Sparkles, UploadCloud, Users, Wand2 } from 'lucide-react'

const heroHighlights = [
  {
    title: 'Import Instantly',
    description: 'Drop in any recipe link and let our AI pull out the essentials in seconds.',
    icon: UploadCloud,
  },
  {
    title: 'Smart Summaries',
    description: 'See ingredients, steps, and tips neatly organized for quick cooking sessions.',
    icon: Wand2,
  },
  {
    title: 'Meal Inspiration',
    description: 'Browse curated collections personalized to what you already love.',
    icon: Sparkles,
  },
]

const howItWorks = [
  {
    step: '1. Paste a link',
    detail: 'Share a YouTube video, blog post, or type a recipe manually.',
  },
  {
    step: '2. Let AI extract',
    detail: 'We parse the source, structure the recipe, and clean up messy instructions.',
  },
  {
    step: '3. Save & cook',
    detail: 'Keep favorites organized, add notes, and open them on any device.',
  },
]

const communityStats = [
  { label: 'Recipes captured', value: '1,200+' },
  { label: 'Cooks collaborating', value: '8,500+' },
  { label: 'Minutes saved weekly', value: '12k+' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="container mx-auto px-4 py-16 space-y-24">
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Capture recipes from anywhere
            </span>

            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Your personal kitchen library, powered by AI
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Import recipes from the web, organize them beautifully, and discover new dishes tailored to your taste. Everything stays in sync across your devices so inspiration is always at your fingertips.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="gap-2 w-full sm:w-auto" style={{ width: '200px' ,    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'}}>
                <Link href="/add-recipe">
                  Start importing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/browse-recipes">Explore saved recipes</Link>
              </Button>
            </div>

            <dl className="grid gap-6 sm:grid-cols-3">
            </dl>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border bg-card p-8 shadow-xl">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
              <div className="space-y-6">
                <div className="rounded-2xl border bg-background/80 p-6 backdrop-blur">
                  <span className="text-sm font-medium text-primary">Featured recipe</span>
                  <h3 className="mt-2 text-2xl font-semibold">Spicy Garlic Noodle Bowl</h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Imported from a viral YouTube video in 12 seconds. Adjusted for serving size, prep time, and dietary preferences.
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-primary/5 p-4">
                      <p className="text-xs uppercase text-muted-foreground">Ingredients</p>
                      <p className="mt-2 text-sm font-medium">
                        Soba noodles, garlic chili crisp, sesame oil, scallions, soy sauce
                      </p>
                    </div>
                    <div className="rounded-lg bg-primary/5 p-4">
                      <p className="text-xs uppercase text-muted-foreground">Ready in</p>
                      <p className="mt-2 flex items-center gap-2 text-sm font-medium">
                        <Clock className="h-4 w-4 text-primary" />
                        20 minutes
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 rounded-2xl border bg-background/70 p-6 backdrop-blur">
                  {heroHighlights.map(({ title, description, icon: Icon }) => (
                    <div key={title} className="flex items-start gap-4">
                      <span className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h4 className="text-base font-semibold">{title}</h4>
                        <p className="text-sm text-muted-foreground">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <header className="space-y-3 text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">Why cooks love RecipeApp</span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Designed for busy kitchens</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              From weeknight dinners to weekend experiments, our workflow keeps everything organized so you spend less time juggling tabs and more time enjoying the meal.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Beautiful recipe pages
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Every recipe is displayed with clean layout, ingredient lists, and step-by-step instructions that look great on desktop and mobile.
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-primary" />
                  Share with friends
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Keep a communal cookbook, swap tips, and mark favorites so everyone in your circle knows what to try next.
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  Streamlined prep
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Quick-glance cooking times, servings, and difficulty give you the context you need before you even hit the kitchen.
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-8 rounded-3xl border bg-card p-8 md:grid-cols-[1.2fr_1fr] md:p-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
            <p className="text-muted-foreground">
              Whether you follow food creators or discover hidden gems, RecipeApp keeps the inspiration captured and ready when you are.
            </p>

            <ol className="space-y-5">
              {howItWorks.map((step) => (
                <li key={step.step} className="flex gap-4">
                  <span className="mt-1 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    {step.step.split('.')[0]}
                  </span>
                  <div>
                    <p className="font-semibold">{step.step}</p>
                    <p className="text-sm text-muted-foreground">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-muted/60 p-8">
            <div className="rounded-xl border bg-background p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Tonight's plan</p>
                  <h3 className="text-xl font-semibold">Lemon Herb Sheet-Pan Salmon</h3>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">30 min</span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Ingredients</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Salmon fillets</li>
                    <li>• Baby potatoes</li>
                    <li>• Lemon & garlic butter</li>
                    <li>• Fresh dill</li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Highlights</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>✓ One-pan cleanup</li>
                    <li>✓ Serves 4</li>
                    <li>✓ Imported from YouTube</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-primary/5 p-4 text-sm text-muted-foreground">
                Step 2 · Toss potatoes with olive oil, roast for 10 minutes. Add salmon, spoon lemon butter over top, bake until flaky. Finish with dill and serve.
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-background" />
          </div>
        </section>

      </main>
    </div>
  )
}
