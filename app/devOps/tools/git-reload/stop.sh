kill $(ps aux | grep 'git_auto_deploy_innox_website' | awk '{print $2}') || true

