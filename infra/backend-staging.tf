# Staging Infrastructure for VisibleFix
# This creates separate staging resources for pre-production testing

# 1. Cloud SQL Instance (staging - can reuse same instance or create separate)
# For cost optimization, we reuse the same instance but separate DB

# 2. Staging Database
resource "google_sql_database" "staging_database" {
  name     = "visiblefix_staging"
  instance = google_sql_database_instance.postgres.name
  project  = var.google_project_id
}

# 3. Staging Database User
resource "google_sql_user" "staging_user" {
  name     = "visiblefix_staging_user"
  instance = google_sql_database_instance.postgres.name
  password = var.staging_db_password
  project  = var.google_project_id
}

# 4. Artifact Registry (reuse same, use tags)
# The existing api_repo can store both :latest and :staging tags

# 5. Cloud Run Service for Staging API
resource "google_cloud_run_v2_service" "api_staging" {
  name     = "visiblefix-api-staging"
  location = "us-central1"
  project  = var.google_project_id

  deletion_protection = false

  template {
    containers {
      image = "us-central1-docker.pkg.dev/${var.google_project_id}/${google_artifact_registry_repository.api_repo.repository_id}/visiblefix-api:staging"

      ports {
        container_port = 3000
      }
    }

    scaling {
      max_instance_count = 1
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  depends_on = [google_project_service.cloud_run_api]

  lifecycle {
    ignore_changes = [
      template[0].containers[0].env,
    ]
  }
}

# 6. Allow public access to Staging Cloud Run
resource "google_cloud_run_v2_service_iam_member" "staging_noauth" {
  location = google_cloud_run_v2_service.api_staging.location
  project  = var.google_project_id
  name     = google_cloud_run_v2_service.api_staging.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Output staging URLs
output "staging_api_url" {
  value = google_cloud_run_v2_service.api_staging.uri
}

output "staging_db_host" {
  value = google_sql_database_instance.postgres.public_ip_address
}

variable "staging_db_password" {
  type        = string
  description = "Password for the staging database user. Set with TF_VAR_staging_db_password from GitHub Secrets or local shell env."
  sensitive   = true
}
