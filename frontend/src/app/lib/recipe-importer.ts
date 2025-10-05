
import axios from 'axios'
import * as cheerio from 'cheerio'
import { ImportedRecipe } from './types'

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
      // Call your Flask backend API instead of Gemini directly
      const response = await axios.post('http://localhost:3002/api/gemini', {
        prompt: `Extract recipe information from the following text and return it as a JSON object with this structure:\n{\n  "title": "Recipe title",\n  "description": "Brief description",\n  "ingredients": [{"name": "ingredient name", "amount": "quantity", "unit": "unit"}],\n  "steps": [{"order": 1, "instruction": "step instruction"}],\n  "cookingTime": 30,\n  "servings": 4,\n  "difficulty": "easy|medium|hard",\n  "cuisine": "cuisine type"\n}\nText: ${text}`
      });
      const content = response.data.result;
      const cleanedText = content.replace(/```[a-z]*\n?/g, "").replace(/```/g, "").trim();
      if (!cleanedText) return null;
      const recipeData = JSON.parse(cleanedText);
      return {
        ...recipeData,
        sourceUrl: '',
        sourceType: 'text' as const
      };
    } catch (error) {
      console.error('Error parsing recipe text:', error);
      return null;
    }
  }

  private static async importFromYouTube(url: string): Promise<ImportedRecipe | null> {
    try {
      const response = await axios.get(url)
      console.log(response)
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
