package com.smartcanteen.security;

import com.smartcanteen.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserPrincipal implements UserDetails {
    private Long id;
    private String userId;
    private String studentId;
    private String name;
    private String email;
    private String password;
    private Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Long id, String userId, String studentId, String name, String email, String password, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.userId = userId;
        this.studentId = studentId;
        this.name = name;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    public static UserPrincipal create(User user) {
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase());
        return new UserPrincipal(
                user.getId(),
                user.getUserId(),
                user.getStudentId(),
                user.getName(),
                user.getEmail(),
                user.getPasswordHash(),
                Collections.singletonList(authority)
        );
    }

    public Long getId() { return id; }
    public String getUserId() { return userId; }
    public String getStudentId() { return studentId; }
    public String getName() { return name; }
    public String getEmail() { return email; }

    @Override
    public String getUsername() { return email; }

    @Override
    public String getPassword() { return password; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
