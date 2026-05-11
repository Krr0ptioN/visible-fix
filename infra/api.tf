locals {
  region = "us-central1"
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

module "api" {
  source = "./modules/api"

  google_project_id = var.google_project_id
  region            = local.region
  zone              = var.api_zone
  machine_type      = var.api_machine_type
}

output "api_url" {
  value = module.api.url
}

output "api_ip" {
  value = module.api.ip
}
