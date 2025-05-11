# Set base URL
$baseUrl = "http://localhost:4000"

# Register a new user with author role
$registerBody = @{
    email = "test5@example.com"
    password = "password123"
    name = "Test Author"
    role = "author"
} | ConvertTo-Json

Write-Host "Registering author user..."
try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "Registration response: $($registerResponse | ConvertTo-Json)"
} catch {
    Write-Host "Registration failed: $_"
    exit 1
}

# Login to get token
$loginBody = @{
    email = "test5@example.com"
    password = "password123"
} | ConvertTo-Json

Write-Host "`nLogging in..."
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "Login response: $($loginResponse | ConvertTo-Json)"
} catch {
    Write-Host "Login failed: $_"
    exit 1
}

$token = $loginResponse.token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Create a test article
$articleBody = @{
    title = "Test Article"
    content = "This is a test article for analytics"
} | ConvertTo-Json

Write-Host "`nCreating test article..."
try {
    $articleResponse = Invoke-RestMethod -Uri "$baseUrl/api/articles" -Method Post -Headers $headers -Body $articleBody
    Write-Host "Article creation response: $($articleResponse | ConvertTo-Json)"
} catch {
    Write-Host "Article creation failed: $_"
    exit 1
}

$articleId = $articleResponse.id

# Track article view
$viewBody = @{
    articleId = $articleId
} | ConvertTo-Json

Write-Host "`nTracking article view..."
try {
    $viewResponse = Invoke-RestMethod -Uri "$baseUrl/api/analytics/articles/$articleId/view" -Method Post -Headers $headers -Body $viewBody
    Write-Host "View tracking response: $($viewResponse | ConvertTo-Json)"
} catch {
    Write-Host "View tracking failed: $_"
}

# Get article analytics
Write-Host "`nGetting article analytics..."
try {
    $analyticsResponse = Invoke-RestMethod -Uri "$baseUrl/api/analytics/articles/$articleId/analytics" -Method Get -Headers $headers
    Write-Host "Analytics response: $($analyticsResponse | ConvertTo-Json)"
} catch {
    Write-Host "Analytics retrieval failed: $_"
}

# Track user engagement
$engagementBody = @{
    articleId = $articleId
    type = "like"
} | ConvertTo-Json

Write-Host "`nTracking user engagement..."
try {
    $engagementResponse = Invoke-RestMethod -Uri "$baseUrl/api/analytics/engagement" -Method Post -Headers $headers -Body $engagementBody
    Write-Host "Engagement tracking response: $($engagementResponse | ConvertTo-Json)"
} catch {
    Write-Host "Engagement tracking failed: $_"
} 