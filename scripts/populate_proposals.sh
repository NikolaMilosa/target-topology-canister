#!/usr/bin/env bash
set -euo pipefail

CANISTER_NAME="target_topology_backend"
PROPOSALS_FILE="$HOME/Downloads/proposals.json"

# Build the full Candid vector
CANDID_VEC=$(jq -r '
  map(
    "record { " +
    "id = \(.id) : nat64; " +
    "title = \"\(.title)\"; " +
    "payload = variant { ChangeSubnetMembership = record { " +
      "subnet_id = principal \"\(.payload.subnet_id)\"; " +
      "node_ids_to_add = vec { " + (.payload.node_ids_add | map("principal \"" + . + "\"") | join("; ")) + " }; " +
      "node_ids_to_remove = vec { " + (.payload.node_ids_remove | map("principal \"" + . + "\"") | join("; ")) + " }; " +
    "} }; " +
    "timestamp_seconds = \(.proposal_timestamp_seconds) : nat64; " +
    "}"
  ) | join("; ")
' "$PROPOSALS_FILE")

# Wrap into Candid tuple
CANDID_ARG="( vec { ${CANDID_VEC} } )"

# Send in one call
echo "Submitting all proposals in a single call..."
dfx canister call "$CANISTER_NAME" add_proposals "$CANDID_ARG"
