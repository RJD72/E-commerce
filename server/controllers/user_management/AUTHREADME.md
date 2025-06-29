# Authentication Controller Workflows

## 1. Register User Workflow

```mermaid
graph TD
    A[Start] --> B[Validate Input Data]
    B --> C{All fields present?}
    C -->|No| D[Return Error: Missing fields]
    C -->|Yes| E{Passwords match?}
    E -->|No| F[Return Error: Passwords don't match]
    E -->|Yes| G[Check if email exists]
    G -->|Exists| H[Return Error: Email exists]
    G -->|Not Exists| I[Hash Password]
    I --> J[Create New User]
    J --> K[Generate Verification Token]
    K --> L[Send Verification Email]
    L --> M[Return Success Response]
```

**Key Notes:**

- Input validation ensures all required fields are present and properly formatted
- Password matching is checked before any database operations
- Email uniqueness is verified to prevent duplicate accounts
- Password is hashed with bcrypt (10 salt rounds) before storage
- Verification token is JWT signed with JWT_SECRET, expires in 1 day
- Email contains link to verification endpoint with token as query param
- User is created with isVerified=false by default

## 2. Verify Email Workflow

```mermaid
graph TD
    A[Start] --> B[Extract Token from Query]
    B --> C[Verify JWT Token]
    C -->|Invalid| D[Return Error: Invalid/Expired Token]
    C -->|Valid| E[Decode User ID from Token]
    E --> F[Update User: isVerified=true]
    F --> G[Redirect to Success Page]
```

**Key Notes:**

- Token comes from URL query parameter
- JWT verification uses same JWT_SECRET as signing
- On success, updates user document atomically
- Redirects to frontend success page (SPA route)
- No sensitive operations performed before token validation
- Short-lived token (1 day) reduces security risks

## 3. Login User Workflow

```mermaid
graph TD
    A[Start] --> B[Find User by Email]
    B -->|Not Found| C[Return Error: Invalid credentials]
    B -->|Found| D[Compare Password Hash]
    D -->|No Match| C
    D -->|Match| E{User Verified?}
    E -->|No| F[Return Error: Verify email first]
    E -->|Yes| G[Generate Access Token]
    G --> H[Generate Refresh Token]
    H --> I[Set Refresh Token Cookie]
    I --> J[Return Access Token + User Info]
```

**Key Notes:**

- Email lookup includes password field (normally excluded)
- bcrypt.compare used for secure password verification
- Email verification is mandatory before login
- Access token is short-lived (typically 15-30 minutes)
- Refresh token is long-lived (30 days) and HTTP-only
- Cookie is secure in production, strict SameSite policy
- Returns minimal necessary user data to client

## 4. Logout User Workflow

```mermaid
graph TD
    A[Start] --> B[Clear Refresh Token Cookie]
    B --> C[Return Success Message]
```

**Key Notes:**

- Cookie expiration set to past date (immediately expires)
- HTTP-only flag maintained for security
- Simple response confirms logout success
- Client should delete access token from memory
- No server-side token invalidation needed (stateless JWT)

## 5. Refresh Token Workflow

```mermaid
graph TD
    A[Start] --> B[Get Refresh Token from Cookies]
    B -->|Missing| C[Return Error: No token]
    B -->|Present| D[Verify Token]
    D -->|Invalid| E[Return Error: Invalid token]
    D -->|Valid| F[Find User by ID]
    F -->|Not Found| G[Return Error: User not found]
    F -->|Found| H[Generate New Access Token]
    H --> I[Return New Access Token + User Info]
```

**Key Notes:**

- Only accepts refresh token from HTTP-only cookie
- Verifies against REFRESH_TOKEN_SECRET
- Generates fresh access token with same user claims
- Returns updated user data in case of changes
- Doesn't refresh the refresh token (rotation not implemented)
- Maintains session without requiring re-authentication

## 6. Forgot Password Workflow

```mermaid
graph TD
    A[Start] --> B[Find User by Email]
    B -->|Not Found| C[Return Error: User not found]
    B -->|Found| D{User Verified?}
    D -->|No| E[Return Error: Verify email first]
    D -->|Yes| F[Generate Random Token]
    F --> G[Hash Token for Storage]
    G --> H[Set Token + Expiry on User]
    H --> I[Save User]
    I --> J[Send Email with Reset Link]
    J --> K[Return Success Message]
```

**Key Notes:**

- Uses crypto for cryptographically secure random token
- Stores hashed version only (security best practice)
- Token expires in 1 hour (3600000 ms)
- Email contains unhashed token in reset URL
- Verification requirement prevents email enumeration
- Doesn't reveal whether email exists in error message

## 7. Reset Password Workflow

```mermaid
graph TD
    A[Start] --> B[Hash Incoming Token]
    B --> C[Find User by Hashed Token]
    C -->|Not Found/Expired| D[Return Error: Invalid token]
    C -->|Valid| E[Hash New Password]
    E --> F[Clear Reset Token Fields]
    F --> G[Save User]
    G --> H[Return Success Message]
```

**Key Notes:**

- Hashes URL token to match database record
- Checks both token validity and expiration time
- Uses same bcrypt hashing as registration (10 rounds)
- Atomic clearing of token/expiry fields
- Secure even if attacker gains database access (hashed tokens)
- Immediate invalidation of reset link after use
