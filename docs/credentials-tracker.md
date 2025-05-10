# Credentials and Configuration Tracker

## Required Information
Please fill in the following information as we proceed with the setup:

### Domain Information
- [x] Domain Name: sharedvoices.dev
- [x] Domain Registrar: Cloudflare
- [x] DNS Provider: Cloudflare
- [ ] Cloudflare Zone ID: (To be added)
- [ ] SSL Certificate: (To be configured)

### Cloud Provider
- [x] Provider: Docker Desktop (Local)
- [x] Region: Local
- [ ] Cluster Name: docker-desktop
- [ ] Kubeconfig: (Local)

### Database Credentials
#### MongoDB
- [x] URI: mongodb://admin:admin123@localhost:27017
- [x] Database Name: sharedvoices
- [x] Username: admin
- [x] Password: admin123

#### PostgreSQL
- [x] URI: postgresql://admin:admin123@localhost:5432/sharedvoices
- [x] Database Name: sharedvoices
- [x] Username: admin
- [x] Password: admin123

#### Redis
- [x] URI: redis://localhost:6379
- [ ] Password: (Not set for local development)

#### Elasticsearch
- [x] URI: http://localhost:9200
- [ ] Username: (Security disabled for local development)
- [ ] Password: (Security disabled for local development)

### Security
- [ ] JWT Secret: (To be generated)
- [ ] API Keys: (To be configured)
- [ ] OAuth Credentials: (To be configured)

### Cloudflare
- [x] Account Email: emilicelestine@gmail.com
- [ ] API Token: (To be configured)
- [ ] Zone ID: (To be added)

### AWS (For Production)
- [ ] Access Key ID: (To be configured)
- [ ] Secret Access Key: (To be configured)
- [ ] Region: (To be configured)
- [ ] S3 Bucket: (To be configured)

## Setup Progress Tracker

### Infrastructure
- [x] Local Kubernetes (Docker Desktop)
- [x] Local Databases
- [ ] Domain Setup
- [ ] DNS Configuration
- [ ] SSL Certificate
- [ ] Production Infrastructure

### GitHub Configuration
- [ ] Environments
  - [ ] Staging
  - [ ] Production
- [ ] Secrets
  - [ ] KUBE_CONFIG
  - [ ] MONGODB_URI
  - [ ] POSTGRES_URI
  - [ ] JWT_SECRET
  - [ ] AWS_ACCESS_KEY_ID
  - [ ] AWS_SECRET_ACCESS_KEY
  - [ ] DOMAIN_NAME
  - [ ] CLOUDFLARE_API_TOKEN
  - [ ] LETSENCRYPT_EMAIL
  - [ ] CLOUDFLARE_ZONE_ID
  - [ ] INGRESS_IP

### DNS Configuration
- [ ] A Records
- [ ] CNAME Records
- [ ] SSL Certificate
- [ ] Cloudflare Configuration

### Monitoring Tools
- [ ] Prometheus
- [ ] Grafana
- [ ] Alert Manager

## Important Notes
- Keep this file secure and never commit it to version control
- Update this file whenever credentials or configurations change
- Use environment variables for sensitive information
- Regularly rotate passwords and keys
- Document any changes in the commit messages

## Last Updated
- Date: 2024-03-19
- Updated by: System

## Next Steps
1. [x] Set up local Kubernetes (Docker Desktop)
2. [x] Set up local databases
3. [ ] Configure domain and Cloudflare
4. [ ] Set up GitHub environments and secrets
5. [ ] Run infrastructure setup 