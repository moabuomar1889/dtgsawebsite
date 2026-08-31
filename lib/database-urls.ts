type DatabaseEnvironment = {
    DATABASE_URL?: string;
    MIGRATION_DATABASE_URL?: string;
    DTG_DATABASE_BOOTSTRAP_ENABLED?: string;
};

type EnvironmentSource = NodeJS.ProcessEnv | DatabaseEnvironment;

export function getRuntimeDatabaseUrl(environment: EnvironmentSource = process.env) {
    return environment.DATABASE_URL?.trim();
}

export function requireBootstrapDatabaseUrl(
    environment: EnvironmentSource = process.env,
) {
    if (environment.DTG_DATABASE_BOOTSTRAP_ENABLED?.trim().toLowerCase() !== 'true') {
        throw new Error(
            'Database bootstrap is disabled. Set DTG_DATABASE_BOOTSTRAP_ENABLED=true for this one-time command.',
        );
    }

    const connectionString = environment.MIGRATION_DATABASE_URL?.trim();
    if (!connectionString) {
        throw new Error('MIGRATION_DATABASE_URL is required for database bootstrap');
    }

    return connectionString;
}
