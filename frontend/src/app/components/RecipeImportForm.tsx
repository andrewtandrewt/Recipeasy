'use client'


import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Link, Upload, FileText, Youtube, Music } from 'lucide-react'

export default function RecipeImportForm() {
	const [recipe, setRecipe] = useState("");
	const [submitted, setSubmitted] = useState(false);
    const [url, setUrl] = useState('')
    const [text, setText] = useState('')
    const [isImporting, setIsImporting] = useState(false)
    const [error, setError] = useState('')



  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

	return (
    // Import Recipe Form
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        {/* Title */}
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Recipe
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* URL, YouTube, or Text tabs */}
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              URL
            </TabsTrigger>
            <TabsTrigger value="youtube" className="flex items-center gap-2">
              <Youtube className="h-4 w-4" />
              YouTube
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Recipe URL
              </label>
              <Input
                type="url"
                placeholder="https://example.com/recipe"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                //disabled={isImporting || isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Paste a link to a recipe from any website
              </p>
            </div>
            <Button 
            //   onClick={handleUrlImport} 
              //disabled={isImporting || isLoading}
              className="w-full"
            >
                
              {/* {isImporting ? 'Importing...' : 'Import from URL'} */}
            </Button>
          </TabsContent>

          <TabsContent value="youtube" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                YouTube Video URL
              </label>
              <Input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                // disabled={isImporting || isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Paste a YouTube video URL with a recipe
              </p>
            </div>
            <Button 
            //   onClick={handleUrlImport} 
            //   disabled={isImporting || isLoading}
              className="w-full"
            >
              {/* {isImporting ? 'Importing...' : 'Import from YouTube'} */}
            </Button>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Recipe Text
              </label>
              <Textarea
                placeholder="Paste your recipe text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                // disabled={isImporting || isLoading}
                rows={8}
              />
              <p className="text-xs text-muted-foreground">
                Paste recipe text from any source. Our AI will extract the ingredients and steps.
              </p>
            </div>
            <Button 
            //   onClick={handleTextImport} 
            //   disabled={isImporting || isLoading}
              className="w-full"
            >
              {/* {isImporting ? 'Processing...' : 'Import from Text'} */}
            </Button>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
	);
}
