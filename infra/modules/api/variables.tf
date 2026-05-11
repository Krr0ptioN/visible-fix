variable "google_project_id" {
  type        = string
  description = "The Google Cloud project ID."
}

variable "region" {
  type        = string
  description = "The Google Cloud region for regional API resources."
}

variable "zone" {
  type        = string
  description = "The Compute Engine zone for the API VM."
}

variable "machine_type" {
  type        = string
  description = "The Compute Engine machine type for the API VM."
}

variable "api_port" {
  type        = number
  description = "The public API container port."
  default     = 3000
}

variable "network" {
  type        = string
  description = "The VPC network name for the API VM."
  default     = "default"
}

variable "instance_name" {
  type        = string
  description = "The Compute Engine API VM name."
  default     = "visiblefix-api"
}

variable "image_repository_id" {
  type        = string
  description = "Artifact Registry repository ID for API Docker images."
  default     = "visiblefix-api"
}

variable "deployer_service_account_id" {
  type        = string
  description = "Service account ID used by GitHub Actions deployments."
  default     = "github-actions-deployer"
}
