## 📦 `getUserOrders` Controller

```mermaid
graph TD
    A[Start] --> B[Extract userId from req.user]
    B --> C[Query Order.find where user &equals; userId]
    C --> D[Populate &quot;items.product&quot; with name, price, images]
    D --> E[Sort orders by createdAt descending]
    E --> F[Return orders with 200 status]
```

### 🔍 Description

This controller handles fetching the order history for the currently logged-in user.

### 🧠 Notes

- Uses `req.user._id` to determine which user is making the request.
- Utilizes Mongoose's `.populate()` to include specific product details inside each order's items.
- Orders are sorted by creation date so the most recent appears first.
- Response is sent back as a JSON array of orders with `200 OK`.

## 🛒 `createOrder` Controller

```mermaid
graph TD
    A[Start] --> B[Extract userId from req.user]
    B --> C[Destructure items, shippingAddress, paymentMethod, totalAmount, paymentIntentId from req.body]
    C --> D{Check for required fields}
    D -->|Missing| E[Return 400 with &quot;Missing order details.&quot;]
    D -->|Present| F[Verify payment with Stripe using paymentIntentId]
    F --> G{Is payment status &equals;&equals; succeeded?}
    G -->|No| H[Return 400 with &quot;Payment not completed.&quot;]
    G -->|Yes| I[Loop through each item in items]
    I --> J[Find product by ID and check stock]
    J --> K{Is product found and stock sufficient?}
    K -->|No| L[Return 404 or 400 with error]
    K -->|Yes| M[Reduce product stock and save]
    M --> N[Create new order document]
    N --> O[Find user and push order._id into user.orders]
    O --> P[Save updated user]
    P --> Q[Generate PDF receipt for order]
    Q --> R[Send order confirmation email to user]
    R --> S[Send order notification email to admin]
    S --> T[Return 201 with success message and order]
```

### 🧠 Notes

- This controller is called **after** the Stripe payment is completed.
- Validates incoming data before processing.
- Retrieves and verifies the Stripe PaymentIntent to ensure payment went through.
- Each item is checked for inventory availability and stock is reduced accordingly.
- Creates an `Order` entry and links it to the user.
- Generates a PDF receipt and emails it to both the customer and the admin.
- Uses `path`, `nodemailer`, and a utility function (`generateReceipt`) for receipt creation and email delivery.
