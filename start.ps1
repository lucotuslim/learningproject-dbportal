$env:DocApiClientSecret = Get-DBAKeyVaultSecretValue -KeyVault app121-dba-kv -SecretName doc-api-prod-clientsecret
npm run dev
