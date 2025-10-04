import axios from 'axios'
import * as cheerio from 'cheerio'
import OpenAI from 'openai'
import { ImportedRecipe } from './types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export class RecipeImporter {
  static async importFromUrl(url: string): Promise<ImportedRecipe | null> {
    try {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return await this.importFromYouTube(url)
      } else if (url.includes('tiktok.com')) {
        return await this.importFromTikTok(url)
      } else {
        return await this.importFromWebPage(url)
      }
    } catch (error) {
      console.error('Error importing recipe from URL:', error)
      return null
    }
  }

  static async importFromText(text: string): Promise<ImportedRecipe | null> {
    try {
      const prompt = `
        Extract recipe information from the following text and return it as a JSON object with this structure:
        {
          "title": "Recipe title",
          "description": "Brief description",
          "ingredients": [{"name": "ingredient name", "amount": "quantity", "unit": "unit"}],
          "steps": [{"order": 1, "instruction": "step instruction"}],
          "cookingTime": 30,
          "servings": 4,
          "difficulty": "easy|medium|hard",
          "cuisine": "cuisine type"
        }

        Text: ${text}
      `

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      })

      const content = response.choices[0]?.message?.content
      if (!content) return null

      const recipeData = JSON.parse(content)
      return {
        ...recipeData,
        sourceUrl: '',
        sourceType: 'text' as const
      }
    } catch (error) {
      console.error('Error parsing recipe text:', error)
      return null
    }
  }

  private static async importFromYouTube(url: string): Promise<ImportedRecipe | null> {
    try {
      const response = await axios.get(url)
      const $ = cheerio.load(response.data)
      
      // Extract basic info from YouTube page
      const title = $('meta[property="og:title"]').attr('content') || 'Untitled Recipe'
      const description = $('meta[property="og:description"]').attr('content') || ''
      
      // Use AI to extract recipe from description
      if (description) {
        const recipeData = await this.importFromText(description)
        if (recipeData) {
          return {
            ...recipeData,
            sourceUrl: url,
            sourceType: 'youtube' as const
          }
        }
      }
      
      return {
        title,
        description,
        ingredients: [],
        steps: [],
        sourceUrl: url,
        sourceType: 'youtube' as const
      }
    } catch (error) {
      console.error('Error importing from YouTube:', error)
      return null
    }
  }

  private static async importFromTikTok(url: string): Promise<ImportedRecipe | null> {
    try {
      const response = await axios.get(url)
      const $ = cheerio.load(response.data)
      
      const title = $('meta[property="og:title"]').attr('content') || 'Untitled Recipe'
      const description = $('meta[property="og:description"]').attr('content') || ''
      
      // Use AI to extract recipe from description
      if (description) {
        const recipeData = await this.importFromText(description)
        if (recipeData) {
          return {
            ...recipeData,
            sourceUrl: url,
            sourceType: 'tiktok' as const
          }
        }
      }
      
      return {
        title,
        description,
        ingredients: [],
        steps: [],
        sourceUrl: url,
        sourceType: 'tiktok' as const
      }
    } catch (error) {
      console.error('Error importing from TikTok:', error)
      return null
    }
  }

  private static async importFromWebPage(url: string): Promise<ImportedRecipe | null> {
    try {
      const response = await axios.get(url)
      const $ = cheerio.load(response.data)
      
      // Look for structured data (JSON-LD)
      const jsonLd = $('script[type="application/ld+json"]').html()
      if (jsonLd) {
        try {
          const data = JSON.parse(jsonLd)
          const recipe = Array.isArray(data) ? data.find(item => item['@type'] === 'Recipe') : data
          
          if (recipe && recipe['@type'] === 'Recipe') {
            return {
              title: recipe.name || 'Untitled Recipe',
              description: recipe.description || '',
              ingredients: recipe.recipeIngredient?.map((ing: string, index: number) => ({
                name: ing,
                amount: '',
                unit: ''
              })) || [],
              steps: recipe.recipeInstructions?.map((step: any, index: number) => ({
                order: index + 1,
                instruction: typeof step === 'string' ? step : step.text || step.name || ''
              })) || [],
              cookingTime: recipe.totalTime ? this.parseTime(recipe.totalTime) : undefined,
              servings: recipe.recipeYield ? parseInt(recipe.recipeYield) : undefined,
              sourceUrl: url,
              sourceType: 'manual' as const
            }
          }
        } catch (e) {
          // Fall back to text extraction
        }
      }
      
      // Fall back to extracting text content
      const textContent = $('body').text()
      const recipeData = await this.importFromText(textContent)
      if (recipeData) {
        return {
          ...recipeData,
          sourceUrl: url,
          sourceType: 'manual' as const
        }
      }
      
      return null
    } catch (error) {
      console.error('Error importing from web page:', error)
      return null
    }
  }

  private static parseTime(timeString: string): number {
    // Parse ISO 8601 duration or simple time strings
    const match = timeString.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
    if (match) {
      const hours = parseInt(match[1] || '0')
      const minutes = parseInt(match[2] || '0')
      return hours * 60 + minutes
    }
    
    // Try to parse simple formats like "30 minutes", "1 hour", etc.
    const simpleMatch = timeString.match(/(\d+)\s*(hour|minute|hr|min)/i)
    if (simpleMatch) {
      const value = parseInt(simpleMatch[1])
      const unit = simpleMatch[2].toLowerCase()
      return unit.includes('hour') || unit.includes('hr') ? value * 60 : value
    }
    
    return 0
  }
}
