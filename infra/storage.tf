# Object Storage for VisibleFix (Staging & Production)

# Staging Bucket
resource "google_storage_bucket" "staging_uploads" {
  name           = "visiblefix-staging-uploads"
  location       = "us-central1"
  project        = var.google_project_id
  force_destroy  = true  # Easy cleanup for staging

  # Security: Uniform bucket-level access
  uniform_bucket_level_access = true

  # CORS for web uploads
  # Configured via google_storage_bucket_cors or application code
}

# Production Bucket
resource "google_storage_bucket" "production_uploads" {
  name           = "visiblefix-uploads"
  location       = "us-central1"
  project        = var.google_project_id
  force_destroy  = false  # Protect production data

  uniform_bucket_level_access = true
}

# Output bucket names
output "staging_bucket_name" {
  value = google_storage_bucket.staging_uploads.name
}

output "production_bucket_name" {
  value = google_storage_bucket.production_uploads.name
}
