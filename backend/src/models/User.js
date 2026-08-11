class User {
    constructor({
        id,
        name,
        email,
        passwordHash,
        timezone,
        createdAt,
        updatedAt,
    }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.timezone = timezone;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export default User;
