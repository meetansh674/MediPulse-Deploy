package com.medipulse.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class LabFileStorageService {

    private final Path baseDir;

    private static final long MAX_BYTES = 10 * 1024 * 1024;
    private static final List<String> ALLOWED_EXT = List.of("pdf", "jpg", "jpeg", "png");

    public LabFileStorageService(@Value("${app.upload.dir:uploads/lab-reports}") String uploadDir) {
        this.baseDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.baseDir);
        } catch (IOException e) {
        throw new IllegalStateException("Could not create upload directory", e);
    }
}

public String store(MultipartFile file) {
    if (file == null || file.isEmpty()) {
        throw new IllegalArgumentException("No file selected");
    }
if (file.getSize() > MAX_BYTES) {
    throw new IllegalArgumentException("File must be 10MB or smaller");
}
String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
String clean = original.replaceAll("[^A-Za-z0-9._-]", "_");
String ext = "";
int dot = clean.lastIndexOf('.');
if (dot >= 0) {
    ext = clean.substring(dot + 1).toLowerCase();
}
if (!ALLOWED_EXT.contains(ext)) {
    throw new IllegalArgumentException("Only PDF, JPG and PNG files are allowed");
}
String stored = UUID.randomUUID() + "_" + clean;
try {
    Path target = baseDir.resolve(stored).normalize();
    if (!target.startsWith(baseDir)) {
        throw new IllegalArgumentException("Invalid file name");
    }
Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
return stored;
} catch (IOException e) {
throw new IllegalStateException("Could not store file", e);
}
}

public Resource load(String filename) {
    String clean = filename == null ? "" : filename.replaceAll("[^A-Za-z0-9._-]", "");
    try {
        Path target = baseDir.resolve(clean).normalize();
        if (!target.startsWith(baseDir) || !Files.isRegularFile(target)) {
            throw new com.medipulse.backend.exception.ResourceNotFoundException("File not found");
        }
    return new FileSystemResource(target);
} catch (com.medipulse.backend.exception.ResourceNotFoundException e) {
throw e;
} catch (Exception e) {
throw new com.medipulse.backend.exception.ResourceNotFoundException("File not found");
}
}

public String contentType(String filename) {
    String lower = filename.toLowerCase();
    if (lower.endsWith(".pdf")) return "application/pdf";
    if (lower.endsWith(".png")) return "image/png";
    return "image/jpeg";
}
}
