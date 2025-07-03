Ah! Got it — you want **separate Mermaid workflows for each controller** in text format. Here's a breakdown of **each controller as its own Mermaid flowchart**, with full logic and decision points.

---

## 🧩 1. `updateUser` Controller — `PATCH /api/users/profile`

```mermaid
flowchart TD
  A[Client sends PATCH /api/users/profile with form data] --> B[authenticate middleware]
  B --> C[Controller: updateUser runs]

  C --> D[Sanitize input fields with xss]
  D --> E[Find user by ID using req.user._id]
  E --> F{User found?}

  F -- No --> G[Return 404: User not found]
  F -- Yes --> H{Image uploaded? #40;req.file#41;}

  H -- Yes --> I{Current image is custom?}
  I -- Yes --> J[Extract public_id from profileImage URL]
  J --> K[Call cloudinary.uploader.destroy#40;#41;]
  I -- No --> L[Skip deleting old image]

  K --> M[Upload new image using cloudinary.upload_stream]
  L --> M
  M --> N{Upload success?}
  N -- No --> O[Return 500: Cloudinary error]
  N -- Yes --> P[Set profileImage to Cloudinary URL]

  H -- No --> Q[Skip image processing]

  P --> R[Update name, email, phone, profileImage in DB]
  Q --> R
  R --> S[Return 200: updated user]
```

---

## 🧩 2. `getUser` Controller — `GET /api/users/profile`

```mermaid
flowchart TD
  A[Client sends GET /api/users/profile] --> B[authenticate middleware]
  B --> C[Controller: getUser runs]

  C --> D[Find user by req.user._id #40;excluding password#41;]
  D --> E{User found?}

  E -- No --> F[Return 404: User not found]
  E -- Yes --> G[Find all Orders where order.user === user._id]
  G --> H[Sort orders by createdAt: -1]
  H --> I[Return 200: JSON with user and orders]
```

---

### 🧠 Quick Tips

- `authenticate` middleware is shared between both controllers and must extract the JWT from headers (`Authorization: Bearer <token>`).
- The update controller depends on:

  - `multer` middleware to attach `req.file`
  - `cloudinary` and `streamifier` to handle uploads

- The get controller populates order history for dashboard views or user account pages.

---

Would you like me to include these workflows in a Markdown file or export to SVG or PNG later?
