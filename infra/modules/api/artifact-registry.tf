resource "google_artifact_registry_repository" "api_repo" {
  location      = var.region
  repository_id = var.image_repository_id
  description   = "Docker repository for VisibleFix API"
  format        = "DOCKER"
  project       = var.google_project_id

  depends_on = [google_project_service.artifact_registry_api]
}
