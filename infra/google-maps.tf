# Google Cloud Provider Configuration
# Ensure you have set GOOGLE_CREDENTIALS or run `gcloud auth application-default login`
provider "google" {
  project               = var.google_project_id
  region                = "us-central1"
  user_project_override = true
  billing_project       = var.google_project_id
}

variable "google_project_id" {
  type        = string
  description = "The Google Cloud Project ID"
}

variable "allowed_referrers" {
  type        = list(string)
  description = "List of domains allowed to use the browser key (e.g., ['localhost:3001/*', 'visfix.mardin.cc/*'])"
  default     = ["localhost:3001/*", "visfix.mardin.cc/*"]
}

variable "enable_geocoding_api" {
  type        = bool
  description = "Enable Geocoding API. Keep disabled unless explicitly needed to avoid extra billable usage."
  default     = false
}

# 1. Enable the Maps JavaScript API
resource "google_project_service" "maps_javascript_api" {
  project = var.google_project_id
  service = "maps-backend.googleapis.com"

  disable_on_destroy = false
}

# 2. (Optional) Enable Geocoding if needed later
resource "google_project_service" "geocoding_api" {
  count   = var.enable_geocoding_api ? 1 : 0
  project = var.google_project_id
  service = "geocoding-backend.googleapis.com"

  disable_on_destroy = false
}

# 3. Create and Restrict the Browser API Key
# Note: Google Cloud API Keys are a relatively new Terraform resource
resource "google_apikeys_key" "browser_key" {
  name         = "visiblefix-browser-key"
  display_name = "VisibleFix Browser Key (Maps)"
  project      = var.google_project_id

  # Restrictions: This is CRITICAL for security
  restrictions {
    # Browser (HTTP Referrer) restrictions
    browser_key_restrictions {
      allowed_referrers = var.allowed_referrers
    }

    # API restrictions: Only allow this key to call specific APIs
    api_targets {
      service = "maps-backend.googleapis.com"
    }
  }

  depends_on = [google_project_service.maps_javascript_api]
}

# Output the key (be careful with sensitive outputs in production)
output "google_maps_api_key" {
  value     = google_apikeys_key.browser_key.key_string
  sensitive = true
}
