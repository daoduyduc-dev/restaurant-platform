package com.restaurant.platform.common.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        uploadPath = Paths.get(uploadDir);
        try {
            Files.createDirectories(uploadPath.resolve("avatars"));
            Files.createDirectories(uploadPath.resolve("menu-items"));
            Files.createDirectories(uploadPath.resolve("tables"));
            log.info("Upload directories created at {}", uploadPath.toAbsolutePath());
        } catch (IOException e) {
            log.error("Could not create upload directories", e);
            throw new RuntimeException("Could not create upload directories!", e);
        }
    }

    /**
     * Store a file and return the filename
     */
    public String storeFile(MultipartFile file, String subDirectory) {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = "";
        
        if (originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        
        // Generate unique filename
        String fileName = UUID.randomUUID().toString() + fileExtension;
        
        Path targetDirectory = uploadPath.resolve(subDirectory);
        if (!Files.exists(targetDirectory)) {
            try {
                Files.createDirectories(targetDirectory);
            } catch (IOException e) {
                throw new RuntimeException("Could not create directory: " + targetDirectory, e);
            }
        }
        
        try {
            Path targetLocation = targetDirectory.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            log.info("File stored: {}", targetLocation.toAbsolutePath());
            return fileName;
        } catch (IOException e) {
            log.error("Could not store file", e);
            throw new RuntimeException("Could not store file!", e);
        }
    }

    /**
     * Store avatar image
     */
    public String storeAvatar(MultipartFile file) {
        return storeFile(file, "avatars");
    }

    /**
     * Store menu item image
     */
    public String storeMenuItemImage(MultipartFile file) {
        return storeFile(file, "menu-items");
    }

    /**
     * Store table/zone image
     */
    public String storeTableImage(MultipartFile file) {
        return storeFile(file, "tables");
    }

    /**
     * Delete a file
     */
    public void deleteFile(String fileName, String subDirectory) {
        try {
            Path filePath = uploadPath.resolve(subDirectory).resolve(fileName);
            Files.deleteIfExists(filePath);
            log.info("File deleted: {}", filePath.toAbsolutePath());
        } catch (IOException e) {
            log.warn("Could not delete file: {}", fileName, e);
        }
    }

    /**
     * Get the absolute path to upload directory
     */
    public String getUploadDir() {
        return uploadPath.toAbsolutePath().toString();
    }
}
