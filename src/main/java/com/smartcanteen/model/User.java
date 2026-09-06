package com.smartcanteen.model;

import java.sql.Timestamp;

public class User {
    private Long id;
    private String userId;
    private String studentId;
    private String name;
    private String email;
    private String mobile;
    private String passwordHash;
    private String role; // 'STUDENT' or 'ADMIN'
    private String accountStatus; // 'ACTIVE', 'INACTIVE'
    private boolean emailVerified;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public User() {}

    public User(Long id, String userId, String studentId, String name, String email, String mobile, String passwordHash, String role) {
        this.id = id;
        this.userId = userId;
        this.studentId = studentId;
        this.name = name;
        this.email = email;
        this.mobile = mobile;
        this.passwordHash = passwordHash;
        this.role = role;
        this.accountStatus = "ACTIVE";
        this.emailVerified = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAccountStatus() { return accountStatus; }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
}
