#!/usr/bin/env bash

INPUT_FILE="$HOME/Downloads/137147.csv"
CANISTER_NAME="target_topology_backend"

# Prepare the argument for add_topology
ENTRIES="vec {"

first=true

while IFS=',' read -r subnet_type subnet_id _ subnet_size is_sev subnet_limit_node_provider subnet_limit_data_center _ _; do
    # Skip header
    if [[ "$subnet_type" == "subnet_type" ]]; then
        continue
    fi

    # Convert TRUE/FALSE to boolean
    if [[ "$is_sev" == "TRUE" ]]; then
        is_sev_bool="true"
    else
        is_sev_bool="false"
    fi

    # Comma separation
    if [ "$first" = true ]; then
        first=false
    else
        ENTRIES+="; "
    fi

    ENTRIES+="record { \"$subnet_id\"; record { \
subnet_type = \"$subnet_type\"; \
subnet_id = principal \"$subnet_id\"; \
subnet_size = $subnet_size; \
is_sev = $is_sev_bool; \
subnet_limit_node_provider = $subnet_limit_node_provider; \
subnet_limit_data_center = $subnet_limit_data_center \
} }"
done < "$INPUT_FILE"

ENTRIES+=" }"

# Call the canister with dfx
dfx canister call "$CANISTER_NAME" add_topology "( record { entries = $ENTRIES; proposal = \"137147\"; timestamp_seconds = 1755121667} )"
