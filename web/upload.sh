parent_path=$( cd "$(dirname "${BASH_SOURCE}")" ; pwd -P )
aws s3 cp --cache-control "no-cache" $parent_path s3://mindkeep.io/ --recursive
