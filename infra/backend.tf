# Enable required APIs for the backend
resource "google_project_service" "compute_api" {
  project            = var.google_project_id
  service            = "compute.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "service_usage_api" {
  project            = var.google_project_id
  service            = "serviceusage.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "artifact_registry_api" {
  project            = var.google_project_id
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

locals {
  region                         = "us-central1"
  deployer_service_account_email = "github-actions-deployer@${var.google_project_id}.iam.gserviceaccount.com"
}

variable "api_zone" {
  type        = string
  description = "The Compute Engine zone for the API VM."
  default     = "us-central1-a"
}

variable "api_machine_type" {
  type        = string
  description = "The Compute Engine machine type for the API VM."
  default     = "e2-micro"
}

# Artifact Registry for Docker images
resource "google_artifact_registry_repository" "api_repo" {
  location      = local.region
  repository_id = "visiblefix-api"
  description   = "Docker repository for VisibleFix API"
  format        = "DOCKER"
  project       = var.google_project_id

  depends_on = [google_project_service.artifact_registry_api]
}

resource "google_service_account" "api_vm" {
  account_id   = "visiblefix-api-vm"
  display_name = "VisibleFix API VM"
  description  = "Compute Engine service identity for the VisibleFix API"
  project      = var.google_project_id
}

resource "google_project_iam_member" "api_vm_artifact_registry_reader" {
  project = var.google_project_id
  role    = "roles/artifactregistry.reader"
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

resource "google_compute_address" "api" {
  name    = "visiblefix-api-ip"
  project = var.google_project_id
  region  = local.region

  depends_on = [google_project_service.compute_api]
}

resource "google_compute_firewall" "api_http" {
  name    = "visiblefix-api-http"
  project = var.google_project_id
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["3000"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["visiblefix-api"]

  depends_on = [google_project_service.compute_api]
}

resource "google_compute_instance" "api" {
  name         = "visiblefix-api"
  project      = var.google_project_id
  zone         = var.api_zone
  machine_type = var.api_machine_type
  tags         = ["visiblefix-api"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
      size  = 20
      type  = "pd-standard"
    }
  }

  network_interface {
    network = "default"

    access_config {
      nat_ip = google_compute_address.api.address
    }
  }

  service_account {
    email  = google_service_account.api_vm.email
    scopes = ["cloud-platform"]
  }

  metadata_startup_script = <<-EOT
    #!/bin/bash
    set -euxo pipefail

    apt-get update
    apt-get install -y docker.io
    systemctl enable --now docker
    mkdir -p /opt/visiblefix
  EOT

  depends_on = [
    google_project_service.compute_api,
    google_project_iam_member.api_vm_artifact_registry_reader,
  ]
}

output "api_url" {
  value = "http://${google_compute_address.api.address}:3000"
}

output "api_ip" {
  value = google_compute_address.api.address
}
