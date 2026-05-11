resource "google_service_account" "api_vm" {
  account_id   = local.runtime_service_account_id
  display_name = "VisibleFix API VM"
  description  = "Compute Engine service identity for the VisibleFix API"
  project      = var.google_project_id
}

resource "google_project_iam_member" "api_vm_artifact_registry_reader" {
  project = var.google_project_id
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${google_service_account.api_vm.email}"
}

resource "google_project_iam_member" "api_vm_log_writer" {
  project = var.google_project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.api_vm.email}"
}

resource "google_project_iam_member" "api_vm_metric_writer" {
  project = var.google_project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.api_vm.email}"
}

resource "google_project_iam_member" "deployer_artifact_registry_writer" {
  project = var.google_project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${local.deployer_service_account_email}"
}

resource "google_project_iam_member" "deployer_compute_instance_admin" {
  project = var.google_project_id
  role    = "roles/compute.instanceAdmin.v1"
  member  = "serviceAccount:${local.deployer_service_account_email}"
}

resource "google_service_account_iam_member" "deployer_api_vm_act_as" {
  service_account_id = google_service_account.api_vm.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${local.deployer_service_account_email}"
}

resource "google_project_iam_member" "deployer_service_usage_viewer" {
  project = var.google_project_id
  role    = "roles/serviceusage.serviceUsageViewer"
  member  = "serviceAccount:${local.deployer_service_account_email}"
}
