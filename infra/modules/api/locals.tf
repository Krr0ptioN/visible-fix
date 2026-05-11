locals {
  instance_tag                   = "visiblefix-api"
  address_name                   = "visiblefix-api-ip"
  firewall_name                  = "visiblefix-api-http"
  runtime_service_account_id     = "visiblefix-api-compute"
  deployer_service_account_email = "${var.deployer_service_account_id}@${var.google_project_id}.iam.gserviceaccount.com"
}
