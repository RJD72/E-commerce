### 🛒 **1. `getUserCart` Controller**

```mermaid
flowchart TD
    A[Start] --> B[Extract user ID from req.user]
    B --> C[Find user by ID & populate cart.productId]
    C --> D{User exists?}
    D -->|No| E[Return 404 &quot;User not found&quot;]
    D -->|Yes| F[Return populated cart]
```

> **Notes**:
>
> - This controller assumes `req.user` is populated by auth middleware.
> - It uses `.populate(&quot;cart.productId&quot;)` to retrieve product details in the cart.
> - If the user is not found (deleted but token still valid), returns a 404.

### ➕ **2. `addToCart` Controller**

```mermaid
flowchart TD
    A[Start] --> B[Extract userId, productId, quantity from req.body]
    B --> C{Are productId &amp; quantity valid?}
    C -->|No| D[Return 400 &quot;Product ID and valid quantity required&quot;]
    C -->|Yes| E[Find product by ID]
    E --> F{Product found?}
    F -->|No| G[Return 404 &quot;Product not found&quot;]
    F -->|Yes| H{Stock available?}
    H -->|No| I[Return 400 &quot;Product is out of stock&quot;]
    H -->|Yes| J[Find user by ID]
    J --> K{User found?}
    K -->|No| L[Return 404 &quot;User not found&quot;]
    K -->|Yes| M{Product already in cart?}
    M -->|Yes| N[Calculate new quantity]
    N --> O{New quantity &gt; stock?}
    O -->|Yes| P[Return 400 &quot;Only X more available&quot;]
    O -->|No| Q[Update quantity in cart]
    M -->|No| R{Quantity &gt; stock?}
    R -->|Yes| S[Return 400 &quot;Only X in stock&quot;]
    R -->|No| T[Add new item to cart]
    Q --> U[Save user]
    T --> U
    U --> V[Find updated user with populate]
    V --> W[Return updated cart]
```

> **Notes**:
>
> - Handles both insert and update in a single route.
> - Strict quantity and stock validation.
> - Returns populated cart after updating.

### ✏️ **3. `updateCartItem` Controller**

```mermaid
flowchart TD
    A[Start] --> B[Extract userId, productId, quantity from req.body]
    B --> C{Are inputs valid?}
    C -->|No| D[Return 400 &quot;Product ID and valid quantity required&quot;]
    C -->|Yes| E[Find product by ID]
    E --> F{Product exists?}
    F -->|No| G[Return 404 &quot;Product not found&quot;]
    F -->|Yes| H{Quantity &gt; stock?}
    H -->|Yes| I[Return 400 &quot;Only X in stock&quot;]
    H -->|No| J[Find user by ID]
    J --> K{User exists?}
    K -->|No| L[Return 404 &quot;User not found&quot;]
    K -->|Yes| M[Find cart item by productId]
    M --> N{Item found?}
    N -->|No| O[Return 404 &quot;Item not in cart&quot;]
    N -->|Yes| P{Quantity === 0?}
    P -->|Yes| Q[Remove item from cart]
    P -->|No| R[Update item quantity]
    Q --> S[Save user]
    R --> S
    S --> T[Populate updated cart]
    T --> U[Return updated cart]
```

> **Notes**:
>
> - Allows setting quantity to 0 to remove the item.
> - Validates stock and ensures cart integrity.
> - Returns the fully populated cart.

### ❌ **4. `removeFromCart` Controller**

```mermaid
flowchart TD
    A[Start] --> B[Extract userId &amp; productId from req]
    B --> C{productId provided?}
    C -->|No| D[Return 400 &quot;Product ID is required&quot;]
    C -->|Yes| E[Find user by ID]
    E --> F{User exists?}
    F -->|No| G[Return 404 &quot;User not found&quot;]
    F -->|Yes| H{Item in cart?}
    H -->|No| I[Return 404 &quot;Product not in cart&quot;]
    H -->|Yes| J[Remove item from cart]
    J --> K[Save user]
    K --> L[Populate updated cart]
    L --> M[Return updated cart]
```

> **Notes**:
>
> - Ensures item is in cart before removing.
> - Removes item using `.filter(...)`.
> - Final response includes populated product data.
