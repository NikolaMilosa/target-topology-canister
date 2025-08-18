#!/bin/env bash
set -euo pipefail

subnet_topic_map_link="https://raw.githubusercontent.com/dfinity/dre/refs/heads/main/rs/cli/src/assets/subnet_topic_map.json"
repo_root=$(git rev-parse --show-toplevel)
target_dir=$repo_root/src/target_topology_frontend/src/config/
target_file=$target_dir/subnet_forum_map.jsx

mkdir -p $target_dir
touch $target_file

map=$(curl $subnet_topic_map_link)

cat << _EOF > "$target_file"
export default function subnetForumMap() {
  const data = $map;

  return new Map(Object.entries(data));
}
_EOF

echo "Generated $target_file"
