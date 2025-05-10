#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Starting infrastructure setup...${NC}"

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}kubectl is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if helm is installed
if ! command -v helm &> /dev/null; then
    echo -e "${RED}helm is not installed. Please install it first.${NC}"
    exit 1
fi

# Create namespaces
echo -e "${GREEN}Creating namespaces...${NC}"
kubectl create namespace staging --dry-run=client -o yaml | kubectl apply -f -
kubectl create namespace production --dry-run=client -o yaml | kubectl apply -f -

# Add required Helm repositories
echo -e "${GREEN}Adding Helm repositories...${NC}"
helm repo add jetstack https://charts.jetstack.io
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Install cert-manager
echo -e "${GREEN}Installing cert-manager...${NC}"
helm upgrade --install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.12.0 \
  --set installCRDs=true

# Install NGINX Ingress Controller
echo -e "${GREEN}Installing NGINX Ingress Controller...${NC}"
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer

# Create ClusterIssuer for Let's Encrypt
echo -e "${GREEN}Creating Let's Encrypt ClusterIssuer...${NC}"
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: ${LETSENCRYPT_EMAIL}
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

# Create secrets namespace
echo -e "${GREEN}Creating secrets namespace...${NC}"
kubectl create namespace secrets --dry-run=client -o yaml | kubectl apply -f -

# Create secrets
echo -e "${GREEN}Creating secrets...${NC}"
kubectl create secret generic sharedvoices-secrets \
  --namespace secrets \
  --from-literal=mongodb-uri="${MONGODB_URI}" \
  --from-literal=postgres-uri="${POSTGRES_URI}" \
  --from-literal=jwt-secret="${JWT_SECRET}" \
  --dry-run=client -o yaml | kubectl apply -f -

# Apply Kubernetes configurations
echo -e "${GREEN}Applying Kubernetes configurations...${NC}"
kubectl apply -f config/kubernetes/staging/
kubectl apply -f config/kubernetes/production/

# Wait for cert-manager to be ready
echo -e "${GREEN}Waiting for cert-manager to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager -n cert-manager --timeout=300s

# Create DNS records using Cloudflare API
echo -e "${GREEN}Creating DNS records...${NC}"
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data "{
    \"type\": \"A\",
    \"name\": \"staging.${DOMAIN_NAME}\",
    \"content\": \"${INGRESS_IP}\",
    \"ttl\": 1,
    \"proxied\": true
  }"

curl -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data "{
    \"type\": \"A\",
    \"name\": \"api.${DOMAIN_NAME}\",
    \"content\": \"${INGRESS_IP}\",
    \"ttl\": 1,
    \"proxied\": true
  }"

echo -e "${GREEN}Infrastructure setup completed successfully!${NC}"
echo -e "${GREEN}Please verify the following:${NC}"
echo "1. DNS records are properly configured"
echo "2. SSL certificates are being issued"
echo "3. Services are accessible"
echo "4. Secrets are properly configured" 