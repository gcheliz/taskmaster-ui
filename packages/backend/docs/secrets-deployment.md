# Secrets Management Deployment Guide

This guide covers how to deploy TaskMaster UI with different secrets management providers for production environments.

## Supported Providers

- **Environment Variables** (default, suitable for development)
- **AWS Secrets Manager** (recommended for AWS deployments)
- **Google Cloud Secret Manager** (recommended for GCP deployments)
- **Kubernetes Secrets** (recommended for Kubernetes deployments)

## Quick Start

### 1. Environment Variables (Default)

```bash
# .env.production
NODE_ENV=production
SECRETS_PROVIDER=env
JWT_SECRET=your-super-secure-jwt-secret-32-characters-minimum
ENCRYPTION_KEY=your-encryption-key-32-characters-minimum
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### 2. AWS Secrets Manager

```bash
# .env.production
NODE_ENV=production
SECRETS_PROVIDER=aws
AWS_DEFAULT_REGION=us-east-1
SECRETS_PREFIX=taskmaster/
SECRETS_TIMEOUT=5000
SECRETS_RETRIES=3
SECRETS_CACHE_TTL=300000
```

#### AWS Secrets Setup

1. Create secrets in AWS Secrets Manager:
   ```bash
   aws secretsmanager create-secret \
     --name "taskmaster/JWT_SECRET" \
     --description "JWT signing secret for TaskMaster UI" \
     --secret-string "your-super-secure-jwt-secret-32-characters-minimum"
   
   aws secretsmanager create-secret \
     --name "taskmaster/ENCRYPTION_KEY" \
     --description "Encryption key for TaskMaster UI" \
     --secret-string "your-encryption-key-32-characters-minimum"
   
   aws secretsmanager create-secret \
     --name "taskmaster/DATABASE_URL" \
     --description "Database connection string" \
     --secret-string "postgresql://user:pass@host:5432/db"
   ```

2. Install AWS SDK:
   ```bash
   pnpm add @aws-sdk/client-secrets-manager
   ```

3. Configure IAM permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "secretsmanager:GetSecretValue",
           "secretsmanager:ListSecrets"
         ],
         "Resource": "arn:aws:secretsmanager:*:*:secret:taskmaster/*"
       }
     ]
   }
   ```

### 3. Google Cloud Secret Manager

```bash
# .env.production
NODE_ENV=production
SECRETS_PROVIDER=gcp
GOOGLE_CLOUD_PROJECT=your-project-id
SECRETS_PREFIX=taskmaster-
SECRETS_TIMEOUT=5000
SECRETS_RETRIES=3
SECRETS_CACHE_TTL=300000
```

#### GCP Secrets Setup

1. Create secrets in Google Cloud Secret Manager:
   ```bash
   echo -n "your-super-secure-jwt-secret-32-characters-minimum" | \
     gcloud secrets create taskmaster-JWT_SECRET --data-file=-
   
   echo -n "your-encryption-key-32-characters-minimum" | \
     gcloud secrets create taskmaster-ENCRYPTION_KEY --data-file=-
   
   echo -n "postgresql://user:pass@host:5432/db" | \
     gcloud secrets create taskmaster-DATABASE_URL --data-file=-
   ```

2. Install Google Cloud SDK:
   ```bash
   pnpm add @google-cloud/secret-manager
   ```

3. Configure IAM permissions:
   ```bash
   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:your-service-account@your-project-id.iam.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

### 4. Kubernetes Secrets

```bash
# .env.production
NODE_ENV=production
SECRETS_PROVIDER=k8s
K8S_NAMESPACE=default
K8S_SECRET_NAME=taskmaster-secrets
SECRETS_TIMEOUT=5000
SECRETS_RETRIES=3
SECRETS_CACHE_TTL=300000
```

#### Kubernetes Secrets Setup

1. Create Kubernetes secret:
   ```bash
   kubectl create secret generic taskmaster-secrets \
     --from-literal=JWT_SECRET=your-super-secure-jwt-secret-32-characters-minimum \
     --from-literal=ENCRYPTION_KEY=your-encryption-key-32-characters-minimum \
     --from-literal=DATABASE_URL=postgresql://user:pass@host:5432/db \
     --namespace=default
   ```

2. Install Kubernetes client:
   ```bash
   pnpm add @kubernetes/client-node
   ```

3. Configure RBAC:
   ```yaml
   apiVersion: v1
   kind: ServiceAccount
   metadata:
     name: taskmaster-backend
     namespace: default
   ---
   apiVersion: rbac.authorization.k8s.io/v1
   kind: Role
   metadata:
     name: secret-reader
     namespace: default
   rules:
   - apiGroups: [""]
     resources: ["secrets"]
     verbs: ["get", "list"]
   ---
   apiVersion: rbac.authorization.k8s.io/v1
   kind: RoleBinding
   metadata:
     name: read-secrets
     namespace: default
   subjects:
   - kind: ServiceAccount
     name: taskmaster-backend
     namespace: default
   roleRef:
     kind: Role
     name: secret-reader
     apiGroup: rbac.authorization.k8s.io
   ```

## Docker Deployment Examples

### AWS Secrets Manager

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Install AWS CLI and configure credentials
RUN apk add --no-cache aws-cli
ENV AWS_DEFAULT_REGION=us-east-1
ENV SECRETS_PROVIDER=aws
ENV SECRETS_PREFIX=taskmaster/

CMD ["npm", "start"]
```

