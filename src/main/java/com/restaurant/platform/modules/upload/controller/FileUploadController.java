package com.restaurant.platform.modules.upload.controller;

import com.restaurant.platform.common.service.FileStorageService;
import com.restaurant.platform.common.service.MediaUrlService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/uploads")
@RequiredArgsConstructor
@Tag(name = "File Upload", description = "File upload endpoints for avatars, menu items, etc.")
public class FileUploadController {

    private final FileStorageService fileStorageService;
    private final MediaUrlService mediaUrlService;

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload avatar image")
    @ApiResponse(responseCode = "200", description = "Avatar uploaded successfully",
            content = @Content(schema = @Schema(implementation = Map.class)))
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        validateImageFile(file);
        
        String fileName = fileStorageService.storeAvatar(file);
        String fileUrl = mediaUrlService.toPublicUrl("/uploads/avatars/" + fileName);
        
        return ResponseEntity.ok(Map.of(
                "fileName", fileName,
                "fileUrl", fileUrl,
                "message", "Avatar uploaded successfully"
        ));
    }

    @PostMapping(value = "/menu-items", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload menu item image")
    @ApiResponse(responseCode = "200", description = "Menu item image uploaded successfully",
            content = @Content(schema = @Schema(implementation = Map.class)))
    @PreAuthorize("hasAnyAuthority('MENU_CREATE', 'MENU_UPDATE', 'ADMIN')")
    public ResponseEntity<Map<String, String>> uploadMenuItemImage(@RequestParam("file") MultipartFile file) {
        validateImageFile(file);
        
        String fileName = fileStorageService.storeMenuItemImage(file);
        String fileUrl = mediaUrlService.toPublicUrl("/uploads/menu-items/" + fileName);
        
        return ResponseEntity.ok(Map.of(
                "fileName", fileName,
                "fileUrl", fileUrl,
                "message", "Menu item image uploaded successfully"
        ));
    }

    @PostMapping(value = "/tables", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload table/zone image")
    @ApiResponse(responseCode = "200", description = "Table image uploaded successfully",
            content = @Content(schema = @Schema(implementation = Map.class)))
    @PreAuthorize("hasAnyAuthority('TABLE_CREATE', 'TABLE_UPDATE', 'ADMIN')")
    public ResponseEntity<Map<String, String>> uploadTableImage(@RequestParam("file") MultipartFile file) {
        validateImageFile(file);
        
        String fileName = fileStorageService.storeTableImage(file);
        String fileUrl = mediaUrlService.toPublicUrl("/uploads/tables/" + fileName);
        
        return ResponseEntity.ok(Map.of(
                "fileName", fileName,
                "fileUrl", fileUrl,
                "message", "Table image uploaded successfully"
        ));
    }

    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }
        
        // Max 5MB
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size must be less than 5MB");
        }
    }
}
