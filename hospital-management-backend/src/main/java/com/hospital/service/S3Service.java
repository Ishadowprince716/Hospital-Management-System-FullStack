package com.hospital.service;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
public class S3Service {

    private static final Logger logger = LoggerFactory.getLogger(S3Service.class);

    @Value("${AWS_ACCESS_KEY_ID:}")
    private String accessKey;

    @Value("${AWS_SECRET_ACCESS_KEY:}")
    private String secretKey;

    @Value("${AWS_REGION:us-east-1}")
    private String region;

    @Value("${AWS_S3_BUCKET_NAME:}")
    private String bucketName;

    private AmazonS3 s3Client;
    private boolean isEnabled = false;

    @PostConstruct
    public void init() {
        if (isValid(accessKey) && isValid(secretKey) && isValid(bucketName)) {
            try {
                BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
                s3Client = AmazonS3ClientBuilder.standard()
                        .withCredentials(new AWSStaticCredentialsProvider(credentials))
                        .withRegion(region)
                        .build();
                isEnabled = true;
                logger.info("AWS S3 Service initialized successfully for bucket: " + bucketName);
            } catch (Exception e) {
                logger.error("Failed to initialize AWS S3 Service: " + e.getMessage());
                isEnabled = false;
            }
        } else {
            logger.warn("AWS S3 Service is disabled. Missing configuration.");
        }
    }

    public boolean isEnabled() {
        return isEnabled;
    }

    public String uploadFile(MultipartFile file, String fileName) throws IOException {
        if (!isEnabled) {
            throw new IllegalStateException("S3 Service is not enabled");
        }

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(file.getContentType());
        metadata.setContentLength(file.getSize());

        s3Client.putObject(new PutObjectRequest(bucketName, fileName, file.getInputStream(), metadata));

        return s3Client.getUrl(bucketName, fileName).toString();
    }

    public InputStream downloadFile(String fileName) {
        if (!isEnabled) {
            throw new IllegalStateException("S3 Service is not enabled");
        }

        S3Object s3Object = s3Client.getObject(bucketName, fileName);
        return s3Object.getObjectContent();
    }

    public void deleteFile(String fileName) {
        if (!isEnabled) {
            logger.warn("Attempted to delete file from S3 but service is disabled.");
            return;
        }

        s3Client.deleteObject(bucketName, fileName);
    }

    private boolean isValid(String value) {
        return value != null && !value.trim().isEmpty() && !value.contains("INSERT_YOUR");
    }
}
