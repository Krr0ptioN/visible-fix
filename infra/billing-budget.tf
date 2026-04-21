data "google_project" "current" {
  project_id = var.google_project_id
}

variable "monthly_budget_amount_units" {
  type        = string
  description = "Monthly budget amount in whole units of the billing account currency."
  default     = "200"
}

variable "monthly_budget_currency_code" {
  type        = string
  description = "ISO 4217 currency code for monthly budget (must match billing account currency)."
  default     = "TRY"
}

variable "budget_notification_channels" {
  type        = list(string)
  description = "Optional Cloud Monitoring notification channel resource names for budget alerts."
  default     = []
}

variable "billing_account_id" {
  type        = string
  description = "Billing account ID (without the billingAccounts/ prefix) used to create budget alerts."
  default     = "014A32-BCA364-18E272"
}

resource "google_project_service" "pubsub_api" {
  project = var.google_project_id
  service = "pubsub.googleapis.com"

  disable_on_destroy = false
}

resource "google_pubsub_topic" "billing_budget_updates" {
  name    = "visiblefix-billing-budget-updates"
  project = var.google_project_id

  depends_on = [google_project_service.pubsub_api]
}

resource "google_pubsub_subscription" "billing_budget_updates_pull" {
  name    = "visiblefix-billing-budget-updates-pull"
  topic   = google_pubsub_topic.billing_budget_updates.name
  project = var.google_project_id

  ack_deadline_seconds       = 30
  message_retention_duration = "604800s"
}

resource "google_billing_budget" "visiblefix_monthly_budget" {
  billing_account = var.billing_account_id
  display_name    = "VisibleFix Monthly Budget Guardrail"
  ownership_scope = "BILLING_ACCOUNT"

  budget_filter {
    projects               = ["projects/${data.google_project.current.number}"]
    calendar_period        = "MONTH"
    credit_types_treatment = "INCLUDE_ALL_CREDITS"
  }

  amount {
    specified_amount {
      currency_code = var.monthly_budget_currency_code
      units         = var.monthly_budget_amount_units
    }
  }

  threshold_rules {
    threshold_percent = 0.5
    spend_basis       = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 0.8
    spend_basis       = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 0.9
    spend_basis       = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 1.0
    spend_basis       = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 1.0
    spend_basis       = "FORECASTED_SPEND"
  }

  all_updates_rule {
    pubsub_topic                     = google_pubsub_topic.billing_budget_updates.id
    schema_version                   = "1.0"
    monitoring_notification_channels = var.budget_notification_channels
    disable_default_iam_recipients   = false
    enable_project_level_recipients  = true
  }

  depends_on = [google_pubsub_topic.billing_budget_updates]
}

output "billing_budget_pubsub_topic" {
  value       = google_pubsub_topic.billing_budget_updates.id
  description = "Pub/Sub topic receiving regular budget spend updates."
}

output "billing_budget_pubsub_subscription" {
  value       = google_pubsub_subscription.billing_budget_updates_pull.id
  description = "Pull subscription for billing budget updates."
}
