# Set base URL
$baseUrl = "http://localhost:4000"

# Register a new user with author role
$registerBody = @{
    email = "test8@example.com"
    password = "password123"
    name = "Test Author"
    role = "author"
} | ConvertTo-Json

Write-Host "Registering author user..."
try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "Registration response: $($registerResponse | ConvertTo-Json -Depth 3)"
} catch {
    Write-Host "Registration failed: $_"
    exit 1
}

# Login to get token
$loginBody = @{
    email = "test8@example.com"
    password = "password123"
} | ConvertTo-Json

Write-Host "`nLogging in..."
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "Login response: $($loginResponse | ConvertTo-Json -Depth 3)"
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
    content = "This is a test article"
    category = "technology"
} | ConvertTo-Json

Write-Host "`nCreating test article..."
Write-Host "Request body: $articleBody"
Write-Host "Headers: $($headers | ConvertTo-Json -Depth 3)"

try {
    $articleResponse = Invoke-RestMethod -Uri "$baseUrl/api/articles" -Method Post -Headers $headers -Body $articleBody
    Write-Host "Article creation response: $($articleResponse | ConvertTo-Json -Depth 3)"
} catch {
    Write-Host "Article creation failed: $_"
    Write-Host "Status code: $($_.Exception.Response.StatusCode.value__)"
    
    try {
        $errorResponse = $_.ErrorDetails.Message
        Write-Host "Error details: $errorResponse"
        
        if ($errorResponse) {
            try {
                $errorJson = $errorResponse | ConvertFrom-Json
                Write-Host "Error JSON: $($errorJson | ConvertTo-Json -Depth 3)"
            } catch {
                Write-Host "Error response is not valid JSON"
            }
        }
    } catch {
        Write-Host "Error details not available: $_"
    }
    
    exit 1
}

Write-Host "`nTest completed successfully!"
