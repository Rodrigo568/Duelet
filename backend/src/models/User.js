class User {
    constructor({ id, name, email, passwordHash, timezone, createdAt, updatedAt }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.timezone = timezone;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            timezone: this.timezone,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}

export default User;
