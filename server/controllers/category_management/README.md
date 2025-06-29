## 🧭 Category Controllers - Mermaid Flowcharts

### 1. `createCategory` Controller

```mermaid
graph TD
  A[Receive POST request to /api/categories] --> B[Extract name and description from req.body]
  B --> C[Check if Category.findOne#40;#41; with name exists]
  C -->|Yes| D[Return 400: 'Category already exists']
  C -->|No| E[Create new category using Category.create#40;#41;]
  E --> F[Return 201 with the new category object]
```

**Notes:**

- Ensures category name uniqueness.
- Responds with a 400 if name already exists.
- Returns the newly created category with 201 status on success.

### 2. `getAllCategories` Controller

```mermaid
graph TD
    A[Receive GET request to /api/categories] --> B[Call Category find and sort by name ascending]
  B --> C[Return 200 with sorted category list]
```

**Notes:**

- Retrieves and alphabetically sorts all categories.
- Public endpoint with minimal logic.

### 3. `getCategoryById` Controller

```mermaid
graph TD
  A[Receive GET request to /api/categories/&lt;id&gt;] --> B[Find category by ID using Category.findById#40;#41;]
  B -->|Not Found| C[Return 404: &quot;Category not found&quot;]
  B -->|Found| D[Return 200 with category data]
```

**Notes:**

- Simple ID-based lookup.
- Returns 404 if not found.

### 4. `updateCategory` Controller

```mermaid
graph TD
  A[Receive PUT request to /api/categories/&lt;id&gt;] --> B[Find category by ID using Category.findById#40;#41;]
  B -->|Not Found| C[Return 404: &quot;Category not found&quot;]
  B -->|Found| D[Update name and/or description if present in req.body]
  D --> E[Save updated category]
  E --> F[Return 200 with updated category]
```

**Notes:**

- Checks if the category exists.
- Updates name and/or description conditionally.
- Saves and returns the updated document.

### 5. `deleteCategory` Controller

```mermaid
graph TD
  A[Receive DELETE request to /api/categories/&lt;id&gt;] --> B[Find category by ID]
  B -->|Not Found| C[Return 404: &quot;Category not found&quot;]
  B -->|Found| D[Check if any Product uses this category]
  D -->|Yes| E[Return 400: &quot;Cannot delete category - products use it&quot;]
  D -->|No| F[Delete category using .remove#40;#41;]
  F --> G[Return 200: &quot;Category deleted&quot;]
```

**Notes:**

- Protects integrity by preventing deletion if products are assigned to the category.
- If no products use it, proceeds with deletion.