### Google Cloud Secret Manager

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Install Google Cloud SDK
RUN apk add --no-cache python3 py3-pip
RUN pip3 install google-cloud-secret-manager

ENV GOOGLE_CLOUD_PROJECT=your-project-id
ENV SECRETS_PROVIDER=gcp
ENV SECRETS_PREFIX=taskmaster-

CMD ["npm", "start"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: taskmaster-backend
  namespace: default
spec:
  replicas: 3
  selector:
    matchLabels:
      app: taskmaster-backend
  template:
    metadata:
      labels:
        app: taskmaster-backend
    spec:
      serviceAccountName: taskmaster-backend
      containers:
      - name: backend
        image: taskmaster-backend:latest
        env:
        - name: NODE_ENV
          value: "production"
        - name: SECRETS_PROVIDER
          value: "k8s"
        - name: K8S_NAMESPACE
          value: "default"
        - name: K8S_SECRET_NAME
          value: "taskmaster-secrets"
        ports:
        - containerPort: 3001
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRETS_PROVIDER` | Secrets provider to use | `env` |
| `SECRETS_PREFIX` | Prefix for secret names | - |
| `SECRETS_TIMEOUT` | Request timeout in milliseconds | `5000` |
| `SECRETS_RETRIES` | Number of retry attempts | `3` |
| `SECRETS_CACHE_TTL` | Cache TTL in milliseconds | `300000` |

### AWS Specific

| Variable | Description | Default |
|----------|-------------|---------|
| `AWS_DEFAULT_REGION` | AWS region | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | - |

### GCP Specific

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_CLOUD_PROJECT` | GCP project ID | - |
| `GOOGLE_APPLICATION_CREDENTIALS` | Service account key path | - |

### Kubernetes Specific

| Variable | Description | Default |
|----------|-------------|---------|
| `K8S_NAMESPACE` | Kubernetes namespace | `default` |
| `K8S_SECRET_NAME` | Secret name | `taskmaster-secrets` |

## Security Best Practices

### 1. Rotation Strategy

```bash
# Rotate secrets regularly
# AWS
aws secretsmanager rotate-secret --secret-id taskmaster/JWT_SECRET

# GCP
gcloud secrets versions add taskmaster-JWT_SECRET --data-file=new-secret.txt

# Kubernetes
kubectl create secret generic taskmaster-secrets-new \
  --from-literal=JWT_SECRET=new-secret \
  --dry-run=client -o yaml | kubectl apply -f -
```

### 2. Access Control

- Use least privilege principle
- Implement proper IAM roles and policies
- Enable audit logging
- Monitor secret access

### 3. Monitoring

```yaml
# Example monitoring configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: secrets-monitoring
data:
  config.yaml: |
    alerts:
      - name: SecretAccessFailure
        condition: "secrets_access_errors > 0"
        action: "notify_security_team"
      - name: UnauthorizedSecretAccess
        condition: "unauthorized_secret_access > 0"
        action: "alert_immediately"
```

## Troubleshooting

### Common Issues

1. **Provider Not Available**
   ```bash
   # Check provider status
   curl http://localhost:3001/health/secrets
   ```

2. **Permission Denied**
   ```bash
   # Verify IAM permissions
   # AWS
   aws sts get-caller-identity
   
   # GCP
   gcloud auth list
   
   # Kubernetes
   kubectl auth can-i get secrets
   ```

3. **Secret Not Found**
   ```bash
   # List available secrets
   # AWS
   aws secretsmanager list-secrets
   
   # GCP
   gcloud secrets list
   
   # Kubernetes
   kubectl get secrets
   ```

### Debug Commands

```bash
# Test secrets manager
pnpm run env:validate

# Check application logs
docker logs taskmaster-backend

# Test specific provider
node -e "
const { SecretsManager } = require('./dist/config/secrets-manager');
const sm = new SecretsManager({ provider: 'aws' });
sm.getSecret('JWT_SECRET').then(console.log);
"
```

## Migration Guide

### From Environment Variables to AWS

1. Create secrets in AWS Secrets Manager
2. Update environment configuration
3. Deploy with new configuration
4. Verify secrets are loaded correctly
5. Remove old environment variables

### Provider Switching

```javascript
// Runtime provider switching
const { getSecretsManager } = require('./dist/config/secrets-manager');

const sm = getSecretsManager();
await sm.switchProvider('aws');
```

## Support

For issues with secrets management:
1. Check provider availability
2. Verify permissions and configuration
3. Review application logs
4. Test with debug mode enabled