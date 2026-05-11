resource "google_compute_instance" "api" {
  name         = var.instance_name
  project      = var.google_project_id
  zone         = var.zone
  machine_type = var.machine_type
  tags         = [local.instance_tag]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
      size  = 20
      type  = "pd-standard"
    }
  }

  network_interface {
    network = var.network

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
    apt-get install -y curl docker.io
    systemctl enable --now docker
    mkdir -p /opt/visiblefix /var/log/visiblefix
    touch /var/log/visiblefix/api.log
    chmod 0644 /var/log/visiblefix/api.log

    curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
    bash add-google-cloud-ops-agent-repo.sh --also-install

    cat > /etc/google-cloud-ops-agent/config.yaml <<'CONFIG'
    logging:
      receivers:
        visiblefix_api:
          type: files
          include_paths:
            - /var/log/visiblefix/api.log
      processors:
        parse_visiblefix_json:
          type: parse_json
          time_key: time
          time_format: "%Y-%m-%dT%H:%M:%S.%L%Z"
      service:
        pipelines:
          visiblefix_api:
            receivers: [visiblefix_api]
            processors: [parse_visiblefix_json]
    CONFIG

    systemctl restart google-cloud-ops-agent
  EOT

  depends_on = [
    google_project_service.compute_api,
    google_project_service.logging_api,
    google_project_service.monitoring_api,
    google_project_iam_member.api_vm_artifact_registry_reader,
    google_project_iam_member.api_vm_log_writer,
    google_project_iam_member.api_vm_metric_writer,
  ]
}
