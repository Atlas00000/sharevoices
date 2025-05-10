# Infrastructure Secrets and Configurations

## GitHub Secrets
These secrets should be added to your GitHub repository settings under Settings > Secrets and variables > Actions.

### Required Secrets
- `KUBE_CONFIG`: Base64 encoded kubeconfig file for cluster access
- `MONGODB_URI`: MongoDB connection string
- `POSTGRES_URI`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token generation
- `AWS_ACCESS_KEY_ID`: AWS access key for S3/CloudFront
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for S3/CloudFront
- `DOMAIN_NAME`: Your domain name (e.g., sharedvoices.com)
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token for DNS management
- `LETSENCRYPT_EMAIL`: Email for Let's Encrypt notifications

## Environment Variables
These variables should be set in your GitHub environments (staging and production).

### Staging Environment
```yaml
NODE_ENV: staging
API_URL: https://staging.sharedvoices.com
MONGODB_URI: ${MONGODB_URI}
POSTGRES_URI: ${POSTGRES_URI}
JWT_SECRET: ${JWT_SECRET}
```

### Production Environment
```yaml
NODE_ENV: production
API_URL: https://sharedvoices.com
MONGODB_URI: ${MONGODB_URI}
POSTGRES_URI: ${POSTGRES_URI}
JWT_SECRET: ${JWT_SECRET}
```

## DNS Configuration
- Main domain: sharedvoices.com
- Staging subdomain: staging.sharedvoices.com
- API subdomain: api.sharedvoices.com

## Certificate Configuration
- Provider: Let's Encrypt
- Type: Wildcard certificate (*.sharedvoices.com)
- Auto-renewal: Enabled via cert-manager

## Cluster Access
- Provider: [Your cloud provider]
- Region: [Your region]
- Cluster Name: sharedvoices-cluster
- Namespaces: staging, production

## Monitoring and Logging
- Prometheus: Enabled
- Grafana: Enabled
- ELK Stack: Enabled

## Backup Configuration
- Database backups: Daily
- Backup retention: 30 days
- Backup location: S3 bucket

## Security
- Network policies: Enabled
- Pod security policies: Enabled
- RBAC: Enabled

## Last Updated
- Date: [Current Date]
- Updated by: [Your Name] 