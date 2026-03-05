$env:DocApiClientSecret = Get-DBAKeyVaultSecretValue -KeyVault app121-dba-kv -SecretName doc-api-prod-clientsecret
$env:PORT=3001
npm run dev
