# Run this script as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "Please run this script as Administrator!"
    exit
}

# Set base directory
$baseDir = Get-Location

# Function to set permissions for a directory
function Set-DirectoryPermissions {
    param (
        [string]$path
    )
    
    if (Test-Path $path) {
        $acl = Get-Acl $path
        $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
            "Everyone",
            "FullControl",
            "ContainerInherit,ObjectInherit",
            "None",
            "Allow"
        )
        $acl.SetAccessRule($rule)
        Set-Acl $path $acl
        Write-Host "Set permissions for: $path"
    }
}

# Function to create directory with proper permissions
function New-DirectoryWithPermissions {
    param (
        [string]$path
    )
    
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Force -Path $path | Out-Null
        Set-DirectoryPermissions $path
        Write-Host "Created directory with permissions: $path"
    }
}

# Create necessary directories
$directories = @(
    "client",
    "server/services/content",
    "server/services/user",
    "scripts"
)

foreach ($dir in $directories) {
    New-DirectoryWithPermissions $dir
}

# Set permissions for existing directories
Get-ChildItem -Recurse -Directory | ForEach-Object {
    Set-DirectoryPermissions $_.FullName
}

Write-Host "`nPermission setup complete!"
Write-Host "You can now create and edit files in the project directories." 