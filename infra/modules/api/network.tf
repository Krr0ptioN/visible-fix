resource "google_compute_address" "api" {
  name    = local.address_name
  project = var.google_project_id
  region  = var.region

  depends_on = [google_project_service.compute_api]
}

resource "google_compute_firewall" "api_http" {
  name    = local.firewall_name
  project = var.google_project_id
  network = var.network

  allow {
    protocol = "tcp"
    ports    = [tostring(var.api_port)]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = [local.instance_tag]

  depends_on = [google_project_service.compute_api]
}
