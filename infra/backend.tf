# Enable required APIs for the backend
resource "google_project_service" "cloud_run_api" {
  project            = var.google_project_id
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "sql_admin_api" {
  project            = var.google_project_id
  service            = "sqladmin.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "artifact_registry_api" {
  project            = var.google_project_id
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

# 1. Cloud SQL Instance (Free Tier Optimized)
resource "google_sql_database_instance" "postgres" {
  name             = "visiblefix-db"
  database_version = "POSTGRES_15"
  region           = "us-central1"
  project          = var.google_project_id

  settings {
    tier = "db-f1-micro" # Free tier eligible

    ip_configuration {
      ipv4_enabled = true
    }

    backup_configuration {
      enabled = true
    }
  }

  deletion_protection = false # Set to true for production

  depends_on = [google_project_service.sql_admin_api]
}

resource "google_sql_database" "database" {
  name     = "visiblefix"
  instance = google_sql_database_instance.postgres.name
  project  = var.google_project_id
}

resource "google_sql_user" "users" {
  name     = "visiblefix_user"
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
  project  = var.google_project_id
}

locals {
  deployer_service_account_email = "github-actions-deployer@${var.google_project_id}.iam.gserviceaccount.com"
}

resource "google_project_iam_member" "cloudsql_client" {
  project = var.google_project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${local.deployer_service_account_email}"
}

# 2. Artifact Registry for Docker images
resource "google_artifact_registry_repository" "api_repo" {
  location      = "us-central1"
  repository_id = "visiblefix-api"
  description   = "Docker repository for VisibleFix API"
  format        = "DOCKER"
  project       = var.google_project_id

  depends_on = [google_project_service.artifact_registry_api]
}

# 3. Cloud Run Service for the API
resource "google_cloud_run_v2_service" "api" {
  name     = "visiblefix-api"
  location = "us-central1"
  project  = var.google_project_id

  deletion_protection = false

  template {
    containers {
      image = "us-central1-docker.pkg.dev/${var.google_project_id}/${google_artifact_registry_repository.api_repo.repository_id}/visiblefix-api:latest"

      ports {
        container_port = 3000
      }
    }

    scaling {
      max_instance_count = 1 # Keep it low for cost control
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

# Allow public access to Cloud Run (Optional, usually behind a load balancer or for dev)
resource "google_cloud_run_v2_service_iam_member" "noauth" {
  location = google_cloud_run_v2_service.api.location
  project  = var.google_project_id
  name     = google_cloud_run_v2_service.api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}


variable "db_password" {
  type        = string
  description = "The password for the database user"
  sensitive   = true
}

output "api_url" {
  value = google_cloud_run_v2_service.api.uri
}

output "db_host" {
  value = google_sql_database_instance.postgres.public_ip_address
}
