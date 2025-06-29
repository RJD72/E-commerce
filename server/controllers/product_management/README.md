### **1. getAllProducts Workflow**

```mermaid
graph TD
    A[Start] --> B[Parse Query Params]
    B --> C[Set Defaults: page=1, limit=12, sortBy='createdAt']
    C --> D[Calculate Skip Value]
    D --> E[Fetch Products from DB]
    E --> F[Populate Category Info]
    F --> G[Apply Pagination & Sorting]
    G --> H[Get Total Product Count]
    H --> I[Calculate Total Pages]
    I --> J[Return Response with Data & Pagination]
    J --> K[End]
```

**Key Notes:**

- **Pagination:** Uses `page` and `limit` query params to split results.
- **Sorting:** Defaults to `createdAt` but can be customized via `sortBy` and `order` (asc/desc).
- **Efficiency:** Uses MongoDB's `skip`, `limit`, and `sort` for optimized queries.
- **Response:** Includes metadata like `totalItems`, `currentPage`, and `totalPages`.

---

### **2. getProductById Workflow**

```mermaid
graph TD
    A[Start] --> B[Extract ID from Params]
    B --> C{Valid ID?}
    C -- Yes --> D[Find Product by ID]
    C -- No --> E[Return 400: Invalid ID]
    D --> F{Product Found?}
    F -- Yes --> G[Return 200 with Product Data]
    F -- No --> H[Return 404: Not Found]
    G --> I[End]
    H --> I
    E --> I
```

**Key Notes:**

- **Validation:** Checks for valid MongoDB `ObjectId`.
- **Error Handling:** Returns `404` if product not found, `500` for server errors.
- **Response:** Returns the full product document if found.

---

### **3. searchProducts Workflow**

```mermaid
graph TD
    A[Start] --> B[Parse Query Params]
    B --> C[Build Dynamic Query]
    C --> D[Keyword Search: Name/Description]
    D --> E[Apply Filters: Category, Brand, Price]
    E --> F[Set Pagination: page, limit]
    F --> G[Execute Query with Sorting]
    G --> H[Calculate Total Matches]
    H --> I[Return Paginated Results]
    I --> J[End]
```

**Key Notes:**

- **Dynamic Query:** Combines keyword search (regex) with exact filters (category/brand).
- **Price Range:** Uses `$gte` (min) and `$lte` (max) for numeric filtering.
- **Sorting:** Applied at DB level for efficiency.
- **Pagination:** Similar to `getAllProducts` but with filter-aware totals.

---

### **4. addReview Workflow**

```mermaid
graph TD
    A[Start] --> B[Extract Rating/Comment from Body]
    B --> C[Find Product by ID]
    C --> D{Product Exists?}
    D -- No --> E[Return 404]
    D -- Yes --> F[Check for Duplicate Review]
    F --> G{Already Reviewed?}
    G -- Yes --> H[Return 400]
    G -- No --> I[Create Review Object]
    I --> J[Update Product Reviews]
    J --> K[Recalculate Rating/NumReviews]
    K --> L[Save Product]
    L --> M[Return 201 Success]
    M --> N[End]
```

**Key Notes:**

- **Authentication:** Assumes user is logged in (middleware handles this).
- **Duplicate Check:** Prevents multiple reviews per user.
- **Data Update:** Recalculates `rating` and `numReviews` dynamically.
- **Response:** Returns `201 Created` on success.

---

### **5. getProductReviews Workflow**

```mermaid
graph TD
    A[Start] --> B[Validate Product ID]
    B --> C{Valid ID?}
    C -- No --> D[Return 400]
    C -- Yes --> E[Find Product + Populate User Data]
    E --> F{Product Found?}
    F -- No --> G[Return 404]
    F -- Yes --> H[Sort Reviews: Date/Rating]
    H --> I[Paginate Results]
    I --> J[Return Response with Metadata]
    J --> K[End]
```

**Key Notes:**

- **Population:** Fetches reviewer names from User collection via `populate`.
- **Sorting:** Supports `date` (newest first) or `rating` (highest first).
- **Pagination:** Uses `slice` for in-memory pagination after sorting.
- **Response:** Includes reviewer names and pagination details.

---

### **6. deleteReview Workflow**

```mermaid
graph TD
    A[Start] --> B[Validate IDs]
    B --> C{Valid IDs?}
    C -- No --> D[Return 400]
    C -- Yes --> E[Find Product]
    E --> F{Product Found?}
    F -- No --> G[Return 404]
    F -- Yes --> H[Find Review Index]
    H --> I{Review Exists?}
    I -- No --> J[Return 404]
    I -- Yes --> K[Remove Review]
    K --> L[Update Rating/NumReviews]
    L --> M[Save Product]
    M --> N[Return 200 Success]
    N --> O[End]
```

**Key Notes:**

- **Admin-Only:** Assumes admin role is verified (middleware).
- **Cleanup:** Updates `rating` and `numReviews` after deletion.
- **Idempotent:** Returns `200` even if review was already deleted.

---

### **General Notes:**

- **Error Handling:** All controllers use `asyncHandler` to catch async errors.
- **Validation:** Joi schemas (not shown) validate input data before these workflows.
- **Security:** XSS sanitization is applied to user-generated content (e.g., reviews).
