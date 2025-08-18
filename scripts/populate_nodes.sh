#!/bin/env bash
set -euo pipefail

REGISTRY_JSON="$HOME/Downloads/registry.json"
BATCH_SIZE=50

total_nodes=$(jq '.nodes | length' "$REGISTRY_JSON")
echo "Total nodes: $total_nodes"

# Process in batches of $BATCH_SIZE
for start in $(seq 0 $BATCH_SIZE $((total_nodes - 1))); do
  end=$((start + BATCH_SIZE - 1))

  # Extract one batch and build Candid syntax
  nodes_candid=$(jq -r --argjson start "$start" --argjson end "$end" '
    .nodes[$start : ($end + 1)]
    | map(
        "record { " +
        "ip = \"" + (.http.ip_addr // "127.0.0.1") + "\"; " +
        "node_id = principal \"" + .node_id + "\"; " +
        "hostos_version = \"" + (.hostos_version_id // "") + "\"; " +
        "is_api_bn = " + (.is_api_bn | tostring) + "; " +
        "node_operator_id = principal \"" + .node_operator_id + "\"; " +
        "guestos_version = \"" + (.guestos_version_id // "") + "\"; " +
        "subnet_id = " + (if .subnet_id == null then "null" else "opt principal \"" + .subnet_id + "\"" end) + "; " +
        "node_provider_id = principal \"" + .node_provider_id + "\"; " +
        "node_reward_type = \"" + (.node_reward_type // "") + "\"; " +
        "dc_owner = \"" + (.dc_owner // "") + "\"; " +
        "country = \"" + (.country // "") + "\"; " +
        "dc_id = \"" + (.dc_id // "") + "\"; " +
        "}"
      )
    | join("; ")
  ' "$REGISTRY_JSON")

  if [[ -z "$nodes_candid" ]]; then
    continue
  fi

  candid_arg="(vec { ${nodes_candid} })"

  echo "Uploading nodes $((start + 1)) to $((end + 1))..."
  dfx canister call target_topology_backend add_nodes "$candid_arg"
done
