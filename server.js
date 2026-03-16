import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory database simulation (for local CTF)
const products = [
  { id: 1, name: 'Tropico', description: 'Bnin w bkolou vitamine', price: 1.2, category: 'Tropico' },
  { id: 2, name: 'Soufflet', description: 'Hrissa bel khobz', price: 2, category: 'Soufflet' },
  { id: 3, name: 'Prince', description: 'Choklata', price: 0.9, category: 'Prince' },
  { id: 4, name: 'Capucin', description: 'Me bel kahwa', price: 1.2, category: 'Capucin' },
  { id: 5, name: 'Eau', description: 'CyberQuest{m1yb2_f1k2_0r_m1yb2_n0t}', price: 0, category: 'Eau' }
];

const flags = [
  { id: 1, flag_value: 'CyberQuest{un10n_1nj3ct10n_m4st3r}', hint: 'Hidden in plain sight...' }
];

app.post('/functions/v1/search-products', (req, res) => {
  try {
    const { search } = req.body;
    
    console.log(`[SEARCH] Query received: ${search}`);
    
    // Check for schema info request
    if (search.toLowerCase().includes('information_schema') || 
        search.toLowerCase().includes('pg_tables') ||
        search.toLowerCase().includes('tables')) {
      return res.json({
        results: [],
        schemaInfo: "TABLE: products | COLUMNS: id (int), name (text), description (text), price (decimal), category (text)\n\nTABLE: flags | COLUMNS: id (int), flag_value (text), hint (text)\n"
      });
    }
    
    // VULNERABLE: Simulating SQL injection
    // Simulate the query: SELECT id, name, description, price, category FROM products WHERE name ILIKE '%${search}%'
    
    // Check for UNION injection
    if (search.includes('UNION') || search.includes('union')) {
      // Extract the UNION SELECT part and parse it
      const unionMatch = search.match(/union\s+select\s+(.+?)\s+from\s+flags/i);
      if (unionMatch) {
        // Enforce matching the products column count (5 columns)
        const columnsStr = unionMatch[1];
        const columns = columnsStr.split(',').map(s => s.trim());
        if (columns.length !== 5) {
          return res.status(400).json({
            error: "UNION SELECT column count mismatch",
            hint: "Match products columns: id, name, description, price, category (e.g., 1, flag_value, hint, 0::numeric, 'x')"
          });
        }

        // Return the flag data when column count matches
        const flagResult = {
          id: 1,
          name: flags[0].flag_value,
          description: flags[0].hint,
          price: 0,
          category: 'x'
        };
        return res.json({ results: [flagResult] });
      }
    }
    
    // Check for OR 1=1 injection
    if (search.match(/'\s*or\s+['"]?1['"]?\s*=\s*['"]?1/i)) {
      // Return all products
      return res.json({ results: products });
    }
    
    // Check for single quote (error simulation)
    if (search === "'" || search === "' --") {
      return res.status(400).json({
        error: "syntax error at or near \"'\"",
        hint: "SQL syntax error detected. Check your query structure."
      });
    }
    
    // Normal search
    const results = products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    
    console.log(`[SUCCESS] Returned ${results.length} results`);
    res.json({ results });
    
  } catch (err) {
    console.error(`[ERROR] ${err.message}`);
    res.status(400).json({
      error: err.message,
      hint: "SQL syntax error detected. Check your query structure."
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CTF Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Edge Function endpoint: http://localhost:${PORT}/functions/v1/search-products`);
});

