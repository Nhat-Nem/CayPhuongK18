import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { UpdateContactSettingsDTO } from './dto/contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) {}

    // METHOD: GET '/'
    @Get()
    getContact() {
        return this.contactService.getContactSettings()
    }

    // METHOD: PATCH
    @Patch()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    updateContact(@Body() contactSettingDTO: UpdateContactSettingsDTO) {
        return this.contactService.updateContactSettings(contactSettingDTO)
    }
}
