package in.tucor.api.seller;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seller/profile")
public class SellerProfileController {
    private final SellerProfileService service;
    public SellerProfileController(SellerProfileService service) { this.service = service; }
    @GetMapping public SellerProfileDtos.Profile get(Authentication a) { return service.get(a.getName()); }
    @PatchMapping public SellerProfileDtos.Profile patch(Authentication a, @Valid @RequestBody SellerProfileDtos.Patch r) { return service.patch(a.getName(), r); }
}
