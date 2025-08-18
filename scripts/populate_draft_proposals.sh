#!/usr/bin/env bash
set -euo pipefail

CANISTER_NAME="target_topology_backend"
PROPOSALS_FILE="$HOME/Downloads/draft_proposals.json"

# Build the full Candid vector
jq -r '
  .[] |
  # short subnet_id (first 5 chars, adjust if you want more)
  .subnet_id as $sid |
  ($sid | split("-")[0]) as $sid_short |

  "(record { " +
    "id = \"nim-draft-\($sid_short)\"; " +
    "title = \"Replace a node in subnet \($sid_short)\"; " +
    "payload = variant { ChangeSubnetMembership = record { " +
      "subnet_id = principal \"\($sid)\"; " +
      "node_ids_to_add = vec { " +
        (.added | map("principal \"" + .node_id + "\"") | join("; ")) +
      " }; " +
      "node_ids_to_remove = vec { " +
        (.removed | map("principal \"" + .node_id + "\"") | join("; ")) +
      " }; " +
    "}}; " +
    "timestamp_seconds = 1_755_265_242 : nat64; " +
  "})"
' "$PROPOSALS_FILE" | while IFS= read -r proposal; do
  echo "Submitting proposal:"
  echo "$proposal"
  echo "------------------------------------------------------------"
  dfx canister call --identity topology-draft target_topology_backend add_draft_proposal "$proposal"
done
