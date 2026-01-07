# Environment Configuration README

This document explains the purpose and usage of the environment variables used by the application. These variables are typically defined in a `.env` or `.env.local` file.

> ⚠️ **Security Notice**  
> Never commit real credentials (database passwords, secrets, encryption keys) to source control. The values shown below are **examples only**.

---

## Application API Configuration

### `NEXT_PUBLIC_CONTROLSERVERAPI`

```env
#NEXT_PUBLIC_CONTROLSERVERAPI=http://192.168.100.161:3000/api,http://stupidme:3000/api
```

- **Description**: Public control server API endpoints used by the frontend.
- **Scope**: Exposed to the browser (`NEXT_PUBLIC_*`).
- **Format**: Comma-separated list of base API URLs.
- **Example Use Case**: Environment failover or multi-endpoint routing.

---

### `APPDAPIROOT`

```env
APPDAPIROOT=http://localhost:3000
```

- **Description**: Root URL for the internal application API.
- **Scope**: Server-side only.
- **Usage**: Used by backend services to construct API requests.

---

## Application Configuration Database

### `APPCONFIGDB`

```env
APPCONFIGDB=AdminDB
```

- **Description**: Database name that stores application configuration data.
- **Usage**: Queried during application startup and runtime for configuration values.

### `APPCONFIGSERVER`

```env
APPCONFIGSERVER=192.168.100.999
```

- **Description**: SQL Server host that contains the application configuration database.
- **Usage**: Used together with database credentials for configuration access.

---

## Database Connection Settings

### `DB_SERVER`

```env
DB_SERVER=192.168.100.888
```

- **Description**: SQL Server hostname or IP address.

### `DB_USER`

```env
DB_USER=testuser
```

- **Description**: SQL Server login username.
- **Optional**: Yes
- **Behavior**: If empty or not set, the application will attempt to use a **trusted (integrated) connection**.

### `DB_PASSWORD`

```env
DB_PASSWORD=TestUserPassword
```

- **Description**: SQL Server login password.
- **Optional**: Yes
- **Behavior**: If empty or not set, the application will attempt to use a **trusted (integrated) connection**.
- **Security**: Should be stored securely (e.g. secrets manager or environment injection).

---

## External API Secrets

### `DocApiClientSecret`

```env
DocApiClientSecret=mock-secret2
```

- **Description**: Client secret used to authenticate with the Document API.
- **Usage**: Used during token acquisition (e.g. OAuth client credentials flow).

---

## Encryption

### `ENCRYPTION_KEY`

```env
ENCRYPTION_KEY=keypleasehere
```

- **Description**: Symmetric encryption key used for encrypting and decrypting sensitive data.
- **Format**: Comma-separated list of integers (0–255).
- **Typical Length**: 32 bytes (256-bit key).
- **Important**: Changing this key will invalidate previously encrypted data.

---

## Password Pusher Integration

### `NEXT_PUBLIC_PWPUSHER_API_URL`

```env
#NEXT_PUBLIC_PWPUSHER_API_URL=http://192.168.100.152/
```

- **Description**: Base URL for the Password Pusher service.
- **Scope**: Public (used by frontend to generate password links).
- **Example Output**: `http://host/p/<token>`
- **Note**: Commented out when Password Pusher is not enabled.

---

## Recommended `.env.local` Example

```env
APPDAPIROOT=http://localhost:3000
APPCONFIGDB=AdminDB
APPCONFIGSERVER=192.168.100.151
DB_SERVER=192.168.100.151
DB_USER=sa
DB_PASSWORD=your-secure-password
DocApiClientSecret=your-secret
ENCRYPTION_KEY=...
```

---

## Best Practices

- Use **`.env.local`** for local development
- Use **CI/CD secrets** for staging and production
- Never expose secrets without the `NEXT_PUBLIC_` prefix
- Rotate secrets and encryption keys periodically

---

If you need environment-specific examples (Dev / Staging / Prod), let me know and I can add them.
