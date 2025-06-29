## 📊 Admin User Controller Flowcharts

This section describes the flow of each admin controller using Mermaid flowcharts. These are helpful for understanding backend logic visually.

### 🔒 1. Deactivate User by ID

**Route:** `PUT /api/admin/users/:id/deactivate` **Description:** Suspends a user account (admin-only access)

```mermaid
flowchart TD
  A[Start: PUT /api/admin/users/:id/deactivate] --> B[Extract user ID from req.params]
  B --> C[Find user by ID in DB]
  C --> D{User Found#63;}
  D -- No --> E[Return 404: &quot;User not found&quot;]
  D -- Yes --> F{Is user same as logged-in admin#63;}
  F -- Yes --> G[Return 400: &quot;Admins cannot deactivate their own account&quot;]
  F -- No --> H[Set user.status = &quot;suspended&quot;]
  H --> I[Save updated user to DB]
  I --> J[Return 200: &quot;User account suspended successfully&quot;]
```

**Notes:**

- Prevents self-deactivation by checking `req.user._id`.
- Sets the `status` field to `&quot;suspended&quot;`.
- Provides clear error messages for each failure path.

---

### 📄 2. Get All Users (with Filters, Pagination, and Search)

**Route:** `GET /api/admin/users` **Description:** Retrieves all users with support for search, sort, pagination, and filtering.

```mermaid
flowchart TD
  A[Start: GET /api/admin/users] --> B[Extract query params: page, limit, sort, status, search]
  B --> C[Build MongoDB query object based on filters]
  C --> D[Apply search regex on name/email if search provided]
  D --> E[Find users in DB with query, exclude password/__v]
  E --> F[Apply sort, skip, limit]
  F --> G[Get total user count for pagination]
  G --> H[Return 200 with user data and pagination metadata]
```

**Notes:**

- Supports query parameters: `page`, `limit`, `sort`, `status`, `search`.
- Filters and searches users by name or email (case-insensitive).
- Returns clean user data and pagination info for frontend rendering.

---

### 👤 3. Get Single User with Orders

**Route:** `GET /api/admin/users/:id` **Description:** Fetches a user’s profile and their order history.

```mermaid
flowchart TD
  A[Start: GET /api/admin/users/:id] --> B[Extract user ID from req.params]
  B --> C[Find user by ID, exclude password]
  C --> D{User Found#63;}
  D -- No --> E[Return 404: &quot;User not found&quot;]
  D -- Yes --> F[Find all orders for the user, sorted by createdAt descending]
  F --> G[Return 200 with user profile and their orders]
```

**Notes:**

- Helps admins view individual user data and order history.
- Sensitive data like password is excluded.
- Orders are sorted by most recent first for better UX.
