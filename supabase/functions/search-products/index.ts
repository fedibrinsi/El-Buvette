/// <reference lib="deno.ns" />
import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get connection string from environment
  const databaseUrl = Deno.env.get('SUPABASE_DB_URL')!;
  
  // Create postgres connection
  const sql = postgres(databaseUrl, {
    prepare: false,
  });

  try {
    const { search } = await req.json();
    
    console.log(`[SEARCH] Query received: ${search}`);
    
    // Check if user is trying to query the database schema
    if (search.toLowerCase().includes('information_schema') || 
        search.toLowerCase().includes('pg_tables') ||
        search.toLowerCase().includes('tables')) {
      return new Response(
        JSON.stringify({ 
          results: [],
          schemaInfo: "TABLE: products | COLUMNS: id (int), name (text), description (text), price (decimal), category (text)\n\nTABLE: flags | COLUMNS: id (int), flag_value (text), hint (text)"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // VULNERABLE: Direct string concatenation - NO SANITIZATION
    // This allows UNION-based SQL injection
    const query = `SELECT id, name, description, price, category FROM products WHERE name ILIKE '%${search}%'`;
    
    console.log(`[SQL] Executing: ${query}`);
    
    // Execute raw SQL directly - intentionally vulnerable!
    const results = await sql.unsafe(query);
    
    console.log(`[SUCCESS] Returned ${results?.length || 0} results`);
    
    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[ERROR] ${errorMessage}`);
    
    // Return error details (intentionally verbose for CTF hints)
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        hint: "SQL syntax error detected. Check your query structure."
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } finally {
    await sql.end();
  }
});
