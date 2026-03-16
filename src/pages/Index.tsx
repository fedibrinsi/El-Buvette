import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Terminal, Shield, Skull } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface SearchResult {
  results?: Product[];
  error?: string;
  hint?: string;
  schemaInfo?: string;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [queryLog, setQueryLog] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setHint(null);
    
    const logEntry = `> Searching for: "${searchQuery}"`;
    setQueryLog(prev => [...prev, logEntry]);

    try {
	const res = await fetch("/functions/v1/search-products", {
	  method: "POST",
	  headers: { "Content-Type": "application/json" },
	  body: JSON.stringify({ search: searchQuery }),
	});



      const response: SearchResult = await res.json();

      if (!res.ok) {
        setError(response.error || 'Request failed');
        setHint(response.hint || null);
        setQueryLog(prev => [...prev, `[ERROR] ${response.error}`]);
      } else if (response.schemaInfo) {
        setHint(response.schemaInfo);
        setResults([]);
        setQueryLog(prev => [...prev, `[INFO] ${response.schemaInfo}`]);
      } else {
        setResults(response.results || []);
        setQueryLog(prev => [...prev, `[OK] Found ${response.results?.length || 0} results`]);
      }

    } catch (err) {
      console.error("Search failed:", err);
      setError("Cannot connect to backend");
      setQueryLog(prev => [...prev, `[FATAL] Backend unreachable`]);
    } finally {
      setIsLoading(false);
    }
   };


  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Scanline overlay effect */}
      <div className="pointer-events-none fixed inset-0 z-50 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,0,0.03)_2px,rgba(0,255,0,0.03)_4px)]" />
      
      {/* Header */}
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Skull className="h-8 w-8 text-primary animate-pulse" />
            <div>
              <h1 className="text-2xl font-mono font-bold text-primary tracking-wider">
                El Buvette
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                // PRODUCT DATABASE v2.1.337
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Challenge Banner */}
        <Card className="mb-8 border-primary/50 bg-card/80 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-mono text-primary">
              <Shield className="h-5 w-5" />
              CTF CHALLENGE: DATA EXTRACTION
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground font-mono text-sm">
              Welcome, hacker. El Buvette's product database has a weakness.
              <br />
              <span className="text-primary">OBJECTIVE:</span> Extract the hidden flag from the database.
            </p>
          </CardContent>
        </Card>

        {/* Search Section */}
        <Card className="mb-8 border-muted bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono text-sm">
              <Search className="h-4 w-4" />
              PRODUCT_SEARCH.exe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter search query..."
                className="font-mono bg-background/50 border-muted focus:border-primary"
              />
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
                className="font-mono"
              >
                {isLoading ? "SCANNING..." : "EXECUTE"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-8 border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="font-mono text-sm text-destructive">
                [ERROR] {error}
              </p>
              {hint && (
                <p className="font-mono text-xs text-muted-foreground mt-2">
                  {hint}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Schema Info Display */}
        {!error && hint && (
          <Card className="mb-8 border-primary/50 bg-primary/10">
            <CardContent className="pt-6">
              <div className="space-y-3">
                {hint.split('\n').map((line, idx) => (
                  <p key={idx} className="font-mono text-xs text-primary whitespace-pre-wrap">
                    {line}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Grid */}
        {results.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {results.map((product, index) => (
              <Card 
                key={`${product.id}-${index}`} 
                className="border-muted/50 bg-card/60 backdrop-blur hover:border-primary/50 transition-colors"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="font-mono text-sm text-primary">
                    {product.name || `Item #${product.id}`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-2">
                    {product.description || 'No description available'}
                  </p>
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-muted-foreground">
                      [{product.category || 'unknown'}]
                    </span>
                    <span className="text-primary">
                      {product.price ? `$${product.price}` : '---'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Terminal Log */}
        <Card className="border-muted/30 bg-black/80">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <Terminal className="h-3 w-3" />
              SYSTEM_LOG
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-xs space-y-1 max-h-40 overflow-y-auto">
              {queryLog.length === 0 ? (
                <p className="text-muted-foreground/50">
                  Awaiting input...
                </p>
              ) : (
                queryLog.map((log, i) => (
                  <p 
                    key={i} 
                    className={
                      log.includes('[ERROR]') || log.includes('[FATAL]')
                        ? 'text-destructive'
                        : log.includes('[OK]')
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }
                  >
                    {log}
                  </p>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-muted/30 mt-12">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center font-mono text-xs text-muted-foreground/50">
            © 2087 El Buvette // ALL RIGHTS RESERVED // SYSTEM STATUS: VULNERABLE
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
