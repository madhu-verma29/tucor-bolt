package in.tucor.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import java.net.URI;
import java.nio.charset.StandardCharsets;

@Configuration @Profile("prod")
public class ProductionConfiguration {
 public ProductionConfiguration(Environment env){
  String secret=required(env,"JWT_SECRET");
  if(secret.getBytes(StandardCharsets.UTF_8).length<32||secret.contains("change-this")||secret.contains("development"))throw new IllegalStateException("JWT_SECRET must be a production secret of at least 32 bytes");
  required(env,"DATABASE_URL");required(env,"DATABASE_USERNAME");required(env,"DATABASE_PASSWORD");required(env,"MAIL_HOST");required(env,"MAIL_FROM");required(env,"UPLOAD_DIR");
  https(required(env,"WEB_URL"));for(String origin:required(env,"CORS_ORIGINS").split(","))https(origin.trim());
 }
 private static String required(Environment env,String key){String v=env.getProperty(key);if(v==null||v.isBlank())throw new IllegalStateException(key+" is required in production");return v;}
 private static void https(String value){URI uri=URI.create(value);if(!"https".equals(uri.getScheme())||uri.getHost()==null||value.contains("*")||uri.getUserInfo()!=null||"localhost".equals(uri.getHost()))throw new IllegalStateException("Production web URLs and origins must be explicit HTTPS URLs");}
}
