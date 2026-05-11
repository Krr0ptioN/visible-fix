# Object Storage for VisibleFix

# Production Bucket
resource "google_storage_bucket" "production_uploads" {
  name           = "visiblefix-uploads"
  location       = "us-central1"
  project        = var.google_project_id
  force_destroy  = false  # Protect production data

  uniform_bucket_level_access = true
}

# Output bucket names
output "production_bucket_name" {
  value = google_storage_bucket.production_uploads.name
}
