output "url" {
  value = "http://${google_compute_address.api.address}:${var.api_port}"
}

output "ip" {
  value = google_compute_address.api.address
}
