package webtech.online.course.configs;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.youtube.YouTube;
import com.google.api.services.youtube.YouTubeScopes;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Configuration
@Slf4j
public class YouTubeConfig {

        @Value("${youtube.client.secrets.file}")
        private String clientSecretsFile;

        @Value("${youtube.credentials.folder}")
        private String credentialsFolder;

        private static final String APPLICATION_NAME = "VideoUploadApp";
        private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
        private static final List<String> SCOPES = Arrays.asList(
                YouTubeScopes.YOUTUBE_UPLOAD,
                YouTubeScopes.YOUTUBE_READONLY
        );

        @Bean
        public YouTube youTube() throws GeneralSecurityException, IOException {
                final NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
                Credential credential = getCredentials(httpTransport);

                return new YouTube.Builder(httpTransport, JSON_FACTORY, credential)
                                .setApplicationName(APPLICATION_NAME)
                                .build();
        }

        private Credential getCredentials(final NetHttpTransport httpTransport) throws IOException {
                log.info("Đang load client secrets từ: {}", clientSecretsFile);

                GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(
                                JSON_FACTORY,
                                new InputStreamReader(
                                                Objects.requireNonNull(getClass().getClassLoader()
                                                                .getResourceAsStream(clientSecretsFile))));

                // Tạo thư mục credentials nếu chưa tồn tại
                File credentialDir = new File(credentialsFolder);
                if (!credentialDir.exists()) {
                        log.info("Tạo thư mục credentials: {}", credentialDir.getAbsolutePath());
                        credentialDir.mkdirs();
                }

                log.info("Sử dụng thư mục credentials: {}", credentialDir.getAbsolutePath());

                GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                                httpTransport, JSON_FACTORY, clientSecrets, SCOPES)
                                .setDataStoreFactory(new FileDataStoreFactory(credentialDir))
                                .setAccessType("offline")
                                .setApprovalPrompt("force") // Buộc hiển thị consent screen để lấy refresh token
                                .build();

                LocalServerReceiver receiver = new LocalServerReceiver.Builder()
                                .setPort(8888)
                                .build();

                log.info("Bắt đầu OAuth flow. Vui lòng mở browser để authorize...");
                Credential credential = new AuthorizationCodeInstalledApp(flow, receiver).authorize("user");
                log.warn("OAuth flow hoàn tất thành công! ");
                log.warn("Access Token: {}", credential.getAccessToken());
                log.warn("Refresh Token: {}", credential.getRefreshToken());
                log.warn("Token Expiration: {}", credential.getExpirationTimeMilliseconds());
                log.warn("Scopes: {}", credential.toString());

                return credential;
        }
}