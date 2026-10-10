package com.example.projectname.user.dto;

import com.example.projectname.user.RoleName;
import jakarta.validation.constraints.NotEmpty;
import java.util.Set;

public record UpdateRolesRequest(@NotEmpty Set<RoleName> roles) {}
