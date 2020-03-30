#!/bin/sh
## This script gets secrets from one-password and configures the environment automatically without code-changes whcih might be accidentally committed.

which op || ("This script uses the 1Password CLI tool (https://support.1password.com/command-line-getting-started/)" && exit 1);
eval $(op signin tryflux)

## Grab secrets for development
SECRET_PAIR_DEV=`op get item "Client Secrets - Dev" | jq -r .details.notesPlain | grep "| BMB |"`
FLUX_CLIENT_ID=`echo $SECRET_PAIR_DEV | cut -d$'|' -f2 | sed -e 's/^[ \t]*//' | sed -e 's/[ \t]*$//'`
FLUX_CLIENT_SECRET=`echo $SECRET_PAIR_DEV | cut -d$'|' -f4 | sed -e 's/^[ \t]*//' | sed -e 's/[ \t]*$//'`
echo FLUX_ENVIRONMENT=\"Development\" > .development.env
echo FLUX_CLIENT_ID=\"$FLUX_CLIENT_ID\" >> .development.env
echo FLUX_CLIENT_SECRET=\"$FLUX_CLIENT_SECRET\" >> .development.env
echo FLUX_API_URL_BASE=\"https://api.development.env.tryflux.com\" >> .development.env
echo FLUX_API_WEBHOOKS_URL_BASE=\"https://webhooks.development.env.tryflux.com\"  >> .development.env

## Grab secrets for preprod
SECRET_PAIR_PREPROD=`op get item "Client Secrets - PreProd" | jq -r .details.notesPlain | grep "| BMB |"`
FLUX_CLIENT_ID=`echo $SECRET_PAIR_PREPROD | cut -d$'|' -f2 | sed -e 's/^[ ]*//' | sed -e 's/[ ]*$//'`
FLUX_CLIENT_SECRET=`echo $SECRET_PAIR_PREPROD | cut -d$'|' -f4 | sed -e 's/^[ ]*//' | sed -e 's/[ ]*$//'`
echo FLUX_ENVIRONMENT=\"PreProd\" > .preprod.env
echo FLUX_CLIENT_ID=\"$FLUX_CLIENT_ID\" >> .preprod.env
echo FLUX_CLIENT_SECRET=\"$FLUX_CLIENT_SECRET\" >> .preprod.env
