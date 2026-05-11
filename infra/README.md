# Google Maps Platform Infrastructure (Terraform)

This Terraform configuration automates the setup of Google Maps for the VisibleFix project. It enables the necessary APIs and creates a **restricted** API key suitable for frontend use.

## Prerequisites

1.  **Google Cloud Project:** You must have an existing Google Cloud Project.
2.  **Terraform:** Installed locally.
3.  **Authentication:** Authenticate your terminal with:
    ```bash
    gcloud auth application-default login
    ```

## Usage

1.  **Initialize Terraform:**
    ```bash
    terraform init
    ```

2.  **Plan the changes:**
    ```bash
    terraform plan -var="google_project_id=YOUR_PROJECT_ID"
    ```

3.  **Apply the configuration:**
    ```bash
    terraform apply -var="google_project_id=YOUR_PROJECT_ID"
    ```

## Low-Cost Secret Handling

Use GitHub Secrets as the source of truth for CI/CD secrets. This avoids adding Google Secret Manager unless the running service specifically needs to fetch secrets from GCP at runtime.

For GitHub Actions Terraform runs, expose Terraform variables through `TF_VAR_*` environment variables:

```yaml
env:
  TF_VAR_google_project_id: ${{ secrets.GCP_PROJECT_ID }}
```

For local plans, either export env vars:

```bash
export TF_VAR_google_project_id="visiblefix"
terraform plan
```

Real `.tfvars` files are ignored by Git.

Runtime secrets such as `DATABASE_URL`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` are set by the GitHub deployment workflow from GitHub Secrets. `DATABASE_URL` should be the Neon connection string.

## Security Best Practices

The generated API key is restricted by **HTTP Referrer** and **API Target**. This means:
*   Only the domains specified in `allowed_referrers` can use the key.
*   The key can *only* call the Maps JavaScript API.

## Variables

| Name | Description | Default |
|------|-------------|---------|
| `google_project_id` | Your Google Cloud Project ID | (Required) |
| `api_zone` | Compute Engine zone for the API VM | `us-central1-a` |
| `api_machine_type` | Compute Engine machine type for the API VM | `e2-micro` |
| `allowed_referrers` | List of allowed domains (e.g., `['visiblefix.dev/*', 'localhost:3000/*']`) | `['localhost:3000/*']` |

## Outputs

*   `google_maps_api_key`: The generated API key. Use this value for `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in your `.env` file.
*   `api_url`: Public API URL for the Compute Engine deployment.
*   `api_ip`: Static external IP for the API VM.
