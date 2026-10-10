package com.example.projectname.common.exception;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

class GlobalExceptionHandlerTest {

  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(new ProbeController())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
  }

  @Test
  void validationFailuresReturnFieldErrorsKeyedByField() throws Exception {
    mockMvc
        .perform(
            post("/probe")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"\",\"code\":\"toolong\"}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Validation failed"))
        .andExpect(jsonPath("$.fieldErrors.name").isNotEmpty())
        .andExpect(jsonPath("$.fieldErrors.code").isNotEmpty())
        .andExpect(jsonPath("$.details").isArray())
        .andExpect(jsonPath("$.path").value("/probe"));
  }

  @Test
  void malformedJsonIsABadRequestNotAServerError() throws Exception {
    mockMvc
        .perform(post("/probe").contentType(MediaType.APPLICATION_JSON).content("{not json"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Malformed request body"));
  }

  @Test
  void notFoundAndDuplicateMapToTheirStatusCodes() throws Exception {
    mockMvc
        .perform(get("/probe/missing"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").value("Probe not found with id 7"))
        .andExpect(jsonPath("$.fieldErrors").isEmpty());
    mockMvc.perform(get("/probe/duplicate")).andExpect(status().isConflict());
  }

  record ProbeRequest(@NotBlank String name, @Size(max = 3) String code) {}

  @RestController
  static class ProbeController {

    @PostMapping("/probe")
    void create(@Valid @RequestBody ProbeRequest request) {}

    @GetMapping("/probe/missing")
    void missing() {
      throw ResourceNotFoundException.of("Probe", 7);
    }

    @GetMapping("/probe/duplicate")
    void duplicate() {
      throw new DuplicateResourceException("exists");
    }
  }
}
