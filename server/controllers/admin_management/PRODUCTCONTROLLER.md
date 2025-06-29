### ✅ `createProduct` Controller

```mermaid
graph TD
  A1[Start: Admin Product Creation Request] --> B1{Image URLs or File Uploads?}
  B1 -->|Image URLs| C1[Validate URLs with validator.isURL]
  C1 --> D1[Add Valid URLs to imageList]

  B1 -->|File Uploads| E1[Start DB Session + Begin Transaction]
  E1 --> F1[For Each File: Check Type and Size]
  F1 --> G1[Upload to Cloudinary via upload_stream]
  G1 --> H1[On Success: Push secure_url to imageList]
  G1 --> I1[On Failure: Abort Transaction and Cleanup Uploaded Files]

  D1 --> J1[Validate Product Data: name, description, price, stock, images]
  H1 --> J1

  J1 -->|Invalid| K1[Return 400 with Detailed Errors]
  J1 -->|Valid| L1[Create New Product Instance]
  L1 --> M1[Save Product to DB]

  M1 -->|Success| N1[Return 201 with Product Data and Metadata]
  M1 -->|Failure| O1[Cleanup Cloudinary Resources and Return 500]
```

**📝 Notes:**

- Handles both image URLs and file uploads via Cloudinary.
- Includes comprehensive validation and error reporting.
- Uses DB transaction to ensure upload consistency.

---

### ✏️ `updateProductByIdAdmin` Controller

```mermaid
graph TD
  A2[Start: Admin Update Request] --> B2[Validate Product ID Format]
  B2 -->|Invalid| C2[Return 400 &quot;Invalid ID&quot;]
  B2 -->|Valid| D2[Find Product by ID in DB]
  D2 -->|Not Found| E2[Return 404 &quot;Product not found&quot;]
  D2 -->|Found| F2[Destructure New Data from req.body]

  F2 --> G2{New imageUrls or File Uploads?}
  G2 -->|imageUrls Present| H2[Replace imageList with imageUrls]
  G2 -->|File Uploads| I2[Validate Files and Upload to Cloudinary]
  I2 --> J2[Replace imageList with Uploaded URLs]

  H2 --> K2[Update Product Fields with New Data]
  J2 --> K2
  K2 --> L2[Save Product]

  L2 -->|Success| M2[Return 200 with Updated Product]
  L2 -->|Failure| N2[Return 500 &quot;Update Failed&quot;]
```

**📝 Notes:**

- Supports optional replacement of images.
- Fallbacks to original values if no new ones provided.
- Errors during upload handled cleanly.

---

### ❌ `deleteProductByIdAdmin` Controller

```mermaid
graph TD
  A3[Start: Admin Delete Request] --> B3[Extract Product ID from req.params]
  B3 --> C3[Find Product by ID]
  C3 -->|Not Found| D3[Return 404 &quot;Product not found&quot;]
  C3 -->|Found| E3[Delete Product from DB]
  E3 --> F3[Return 200 &quot;Product deleted successfully&quot;]
```

**📝 Notes:**

- Simple and safe delete process.
- Returns appropriate messages for success and not-found cases.
- Assumes deleteOne triggers pre-hooks if any.

---

Would you like me to export these as `.png` diagrams as well?
