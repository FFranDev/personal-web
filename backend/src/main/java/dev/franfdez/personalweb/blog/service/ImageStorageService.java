package dev.franfdez.personalweb.blog.service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ImageStorageService {

    private final Path uploadPath;

    public ImageStorageService(@Value("${app.upload.dir}") String uploadDir) {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadPath);
        } catch (IOException ex) {
            throw new RuntimeException("Could not initialize upload directory", ex);
        }
    }

    public List<String> storeImages(List<MultipartFile> files) {
        List<String> storedFilenames = new ArrayList<>();
        if (files == null || files.isEmpty()) {
            return storedFilenames;
        }

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image files are allowed");
            }

            String extension = extractExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + extension;

            try {
                Path targetLocation = this.uploadPath.resolve(filename).normalize();
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                storedFilenames.add(filename);
            } catch (IOException ex) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store image");
            }
        }

        return storedFilenames;
    }

    public Resource loadImageAsResource(String filename) {
        try {
            Path filePath = this.uploadPath.resolve(filename).normalize();
            if (!filePath.startsWith(this.uploadPath)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file path");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found");
        } catch (MalformedURLException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found");
        }
    }

    public void deleteImages(List<String> filenames) {
        if (filenames == null) return;
        for (String filename : filenames) {
            try {
                Path filePath = this.uploadPath.resolve(filename).normalize();
                if (filePath.startsWith(this.uploadPath)) {
                    Files.deleteIfExists(filePath);
                }
            } catch (IOException ignored) {
                // Ignore deletion failure of single file so transaction can complete
            }
        }
    }

    private String extractExtension(String originalFilename) {
        if (originalFilename == null) return ".png";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0 && dotIndex < originalFilename.length() - 1) {
            return originalFilename.substring(dotIndex).toLowerCase();
        }
        return ".png";
    }
}