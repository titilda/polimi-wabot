#!/bin/bash
$NODE_ENV=production
cd "$(dirname "$0")"
node ./app.js